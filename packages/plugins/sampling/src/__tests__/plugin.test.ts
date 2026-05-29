import { BlankTransport, LogLayer } from "loglayer";
import { describe, expect, it } from "vitest";
import { type SamplingConfig, samplingPlugin } from "../index.js";

function createLog(config: SamplingConfig = {}) {
  const logs: any[] = [];
  const transport = new BlankTransport({
    shipToLogger: (params) => {
      logs.push({
        level: params.logLevel,
        messages: params.messages,
        metadata: params.metadata,
      });
      return params.messages[0];
    },
  });

  const plugin = samplingPlugin(config);

  const log = new LogLayer({
    transport,
    plugins: [plugin],
  });

  return { log, logs };
}

describe("samplingPlugin", () => {
  it("keeps everything when no config is passed", () => {
    const { log, logs } = createLog({});
    log.info("test");
    expect(logs).toHaveLength(1);
  });

  it("keeps everything when rate is 1", () => {
    const { log, logs } = createLog({ rate: 1 });
    log.info("test");
    expect(logs).toHaveLength(1);
  });

  it("keeps only error/fatal when rate is 0", () => {
    const { log, logs } = createLog({ rate: 0 });
    log.info("test");
    log.error("error kept by default");
    log.fatal("fatal kept by default");
    expect(logs).toHaveLength(2);
  });

  it("error levels are kept by default", () => {
    const { log, logs } = createLog({ rate: 0 });
    log.error("error kept by default");
    expect(logs).toHaveLength(1);
  });

  it("drops non-error/fatal levels at rate 0", () => {
    const { log, logs } = createLog({ rate: 0 });
    log.info("info - dropped");
    log.debug("debug - dropped");
    expect(logs).toHaveLength(0);
  });

  it("per_level: keeps levels not in map at 100%", () => {
    const { log, logs } = createLog({ strategy: "per_level", perLevel: { trace: 0 } });
    log.info("info - kept");
    expect(logs).toHaveLength(1);
  });

  it("per_level: drops levels set to 0", () => {
    const { log, logs } = createLog({ strategy: "per_level", perLevel: { info: 0 } });
    log.info("info - dropped");
    expect(logs).toHaveLength(0);
  });

  it("shouldSample callback receives correct params", () => {
    let capturedLevel: string | undefined;
    let capturedMetadata: unknown;

    const { log } = createLog({
      shouldSample: ({ level, metadata }) => {
        capturedLevel = level;
        capturedMetadata = metadata;
        return true;
      },
    });

    log.withMetadata({ foo: "bar" }).info("test");
    expect(capturedLevel).toBe("info");
    expect(capturedMetadata).toEqual({ foo: "bar" });
  });

  it("shouldSample: returning false drops the event", () => {
    const { log, logs } = createLog({
      shouldSample: () => false,
    });
    log.info("dropped");
    expect(logs).toHaveLength(0);
  });

  it("shouldSample: can override error/fatal exemption", () => {
    const { log, logs } = createLog({
      shouldSample: ({ level }) => level !== "error",
    });
    log.error("error - dropped");
    expect(logs).toHaveLength(0);
  });

  it("shouldSample: if callback throws, keep the event (fail-open)", () => {
    const { log, logs } = createLog({
      shouldSample: () => {
        throw new Error("oops");
      },
    });
    log.info("should-still-emit");
    expect(logs).toHaveLength(1);
  });

  it("snapshot: perLevel map mutations do not affect the plugin", () => {
    const perLevelConfig = { info: 0 };
    const { log, logs } = createLog({ strategy: "per_level", perLevel: perLevelConfig });
    perLevelConfig.info = 1; // mutate after creation
    log.info("info - snapshotted at 0");
    expect(logs).toHaveLength(0);
  });

  it("rate clamping: rate > 1 clamped to 1 (keep all)", () => {
    const { log, logs } = createLog({ rate: 999 });
    log.info("test");
    expect(logs).toHaveLength(1);
  });

  it("rate clamping: rate < 0 clamped to 0 (drop all for sample-able)", () => {
    const { log, logs } = createLog({ rate: -5 });
    log.info("test");
    expect(logs).toHaveLength(0);
  });

  it("boolean rate: true keeps all", () => {
    const { log, logs } = createLog({ rate: true });
    log.info("test");
    expect(logs).toHaveLength(1);
  });

  it("boolean rate: false drops all (for sample-able)", () => {
    const { log, logs } = createLog({ rate: false });
    log.info("test");
    expect(logs).toHaveLength(0);
  });

  it("per_level: error/fatal can be dropped via perLevel map", () => {
    const { log, logs } = createLog({
      strategy: "per_level",
      perLevel: { error: 0, fatal: 0 },
    });
    log.error("error - dropped");
    log.fatal("fatal - dropped");
    expect(logs).toHaveLength(0);
  });

  it("per_level: unmapped levels fall back to rate", () => {
    const n = 5000;
    const { log, logs } = createLog({
      strategy: "per_level",
      rate: 0.5, // unmapped → 50%
      perLevel: { trace: 0 },
    });
    for (let i = 0; i < n; i++) {
      log.info("test");
    }
    const rate = logs.length / n;
    expect(rate).toBeGreaterThan(0.4);
    expect(rate).toBeLessThan(0.6);
  });

  it("default rate:0 drops everything except error/fatal", () => {
    const { log, logs } = createLog({ rate: 0 });
    log.trace("trace");
    log.debug("debug");
    log.info("info");
    log.warn("warn");
    log.error("error");
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe("error");
  });
});
