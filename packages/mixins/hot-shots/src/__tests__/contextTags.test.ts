import type { StatsD } from "hot-shots";
import { LogLayer, lazy, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

function makeMockClient() {
  return {
    increment: vi.fn(),
    decrement: vi.fn(),
    gauge: vi.fn(),
    gaugeDelta: vi.fn(),
    histogram: vi.fn(),
    distribution: vi.fn(),
    timing: vi.fn(),
    set: vi.fn(),
    unique: vi.fn(),
    event: vi.fn(),
    check: vi.fn(),
  } as unknown as StatsD;
}

function makeLogger() {
  return new LogLayer({ transport: new TestTransport({ logger: new TestLoggingLibrary() }) });
}

describe("context-derived tags", () => {
  let client: StatsD;

  beforeEach(() => {
    client = makeMockClient();
  });

  it("promotes an allowlisted scalar context key to a tag", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["endpoint"] }));
    makeLogger().withContext({ endpoint: "/v1/x" }).stats.increment("request.count").send();
    expect(client.increment).toHaveBeenCalledWith("request.count", ["endpoint:/v1/x"]);
  });

  it("does not promote non-allowlisted keys", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["endpoint"] }));
    makeLogger().withContext({ endpoint: "/v1/x", userId: "u1" }).stats.increment("c").send();
    expect(client.increment).toHaveBeenCalledWith("c", ["endpoint:/v1/x"]);
  });

  it("skips non-scalar context values, promotes number and boolean", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["obj", "arr", "nil", "num", "flag"] }));
    makeLogger()
      .withContext({ obj: { a: 1 }, arr: [1, 2], nil: null, num: 42, flag: true })
      .stats.increment("c")
      .send();
    expect(client.increment).toHaveBeenCalledWith("c", ["num:42", "flag:true"]);
  });

  it("promotes a lazy context value that resolves to a scalar", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["endpoint"] }));
    makeLogger()
      .withContext({ endpoint: lazy(() => "/lazy") })
      .stats.increment("c")
      .send();
    expect(client.increment).toHaveBeenCalledWith("c", ["endpoint:/lazy"]);
  });

  it("emits derived-only tags when no explicit tags are set", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["endpoint"] }));
    makeLogger().withContext({ endpoint: "/v1/x" }).stats.gauge("g", 5).send();
    expect(client.gauge).toHaveBeenCalledWith("g", 5, ["endpoint:/v1/x"]);
  });

  it("explicit tags override a derived key (no duplicate) and keep non-conflicting", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["endpoint", "method"] }));
    makeLogger()
      .withContext({ endpoint: "/ctx", method: "GET" })
      .stats.increment("c")
      .withTags(["endpoint:/explicit", "extra:1"])
      .send();
    expect(client.increment).toHaveBeenCalledWith("c", ["endpoint:/explicit", "extra:1", "method:GET"]);
  });

  it("supports object explicit tags overriding a derived key", () => {
    useLogLayerMixin(hotshotsMixin(client, { contextTagKeys: ["endpoint"] }));
    makeLogger().withContext({ endpoint: "/ctx" }).stats.increment("c").withTags({ endpoint: "/explicit" }).send();
    expect(client.increment).toHaveBeenCalledWith("c", ["endpoint:/explicit"]);
  });

  it("no contextTagKeys → no derived tags (regression guard)", () => {
    useLogLayerMixin(hotshotsMixin(client));
    makeLogger().withContext({ endpoint: "/v1/x" }).stats.increment("c").send();
    expect(client.increment).toHaveBeenCalledWith("c");
  });
});
