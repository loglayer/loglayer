import type { PluginBeforeDataOutParams } from "@loglayer/plugin";
import { LogLevel } from "@loglayer/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { datadogTraceInjectorPlugin } from "../index.js";

// Mock LogLayer
const mockLogLayer = {
  metadata: vi.fn(),
  context: vi.fn(),
  log: vi.fn(),
} as any;

// Mock dd-trace
const mockTracer = {
  scope: vi.fn(() => ({
    active: vi.fn(() => mockSpan),
  })),
  inject: vi.fn(),
};

const mockSpan = {
  context: vi.fn(() => mockSpanContext),
};

const mockSpanContext = {
  traceId: "1234567890abcdef",
  spanId: "abcdef1234567890",
};

describe("datadog trace injector plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create plugin with correct configuration", () => {
    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracer as any,
    });

    expect(plugin.id).toBe("test-trace-injector");
    expect(plugin.disabled).toBeUndefined();
  });

  it("should inject trace context when span is active", () => {
    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracer as any,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: { message: "test log" },
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(mockTracer.scope).toHaveBeenCalled();
    expect(mockTracer.inject).toHaveBeenCalledWith(mockSpanContext, "log", result);
    expect(result).toEqual({ message: "test log" });
  });

  it("should handle undefined data by creating empty object", () => {
    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracer as any,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: undefined,
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(mockTracer.inject).toHaveBeenCalledWith(mockSpanContext, "log", result);
    expect(result).toEqual({});
  });

  it("should handle null data by creating empty object", () => {
    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracer as any,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: null as any,
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(mockTracer.inject).toHaveBeenCalledWith(mockSpanContext, "log", result);
    expect(result).toEqual({});
  });

  it("should not inject trace context when no span is active", () => {
    const mockTracerNoSpan = {
      scope: vi.fn(() => ({
        active: vi.fn(() => null),
      })),
      inject: vi.fn(),
    };

    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracerNoSpan as any,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: { message: "test log" },
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(mockTracerNoSpan.inject).not.toHaveBeenCalled();
    expect(result).toEqual({ message: "test log" });
  });

  it("should preserve existing data when injecting trace context", () => {
    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracer as any,
    });

    const existingData = {
      message: "test log",
      userId: 123,
      metadata: { source: "api" },
    };

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: existingData,
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(mockTracer.inject).toHaveBeenCalledWith(mockSpanContext, "log", result);
    expect(result).toEqual(existingData);
  });

  it("should respect enabled flag", () => {
    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracer as any,
      disabled: true,
    });

    expect(plugin.disabled).toBe(true);
  });

  it("should handle tracer scope errors gracefully", () => {
    const mockTracerError = {
      scope: vi.fn(() => {
        throw new Error("Tracer scope error");
      }),
      inject: vi.fn(),
    };

    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracerError as any,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: { message: "test log" },
    };

    // Should not throw error and should return original data
    expect(() => {
      const result = plugin.onBeforeDataOut(params, mockLogLayer);
      expect(result).toEqual({ message: "test log" });
    }).not.toThrow();
  });

  it("should call onError handler when tracer scope errors occur", () => {
    const mockTracerError = {
      scope: vi.fn(() => {
        throw new Error("Tracer scope error");
      }),
      inject: vi.fn(),
    };

    const onError = vi.fn();

    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracerError as any,
      onError,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: { message: "test log" },
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(onError).toHaveBeenCalledWith(expect.any(Error), { message: "test log" });
    expect(result).toEqual({ message: "test log" });
  });

  it("should handle inject errors gracefully", () => {
    const mockTracerInjectError = {
      scope: vi.fn(() => ({
        active: vi.fn(() => mockSpan),
      })),
      inject: vi.fn(() => {
        throw new Error("Inject error");
      }),
    };

    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracerInjectError as any,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: { message: "test log" },
    };

    // Should not throw error and should return original data
    expect(() => {
      const result = plugin.onBeforeDataOut(params, mockLogLayer);
      expect(result).toEqual({ message: "test log" });
    }).not.toThrow();
  });

  it("should call onError handler when inject errors occur", () => {
    const mockTracerInjectError = {
      scope: vi.fn(() => ({
        active: vi.fn(() => mockSpan),
      })),
      inject: vi.fn(() => {
        throw new Error("Inject error");
      }),
    };

    const onError = vi.fn();

    const plugin = datadogTraceInjectorPlugin({
      id: "test-trace-injector",
      tracerInstance: mockTracerInjectError as any,
      onError,
    });

    const params: PluginBeforeDataOutParams = {
      logLevel: LogLevel.info,
      data: { message: "test log" },
    };

    const result = plugin.onBeforeDataOut(params, mockLogLayer);

    expect(onError).toHaveBeenCalledWith(expect.any(Error), { message: "test log" });
    expect(result).toEqual({ message: "test log" });
  });
});
