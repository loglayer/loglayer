import { AsyncLocalStorage } from "node:async_hooks";
import { BlankTransport, LogLayer, useLogLayerMixin } from "loglayer";
import { describe, expect, it } from "vitest";
import { createWideEventMixin } from "../index.js";

describe("WideEventMixin - Sampling", () => {
  let asyncContext: AsyncLocalStorage<Record<string, any>>;
  let emittedLogs: any[];

  function createLog(samplingConfig?: any) {
    asyncContext = new AsyncLocalStorage();
    emittedLogs = [];

    const transport = new BlankTransport({
      shipToLogger: (params) => {
        emittedLogs.push({
          level: params.logLevel,
          messages: params.messages,
          metadata: params.metadata,
          data: params.data,
        });
        return params.messages;
      },
    });

    const mixin = createWideEventMixin({
      asyncContext,
      sampling: samplingConfig,
    });
    useLogLayerMixin(mixin);

    return new LogLayer({ transport });
  }

  // Isolated helper for tests that need their own capture array
  function createLogWithCapture(captureConfig: any): {
    log: LogLayer;
    ctx: AsyncLocalStorage<Record<string, any>>;
    logs: any[];
  } {
    const ctx = new AsyncLocalStorage();
    const logs: any[] = [];

    const transport = new BlankTransport({
      shipToLogger: (params) => {
        logs.push({
          level: params.logLevel,
          messages: params.messages,
          metadata: params.metadata,
          data: params.data,
        });
        return params.messages;
      },
    });

    const mixin = createWideEventMixin({
      asyncContext: ctx,
      includeContext: captureConfig.includeContext ?? true,
      sampling: {
        strategy: captureConfig.strategy,
        rate: captureConfig.rate,
        perLevel: captureConfig.perLevel,
        emitLevel: captureConfig.emitLevel,
        shouldEmit: captureConfig.shouldEmit,
        forceKeep: captureConfig.forceKeep,
      },
    });
    useLogLayerMixin(mixin);

    return { log: new LogLayer({ transport }), ctx, logs };
  }

  describe("no sampling (default)", () => {
    it("should keep all wide events when sampling is not configured", () => {
      const log = createLog();
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "event 1" });
        logger.emitWideEvent({ message: "event 2" });
        logger.emitWideEvent({ message: "event 3" });
      });

      expect(emittedLogs).toHaveLength(3);
    });
  });

  describe("default strategy", () => {
    it("should keep all events when rate is 1", () => {
      const log = createLog({ strategy: "default", rate: 1 });
      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < 100; i++) {
          logger.emitWideEvent({ message: `test-${i}` });
        }
      });

      expect(emittedLogs).toHaveLength(100);
    });

    it("should drop all sample-able events when rate is 0", () => {
      const log = createLog({ strategy: "default", rate: 0 });
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "trace", level: "trace" });
        logger.emitWideEvent({ message: "debug", level: "debug" });
        logger.emitWideEvent({ message: "info", level: "info" });
        logger.emitWideEvent({ message: "warn", level: "warn" });
      });

      expect(emittedLogs).toHaveLength(0);
    });

    it("should default keep error level (callback overrides rate=0)", () => {
      const log = createLog({ strategy: "default", rate: 0 });
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "error", level: "error" });
      });

      expect(emittedLogs).toHaveLength(1);
      expect(emittedLogs[0].level).toBe("error");
    });

    it("should default keep fatal level regardless of rate=0", () => {
      const log = createLog({ strategy: "default", rate: 0 });
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "fatal", level: "fatal" });
      });

      expect(emittedLogs).toHaveLength(1);
      expect(emittedLogs[0].level).toBe("fatal");
    });

    it("should sample at approximately the configured rate (0.1)", () => {
      const log = createLog({ strategy: "default", rate: 0.1 });
      const n = 5000;

      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < n; i++) {
          logger.emitWideEvent({ message: `test-${i}` });
        }
      });

      const rate = emittedLogs.length / n;
      // With 5000 samples, 0.1 rate, σ ≈ 0.0095
      // ±3σ = ±0.0285 is permissive enough to avoid flakes
      expect(rate).toBeGreaterThan(0.07);
      expect(rate).toBeLessThan(0.13);
    });

    it("should accept boolean rate (true = keep all)", () => {
      const log = createLog({ strategy: "default", rate: true });
      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < 10; i++) {
          logger.emitWideEvent({ message: `test-${i}` });
        }
      });

      expect(emittedLogs).toHaveLength(10);
    });

    it("should accept boolean rate (false = drop all for sample-able levels)", () => {
      const log = createLog({ strategy: "default", rate: false });
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "info", level: "info" });
        logger.emitWideEvent({ message: "error", level: "error" });
      });

      expect(emittedLogs).toHaveLength(1);
      expect(emittedLogs[0].level).toBe("error");
    });
  });

  describe("per_level strategy", () => {
    it("should apply per-level rates", () => {
      const log = createLog({
        strategy: "per_level",
        perLevel: {
          trace: 0, // drop all trace
          debug: 1, // keep all debug
          info: 0.5, // sample 50% of info
        },
      });

      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "trace-1", level: "trace" });
        logger.emitWideEvent({ message: "trace-2", level: "trace" });
        logger.emitWideEvent({ message: "debug-1", level: "debug" });
        logger.emitWideEvent({ message: "error-1", level: "error" });
        logger.emitWideEvent({ message: "fatal-1", level: "fatal" });
        logger.emitWideEvent({ message: "warn-1", level: "warn" });
      });

      // Should have: debug-1, error-1, fatal-1, warn-1 (default 100% + debug-1)
      // warn is kept because it's not in the map (defaults to 100%)
      const kept = emittedLogs.map((l) => l.messages[0]);
      expect(kept).toContain("debug-1");
      expect(kept).toContain("error-1");
      expect(kept).toContain("fatal-1");
      expect(kept).toContain("warn-1");

      // trace should be dropped
      expect(kept).not.toContain("trace-1");
      expect(kept).not.toContain("trace-2");
    });

    it("should allow ~50% sampling on a single level", () => {
      const log = createLog({
        strategy: "per_level",
        perLevel: {
          info: 0.5,
        },
      });

      const n = 1000;
      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < n; i++) {
          logger.emitWideEvent({ message: `info-${i}`, level: "info" });
        }
      });

      const rate = emittedLogs.length / n;
      expect(rate).toBeGreaterThan(0.4);
      expect(rate).toBeLessThan(0.6);
    });

    it("should keep levels not in the perLevel map at 100%", () => {
      const log = createLog({
        strategy: "per_level",
        perLevel: {
          trace: 0, // only trace is explicitly set
        },
      });

      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "info", level: "info" });
        logger.emitWideEvent({ message: "debug", level: "debug" });
      });

      expect(emittedLogs).toHaveLength(2);
    });

    it("should use rate as fallback for unmapped levels in per_level", () => {
      const n = 5000;
      const log = createLog({
        strategy: "per_level",
        rate: 0.5, // unmapped → 50%
        perLevel: { trace: 0 },
      });
      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < n; i++) {
          logger.emitWideEvent({ message: "info", level: "info" });
        }
      });
      const rate = emittedLogs.length / n;
      expect(rate).toBeGreaterThan(0.4);
      expect(rate).toBeLessThan(0.6);
    });

    it("error/fatal in perLevel map are respected (can be dropped)", () => {
      const log = createLog({
        strategy: "per_level",
        perLevel: {
          trace: 1,
          error: 0, // now respected — error dropped
          fatal: 0, // now respected — fatal dropped
        },
      });

      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "error", level: "error" });
        logger.emitWideEvent({ message: "fatal", level: "fatal" });
      });

      expect(emittedLogs).toHaveLength(0);
    });

    it("should snapshot the perLevel map at construction time", () => {
      const perLevel = { info: 0 };
      const log = createLog({ strategy: "per_level", perLevel });

      // Mutate the map after construction — should have no effect
      perLevel.info = 1;

      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < 100; i++) {
          logger.emitWideEvent({ message: `info-${i}`, level: "info" });
        }
      });

      // info was sampled at rate=0 at construction time
      expect(emittedLogs).toHaveLength(0);
    });
  });

  describe("emitLevel option", () => {
    it("should use emitLevel as default when no level provided", () => {
      const log = createLog({ strategy: "default", rate: 1, emitLevel: "debug" });

      asyncContext.run({}, () => {
        const logger = log.child();
        // No level provided — should use emitLevel
        logger.emitWideEvent({ message: "test" });
      });

      expect(emittedLogs[0].level).toBe("debug");
    });

    it("should respect explicit level over emitLevel", () => {
      const log = createLog({ strategy: "default", rate: 1, emitLevel: "debug" });

      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "test", level: "error" });
      });

      expect(emittedLogs[0].level).toBe("error");
    });
  });

  describe("mixed usage", () => {
    it("should only sample wide events, not normal log calls", () => {
      const log = createLog({ strategy: "default", rate: 0 });

      asyncContext.run({}, () => {
        const logger = log.child();
        // Normal log should still go through
        logger.info("normal info log");
        // Wide event should be dropped
        logger.emitWideEvent({ message: "wide event" });
        // Error wide event should pass through
        logger.emitWideEvent({ message: "wide error", level: "error" });
      });

      // Should have the normal info log and the wide error, but not the dropped wide event
      expect(emittedLogs).toHaveLength(2);
      expect(emittedLogs[0].level).toBe("info");
      expect(emittedLogs[1].level).toBe("error");
    });

    it("should work with withContext", () => {
      const log = createLog({ strategy: "default", rate: 1 });

      asyncContext.run({}, () => {
        const logger = log.child().withContext({ requestId: "req-1" });
        logger.withWideEvents({ userId: "123" });
        logger.emitWideEvent({ message: "test" });
      });

      expect(emittedLogs).toHaveLength(1);
      expect(emittedLogs[0].data).toMatchObject({ userId: "123" });
      expect(emittedLogs[0].level).toBe("info");
    });
  });

  describe("shouldEmit callback", () => {
    it("should receive wideData and level", () => {
      const { log, ctx, logs } = createLogWithCapture({
        shouldEmit: ({ wideData: _wideData, level: _level }) => true,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ userId: "123", action: "login" });
        logger.emitWideEvent({ message: "test", level: "debug" });
      });

      expect(logs).toHaveLength(1);
      // Note: shouldEmit receives the wideData, which we can verify via caption
      expect(logs[0].level).toBe("debug");
    });

    it("should drop the event when callback returns false", () => {
      const { log, ctx, logs } = createLogWithCapture({
        shouldEmit: ({ wideData }) => !!wideData.includeMe,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ userId: "123" });
        logger.emitWideEvent({ message: "dropped" });
      });

      expect(logs).toHaveLength(0);
    });

    it("should keep the event when callback returns true", () => {
      const { log, ctx, logs } = createLogWithCapture({
        shouldEmit: ({ wideData }) => !!wideData.keepMe,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ keepMe: true });
        logger.emitWideEvent({ message: "kept" });
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("info");
    });

    it("shouldEmit callback can override error/fatal exemption", () => {
      const { log, ctx, logs } = createLogWithCapture({
        shouldEmit: ({ level }) => level !== "error", // drop errors
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "error", level: "error" });
        logger.emitWideEvent({ message: "fatal", level: "fatal" });
        logger.emitWideEvent({ message: "info", level: "info" });
      });

      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe("fatal");
      expect(logs[1].level).toBe("info");
    });

    it("should compose with rate sampling (both checks must pass)", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 0, // drop all non-error/fatal
        shouldEmit: ({ wideData }) => !!wideData.keepMe, // would keep
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ keepMe: true });
        logger.emitWideEvent({ message: "dropped-by-rate" });
      });

      expect(logs).toHaveLength(0);
    });

    it("should still filter via callback when rate check passes", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 1, // keep all non-error/fatal
        shouldEmit: ({ wideData }) => !!wideData.secret,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ noSecret: true });
        logger.emitWideEvent({ message: "dropped-by-callback" });
      });

      // Rate passes but callback returns false -> dropped
      expect(logs).toHaveLength(0);
    });

    it("should work with per_level strategy and shouldEmit", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "per_level",
        perLevel: {
          trace: 1, // keep trace, drop everything else
        },
        shouldEmit: ({ wideData }) => !!wideData.keepMe,
      });

      ctx.run({}, () => {
        const logger = log.child();

        logger.withWideEvents({ keepMe: true });
        logger.emitWideEvent({ message: "trace-kept", level: "trace" });

        logger.clearWideEvents();

        // info level: not in perLevel, rate=1 (unmapped levels keep)
        // but callback says !keepMe -> false -> dropped
        logger.withWideEvents({ keepMe: false });
        logger.emitWideEvent({ message: "info-dropped", level: "info" });
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("trace");
    });

    it("should keep event when shouldEmit callback throws (fail-open)", () => {
      const { log, ctx, logs } = createLogWithCapture({
        shouldEmit: () => {
          throw new Error("oops");
        },
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "kept-despite-throw" });
      });

      // Callback threw — event is kept (fail-open)
      expect(logs).toHaveLength(1);
    });

    it("should keep error/fatal when shouldEmit throws", () => {
      const { log, ctx, logs } = createLogWithCapture({
        shouldEmit: () => {
          throw new Error("oops");
        },
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "error", level: "error" });
        logger.emitWideEvent({ message: "info", level: "info" });
      });

      // Both kept — error exempt, info kept due to fail-open
      expect(logs).toHaveLength(2);
    });
  });

  describe("rate clamping", () => {
    it("should clamp rate > 1 to 1 (keep all)", () => {
      const log = createLog({ strategy: "default", rate: 1.5 });

      asyncContext.run({}, () => {
        const logger = log.child();
        for (let i = 0; i < 100; i++) {
          logger.emitWideEvent({ message: `test-${i}` });
        }
      });

      expect(emittedLogs).toHaveLength(100);
    });

    it("should clamp rate < 0 to 0 (drop all for sample-able levels)", () => {
      const log = createLog({ strategy: "default", rate: -0.5 });

      asyncContext.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "info", level: "info" });
        logger.emitWideEvent({ message: "error", level: "error" });
      });

      // info dropped (rate clamped to 0), error kept by default
      expect(emittedLogs).toHaveLength(1);
      expect(emittedLogs[0].level).toBe("error");
    });

    it("should keep error/fatal when shouldEmit throws (fail-open overrides rate)", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "per_level",
        perLevel: { trace: 1, error: 0, fatal: 0 },
        shouldEmit: () => {
          throw new Error("oops");
        },
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "trace", level: "trace" });
        logger.emitWideEvent({ message: "error", level: "error" });
        logger.emitWideEvent({ message: "fatal", level: "fatal" });
      });

      // All kept via fail-open overriding rate check
      expect(logs).toHaveLength(3);
    });

    it("emitLevel feeds into per_level rate bucket", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "per_level",
        perLevel: { debug: 0 }, // drop all debug
        emitLevel: "debug",
      });

      ctx.run({}, () => {
        const logger = log.child();
        // No explicit level — uses emitLevel "debug", rate for debug is 0
        logger.emitWideEvent({ message: "dropped" });
      });

      expect(logs).toHaveLength(0);
    });

    it("shouldEmit receives level from emitLevel", () => {
      const receivedLevels: string[] = [];
      const { log, ctx } = createLogWithCapture({
        strategy: "default",
        rate: 1,
        emitLevel: "warn",
        shouldEmit: ({ level }) => {
          receivedLevels.push(level);
          return true;
        },
      });

      ctx.run({}, () => {
        log.child().emitWideEvent({ message: "test" });
      });

      expect(receivedLevels).toEqual(["warn"]);
    });

    it("explicit level overrides emitLevel for sampling", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "per_level",
        perLevel: { info: 0 },
        emitLevel: "debug", // would not be sampled
      });

      ctx.run({}, () => {
        const logger = log.child();
        // Explicit "info" overrides emitLevel "debug", rate=0 drops it
        logger.emitWideEvent({ message: "dropped", level: "info" });
      });

      expect(logs).toHaveLength(0);
    });
  });

  describe("forceKeep", () => {
    it("rescues an event the rate would drop", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 0, // would drop all info
        forceKeep: ({ wideData }) => wideData.debug === true,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ debug: true });
        logger.emitWideEvent({ message: "rescued", level: "info" });
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].messages[0]).toBe("rescued");
    });

    it("bypasses shouldEmit when forceKeep returns true", () => {
      const { log, ctx, logs } = createLogWithCapture({
        rate: 1,
        shouldEmit: () => false, // would drop everything
        forceKeep: ({ wideData }) => wideData.keep === true,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ keep: true });
        logger.emitWideEvent({ message: "kept", level: "info" });
      });

      expect(logs).toHaveLength(1);
    });

    it("falls through to rate/shouldEmit when forceKeep returns false (drops at rate 0)", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 0,
        forceKeep: () => false,
      });

      ctx.run({}, () => {
        log.child().emitWideEvent({ message: "dropped", level: "info" });
      });

      expect(logs).toHaveLength(0);
    });

    it("falls through and keeps when forceKeep returns false and rate passes (fast-path disabled)", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 1,
        forceKeep: () => false,
      });

      ctx.run({}, () => {
        log.child().emitWideEvent({ message: "kept-by-rate", level: "info" });
      });

      expect(logs).toHaveLength(1);
    });

    it("does not interfere with error/fatal exemption when returning false", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 0,
        forceKeep: () => false,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.emitWideEvent({ message: "err", level: "error" });
        logger.emitWideEvent({ message: "fat", level: "fatal" });
      });

      expect(logs).toHaveLength(2);
    });

    it("fails safe: throwing forceKeep at rate 0 is dropped", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 0,
        forceKeep: () => {
          throw new Error("boom");
        },
      });

      ctx.run({}, () => {
        log.child().emitWideEvent({ message: "dropped", level: "info" });
      });

      expect(logs).toHaveLength(0);
    });

    it("fails safe: throwing forceKeep with passing rate is kept", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "default",
        rate: 1,
        forceKeep: () => {
          throw new Error("boom");
        },
      });

      ctx.run({}, () => {
        log.child().emitWideEvent({ message: "kept", level: "info" });
      });

      expect(logs).toHaveLength(1);
    });

    it("receives wideData and the resolved level", () => {
      const seen: Array<{ wideData: Record<string, any>; level: string }> = [];
      const { log, ctx } = createLogWithCapture({
        strategy: "default",
        rate: 1,
        emitLevel: "warn",
        forceKeep: (params) => {
          seen.push({ wideData: params.wideData, level: params.level });
          return false;
        },
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ userId: "u1" });
        logger.emitWideEvent({ message: "no explicit level" }); // uses emitLevel "warn"
      });

      expect(seen).toHaveLength(1);
      expect(seen[0].level).toBe("warn");
      expect(seen[0].wideData).toMatchObject({ userId: "u1" });
    });

    it("works with per_level (issue scenario)", () => {
      const { log, ctx, logs } = createLogWithCapture({
        strategy: "per_level",
        perLevel: { info: 0 }, // drop all info
        forceKeep: ({ wideData }) => wideData.debug === true,
      });

      ctx.run({}, () => {
        const logger = log.child();
        logger.withWideEvents({ debug: true });
        logger.emitWideEvent({ message: "kept-debug", level: "info" });

        logger.clearWideEvents();
        logger.withWideEvents({ debug: false });
        logger.emitWideEvent({ message: "dropped", level: "info" });
      });

      const kept = logs.map((l) => l.messages[0]);
      expect(kept).toContain("kept-debug");
      expect(kept).not.toContain("dropped");
    });
  });

  describe("thrown callback observability", () => {
    it("logs forceKeep throw only when consoleDebug is enabled", () => {
      const errors: any[][] = [];
      const spy = console.error;
      console.error = (...args: any[]) => {
        errors.push(args);
      };
      try {
        const ctx = new AsyncLocalStorage<Record<string, any>>();
        const transport = new BlankTransport({ shipToLogger: (p) => p.messages });
        const mixin = createWideEventMixin({
          asyncContext: ctx,
          sampling: {
            rate: 1,
            forceKeep: () => {
              throw new Error("boom");
            },
          },
        });
        useLogLayerMixin(mixin);

        // consoleDebug off (default) — no log
        const logOff = new LogLayer({ transport });
        ctx.run({}, () => logOff.child().emitWideEvent({ message: "x", level: "info" }));
        expect(errors).toHaveLength(0);

        // consoleDebug on — one [LogLayer] error
        const logOn = new LogLayer({ transport, consoleDebug: true });
        ctx.run({}, () => logOn.child().emitWideEvent({ message: "y", level: "info" }));
        expect(errors).toHaveLength(1);
        expect(String(errors[0][0])).toContain("[LogLayer]");
        expect(String(errors[0][0])).toContain("forceKeep");
      } finally {
        console.error = spy;
      }
    });

    it("logs shouldEmit throw only when consoleDebug is enabled and still keeps (fail-open)", () => {
      const errors: any[][] = [];
      const spy = console.error;
      console.error = (...args: any[]) => {
        errors.push(args);
      };
      try {
        const ctx = new AsyncLocalStorage<Record<string, any>>();
        const captured: any[] = [];
        const transport = new BlankTransport({
          shipToLogger: (p) => {
            captured.push(p.messages);
            return p.messages;
          },
        });
        const mixin = createWideEventMixin({
          asyncContext: ctx,
          sampling: {
            rate: 1,
            shouldEmit: () => {
              throw new Error("boom");
            },
          },
        });
        useLogLayerMixin(mixin);

        const logOn = new LogLayer({ transport, consoleDebug: true });
        ctx.run({}, () => logOn.child().emitWideEvent({ message: "z", level: "info" }));

        expect(captured).toHaveLength(1); // fail-open: kept
        expect(errors).toHaveLength(1);
        expect(String(errors[0][0])).toContain("shouldEmit");
      } finally {
        console.error = spy;
      }
    });
  });
});
