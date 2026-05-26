import {
  type LogLayer,
  type LogLayerMixin,
  LogLayerMixinAugmentType,
  type LogLayerMixinRegistration,
  type LogLayerPlugin,
} from "loglayer";
import type { EmitWideEventConfig, WideEventMixinOptions } from "./types.js";

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
        return params;
      }

      const store = asyncContext.getStore();
      if (store && params.context && Object.keys(params.context).length > 0) {
        if (!store._llContext) {
          store._llContext = {};
        }
        Object.assign(store._llContext, params.context);
      }
      return params;
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
   * Implementation for emitWideEvent
   */
  function emitWideEventImpl(config: EmitWideEventConfig, self: any): any {
    const store = asyncContext.getStore();

    // Build wide event data with priority order (later = higher priority)
    // Priority: context < wideEvents < emit metadata
    const wideEventData: Record<string, any> = {};

    // Include context data first (lowest priority)
    if (includeContext && store?._llContext) {
      Object.assign(wideEventData, store._llContext);
    }

    // Include wideEvents data next (overrides context)
    if (store?._llWideEvents) {
      Object.assign(wideEventData, store._llWideEvents);
    }

    // Include emit config metadata last (highest priority, can override anything)
    if (config.metadata) {
      Object.assign(wideEventData, config.metadata);
    }

    // Determine log level
    const level = config.level ?? "info";

    // Wrap in field if configured, otherwise use flat
    const metadataToEmit = wideEventField ? { [wideEventField]: wideEventData } : wideEventData;

    // Emit the wide event with metadata
    self.withMetadata(metadataToEmit)[level](config.message);

    return self;
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
