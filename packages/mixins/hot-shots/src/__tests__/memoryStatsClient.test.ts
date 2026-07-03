import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeEach, describe, expect, it } from "vitest";
import { hotshotsMixin, MemoryStatsClient } from "../index.js";

describe("MemoryStatsClient", () => {
  let stats: MemoryStatsClient;

  function makeLogger() {
    return new LogLayer({ transport: new TestTransport({ logger: new TestLoggingLibrary() }) });
  }

  beforeEach(() => {
    stats = new MemoryStatsClient();
    useLogLayerMixin(hotshotsMixin(stats));
  });

  it("records the issue example shape", () => {
    makeLogger().stats.increment("dependency.count").withTags(["dependency:coreApi", "outcome:success"]).send();

    expect(stats.records).toContainEqual({
      type: "increment",
      name: "dependency.count",
      value: 1,
      tags: ["dependency:coreApi", "outcome:success"],
      sampleRate: undefined,
    });
  });

  it("increment defaults value to 1, decrement to -1, and honors withValue", () => {
    const log = makeLogger();
    log.stats.increment("a").send();
    log.stats.increment("b").withValue(5).send();
    log.stats.decrement("c").send();

    expect(stats.records[0]).toMatchObject({ type: "increment", name: "a", value: 1 });
    expect(stats.records[1]).toMatchObject({ type: "increment", name: "b", value: 5 });
    expect(stats.records[2]).toMatchObject({ type: "decrement", name: "c", value: -1 });
  });

  it("records gauge/histogram/distribution/timing/set/unique with value", () => {
    const log = makeLogger();
    log.stats.gauge("g", 3).send();
    log.stats.histogram("h", 4).send();
    log.stats.distribution("d", 5).send();
    log.stats.timing("t", 6).send();
    log.stats.set("s", "id1").send();
    log.stats.unique("u", "id2").send();

    expect(stats.records).toEqual([
      { type: "gauge", name: "g", value: 3, tags: undefined, sampleRate: undefined },
      { type: "histogram", name: "h", value: 4, tags: undefined, sampleRate: undefined },
      { type: "distribution", name: "d", value: 5, tags: undefined, sampleRate: undefined },
      { type: "timing", name: "t", value: 6, tags: undefined, sampleRate: undefined },
      { type: "set", name: "s", value: "id1", tags: undefined, sampleRate: undefined },
      { type: "unique", name: "u", value: "id2", tags: undefined, sampleRate: undefined },
    ]);
  });

  it("captures tags and sampleRate", () => {
    makeLogger().stats.gauge("g", 1).withTags(["a:b"]).withSampleRate(0.5).send();
    expect(stats.records[0]).toEqual({
      type: "gauge",
      name: "g",
      value: 1,
      tags: ["a:b"],
      sampleRate: 0.5,
    });
  });

  it("increment withSampleRate (no value) records the rate as the value (hot-shots positional semantics)", () => {
    makeLogger().stats.increment("x").withSampleRate(0.5).send();
    expect(stats.records[0]).toMatchObject({ type: "increment", name: "x", value: 0.5, sampleRate: undefined });
  });

  it("builder without send() records nothing", () => {
    makeLogger().stats.increment("x").withValue(9);
    expect(stats.records).toHaveLength(0);
  });

  it("clear() empties records", () => {
    makeLogger().stats.increment("x").send();
    expect(stats.records).toHaveLength(1);
    stats.clear();
    expect(stats.records).toHaveLength(0);
  });

  it("records event and check shapes", () => {
    const log = makeLogger();
    log.stats.event("deploy").withText("v2 shipped").withTags(["env:prod"]).send();
    // status 0 = OK for DataDog checks
    log.stats
      .check("db", 0 as any)
      .withTags(["svc:db"])
      .send();

    expect(stats.records[0]).toMatchObject({ type: "event", name: "deploy", text: "v2 shipped", tags: ["env:prod"] });
    expect(stats.records[1]).toMatchObject({ type: "check", name: "db", status: 0, tags: ["svc:db"] });
  });

  it("timer wrapper executes the function and records a timer entry (not timing)", () => {
    const wrapped = makeLogger()
      .stats.timer(() => 42, "work.time")
      .withTags(["op:x"])
      .create();
    const result = wrapped();
    expect(result).toBe(42);
    const rec = stats.records.find((r) => r.name === "work.time");
    expect(rec?.type).toBe("timer");
    expect(rec?.tags).toEqual(["op:x"]);
    expect(typeof rec?.value).toBe("number");
  });

  it("composes with context-derived tags (Feature 1 + Feature 2)", () => {
    const composed = new MemoryStatsClient();
    useLogLayerMixin(hotshotsMixin(composed, { contextTagKeys: ["endpoint"] }));
    makeLogger().withContext({ endpoint: "/v1/x" }).stats.increment("c").withTags(["a:b"]).send();
    expect(composed.records[0]).toEqual({
      type: "increment",
      name: "c",
      value: 1,
      tags: ["a:b", "endpoint:/v1/x"],
      sampleRate: undefined,
    });
  });
});
