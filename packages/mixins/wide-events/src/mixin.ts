import {
  type LogLayer,
  type LogLayerMixin,
  LogLayerMixinAugmentType,
  type LogLayerMixinRegistration,
  type LogLayerPlugin,
  type LogLevelType,
} from "loglayer";
import type { EmitWideEventConfig, WideEventMixinOptions, WideEventSamplingConfig } from "./types.js";

/**
 * Log levels that default to rate=1 (error/fatal) — can be overridden via `perLevel` or callback.
 */
const EXEMPT_LEVELS = new Set(["error", "fatal"]);

/**
 * Normalize a boolean or numeric rate to a number in [0, 1].
 * `true` becomes 1, `false` becomes 0, numbers are clamped to [0, 1].
 * `NaN`, `Infinity`, and `-Infinity` are treated as 0 (drop all).
 */
function toRate(value: boolean | number | undefined): number {
  if (value === undefined) return 1;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Run rate-based sampling (default or per_level strategy).
 * Returns true if the rate check passes, false if dropped.
 * Returns true for error/fatal by default, unless their rate is explicitly set in `perLevel`.
 */
function runRateSampling(
  level: string,
  strategy: "default" | "per_level" | undefined,
  rate: boolean | number | undefined,
  perLevel?: Partial<Record<string, boolean | number>>,
): boolean {
  // error/fatal exempt UNLESS explicitly set in perLevel
  if (EXEMPT_LEVELS.has(level) && perLevel?.[level] === undefined) {
    return true;
  }

  if (strategy === "per_level" && perLevel) {
    const perRate = toRate(perLevel[level]);
    // Unmapped levels → use rate as fallback
    if (perLevel[level] === undefined) {
      const r = toRate(rate);
      if (r === 1) return true;
      if (r === 0) return false;
      return Math.random() < r;
    }
    if (perRate === 1) return true;
    if (perRate === 0) return false;
    return Math.random() < perRate;
  }

  const r = toRate(rate);
  if (r === 1) return true;
  if (r === 0) return false;
  return Math.random() < r;
}

/**
 * Creates a LogLayer mixin that adds wide event logging functionality.
 *
 * Wide events are comprehensive, self-contained log entries that capture an entire
 * operation's context and data in a single emission. This pattern helps with
 * observability by ensuring all relevant data is available in one log entry.
 *
 * @param options - Configuration options
 * @param options.asyncContext - An async context implementation for propagating
 *   wide event data across async boundaries. For Node.js, use `new AsyncLocalStorage()`
 *   from `async_hooks`. For browser environments, provide your own compatible implementation.
 * @param options.includeContext - Whether to include withContext() data in emitted wide events (default: true)
 *
 * @returns A LogLayer mixin registration object
 *
 * @example
 * ```typescript
 * import { AsyncLocalStorage } from "async_hooks";
 * import { LogLayer, StructuredTransport } from "loglayer";
 * import { createWideEventMixin } from "@loglayer/mixin-wide-events";
 *
 * const wideEventMixin = createWideEventMixin({
 *   asyncContext: new AsyncLocalStorage(),
 * });
 *
 * const log = new LogLayer({
 *   transport: new StructuredTransport({ logger: console }),
 *   mixins: [wideEventMixin],
 * });
 *
 * // Create a child logger for the request
 * const logger = log.child().withContext({ requestId: "123" });
 *
 * // Accumulate data throughout the request
 * logger.withWideEvents({ userId: "456" });
 * await doSomething();
 * logger.withWideEvents({ orderId: "789" });
 *
 * // Emit the wide event
 * logger.emitWideEvent({ message: "Request completed" });
 * ```
 */
export function createWideEventMixin(options: WideEventMixinOptions): LogLayerMixinRegistration {
  // Store the async context for use in methods
  const asyncContext = options.asyncContext;
  const includeContext = options.includeContext ?? true;
  const wideEventField = options.wideEventField;
  const errorsAsArray = options.errorsAsArray ?? false;
  // Default error field: "errors" for arrays, "error" for single
  const errorField = options.errorField ?? (errorsAsArray ? "errors" : "error");

  // Snapshot perLevel map at construction time
  const snapshotPerLevel = options.sampling?.perLevel ? { ...options.sampling.perLevel } : undefined;
  const samplingConfig: WideEventSamplingConfig | undefined = options.sampling
    ? {
        strategy: options.sampling.strategy ?? "default",
        rate: options.sampling.rate,
        perLevel: snapshotPerLevel,
        emitLevel: options.sampling.emitLevel,
        shouldEmit: options.sampling.shouldEmit,
        forceKeep: options.sampling.forceKeep,
      }
    : undefined;

  // Default error serializer - used if LogLayer has no errorSerializer configured
  function defaultErrorSerializer(err: any): Record<string, any> {
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }
    return { message: String(err) };
  }

  // Get error serializer - uses LogLayer's if configured, otherwise default
  function getErrorSerializer(self: any): (err: any) => Record<string, any> {
    const config = self.getConfig?.();
    if (config?.errorSerializer) {
      return config.errorSerializer;
    }
    return defaultErrorSerializer;
  }

  // Generate unique plugin ID to avoid conflicts
  const pluginId = `@loglayer/wide-events-context-tracker-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  /**
   * Context tracker plugin - stores context in async storage
   * for inclusion in wide events (only if includeContext is true)
   */
  const contextTrackerPlugin: LogLayerPlugin = {
    id: pluginId,
    onBeforeDataOut: (params) => {
      if (!includeContext) {
        return params.data;
      }

      const store = asyncContext.getStore();
      if (store && params.context && Object.keys(params.context).length > 0) {
        if (!store._llContext) {
          store._llContext = {};
        }
        Object.assign(store._llContext, params.context);
      }
      return params.data;
    },
  };

  /**
   * Deep merge utility - merges source into target recursively for nested objects.
   * Filters out dangerous keys to prevent prototype pollution attacks.
   * Uses WeakRef to detect circular references.
   */
  function deepMerge(
    target: Record<string, any>,
    source: Record<string, any>,
    visited: WeakSet<object> = new WeakSet(),
  ): Record<string, any> {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      // Skip dangerous prototype keys to prevent pollution attacks
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }

      const sourceValue = source[key];
      const targetValue = result[key];

      // If both values are plain objects, merge recursively
      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        // Detect circular reference - skip if already visited
        if (visited.has(sourceValue)) {
          continue;
        }
        visited.add(sourceValue);
        result[key] = deepMerge(targetValue, sourceValue, visited);
      } else {
        // Otherwise, overwrite (source wins)
        result[key] = sourceValue;
      }
    }
    return result;
  }

  /**
   * Implementation for withWideEvents
   */
  function withWideEventsImpl(data: Record<string, any>, self: any): any {
    const store = asyncContext.getStore();
    if (store) {
      if (!store._llWideEvents) {
        store._llWideEvents = {};
      }
      store._llWideEvents = deepMerge(store._llWideEvents, data);
    }
    return self;
  }

  /**
   * Implementation for getWideEvents
   */
  function getWideEventsImpl(key?: string, _self?: any): Record<string, any> | any {
    const store = asyncContext.getStore();
    const data = store?._llWideEvents;

    if (!data) {
      return key ? undefined : {};
    }

    if (key !== undefined) {
      return data[key];
    }

    // Return a copy to prevent external mutation
    return { ...data };
  }

  /**
   * Implementation for clearWideEvents
   */
  function clearWideEventsImpl(key: string | undefined, self: any): any {
    const store = asyncContext.getStore();
    if (store?._llWideEvents) {
      if (key !== undefined) {
        delete store._llWideEvents[key];
      } else {
        store._llWideEvents = {};
      }
    }
    return self;
  }

  /**
   * Implementation for withWideEventError
   */
  function withWideEventErrorImpl(error: any, self: any): any {
    const store = asyncContext.getStore();
    if (store) {
      const serializer = getErrorSerializer(self);
      const serializedError = serializer(error);

      if (errorsAsArray) {
        // Append to array
        if (!store._llWideEvents) {
          store._llWideEvents = {};
        }
        if (!store._llWideEvents[errorField]) {
          store._llWideEvents[errorField] = [];
        }
        store._llWideEvents[errorField].push(serializedError);
      } else {
        // Replace single error
        withWideEventsImpl({ [errorField]: serializedError }, self);
      }
    }
    return self;
  }

  /**
   * Logs a thrown sampling callback via console.error, gated on `consoleDebug`.
   * Matches loglayer's emit-path error convention (see LogLayer.ts:1457).
   */
  function logCallbackError(callbackName: string, err: unknown, self: any): void {
    if (self.getConfig?.()?.consoleDebug) {
      console.error(`[LogLayer] wide-events ${callbackName} callback threw; falling back:`, err);
    }
  }

  /**
   * Single sampling decision for an emit. Only called when a `forceKeep` or
   * `shouldEmit` callback is configured (the no-callback case is handled by the
   * pre-build fast-path in emitWideEventImpl).
   *
   * - `forceKeep` runs first (OR logic): true → keep; throws → fail-safe (log +
   *   fall through); false → fall through.
   * - Standard logic: rate AND `shouldEmit` (shouldEmit throws → fail-open, log
   *   + keep). Without `shouldEmit`, rate alone decides.
   *
   * Invokes `runRateSampling` at most once.
   */
  function evaluateSampling(wideData: Record<string, any>, level: LogLevelType, self: any): boolean {
    // forceKeep: keep-only override, evaluated before rate/shouldEmit
    if (samplingConfig?.forceKeep) {
      try {
        if (samplingConfig.forceKeep({ wideData, level })) {
          return true;
        }
        // returned false → fall through to standard logic
      } catch (err) {
        // fail-safe: log and fall through to standard logic
        logCallbackError("forceKeep", err, self);
      }
    }

    // Standard logic: rate AND shouldEmit (unchanged semantics)
    if (samplingConfig?.shouldEmit) {
      try {
        const callbackOk = samplingConfig.shouldEmit({ wideData, level });
        const ratePassed = runRateSampling(
          level,
          samplingConfig.strategy,
          samplingConfig.rate,
          samplingConfig.perLevel,
        );
        return ratePassed && callbackOk;
      } catch (err) {
        // fail-open: log and keep
        logCallbackError("shouldEmit", err, self);
        return true;
      }
    }

    return runRateSampling(level, samplingConfig?.strategy, samplingConfig?.rate, samplingConfig?.perLevel);
  }

  /**
   * Implementation for emitWideEvent
   */
  function emitWideEventImpl(config: EmitWideEventConfig, self: any): void {
    // Determine log level
    const defaultLevel = samplingConfig?.emitLevel ?? "info";
    const level = config.level ?? defaultLevel;

    // Pre-build fast-path: drop before building data when no callback needs wideData.
    // Skipped when forceKeep OR shouldEmit is set (both need wideData).
    if (
      samplingConfig &&
      !samplingConfig.shouldEmit &&
      !samplingConfig.forceKeep &&
      !runRateSampling(level, samplingConfig.strategy, samplingConfig.rate, samplingConfig.perLevel)
    ) {
      return;
    }

    const store = asyncContext.getStore();

    // Build wide event data with priority order
    // Priority: context < wideEvents
    const wideEventData: Record<string, any> = {};

    // Include context data first (lowest priority)
    if (includeContext && store?._llContext) {
      Object.assign(wideEventData, store._llContext);
    }

    // Include wideEvents data next (overrides context)
    if (store?._llWideEvents) {
      Object.assign(wideEventData, store._llWideEvents);
    }

    // Callback-aware sampling decision (only when a callback is configured;
    // the no-callback case was already handled by the fast-path above).
    if (samplingConfig && (samplingConfig.forceKeep || samplingConfig.shouldEmit)) {
      if (!evaluateSampling(wideEventData, level, self)) {
        return;
      }
    }

    // Wrap in field if configured, otherwise use flat
    const metadataToEmit = wideEventField ? { [wideEventField]: wideEventData } : wideEventData;

    // Emit via raw() with rootData to bypass metadataFieldName / contextFieldName nesting
    self.raw({
      logLevel: level,
      messages: [config.message],
      rootData: metadataToEmit,
    });
  }

  /**
   * Mixin for real LogLayer instances
   */
  const wideEventMixin: LogLayerMixin = {
    augmentationType: LogLayerMixinAugmentType.LogLayer,
    augment: (prototype: any) => {
      prototype.withWideEvents = function (this: LogLayer, data: Record<string, any>) {
        return withWideEventsImpl(data, this);
      };

      prototype.getWideEvents = function (this: LogLayer, key?: string) {
        return getWideEventsImpl(key, this);
      };

      prototype.clearWideEvents = function (this: LogLayer, key?: string) {
        return clearWideEventsImpl(key, this);
      };

      prototype.emitWideEvent = function (this: LogLayer, config: EmitWideEventConfig) {
        return emitWideEventImpl(config, this);
      };

      prototype.withWideEventError = function (this: LogLayer, error: any) {
        return withWideEventErrorImpl(error, this);
      };
    },
    augmentMock: (prototype: any) => {
      prototype.withWideEvents = function (this: any, data: Record<string, any>) {
        return withWideEventsImpl(data, this);
      };

      prototype.getWideEvents = function (this: any, key?: string) {
        return getWideEventsImpl(key, this);
      };

      prototype.clearWideEvents = function (this: any, key?: string) {
        return clearWideEventsImpl(key, this);
      };

      prototype.emitWideEvent = function (this: any, config: EmitWideEventConfig) {
        return emitWideEventImpl(config, this);
      };

      prototype.withWideEventError = function (this: any, error: any) {
        return withWideEventErrorImpl(error, this);
      };
    },
  };

  return {
    mixinsToAdd: [wideEventMixin],
    pluginsToAdd: [contextTrackerPlugin],
  };
}
