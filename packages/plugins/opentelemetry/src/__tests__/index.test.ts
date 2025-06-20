import { context, type Span, type SpanContext, trace } from "@opentelemetry/api";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { openTelemetryPlugin } from "../index.js";

describe("OpenTelemetry plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(context, "active").mockReturnValue({} as any);
    vi.mock("@opentelemetry/api", () => ({
      isSpanContextValid: vi.fn().mockReturnValue(true),
      trace: {
        getSpan: vi.fn(),
      },
      context: {
        active: vi.fn(),
      },
    }));
  });

  it("should add trace context with default field names when span exists", () => {
    const logger = new TestLoggingLibrary();
    const mockSpanContext: SpanContext = {
      traceId: "test-trace-id",
      spanId: "test-span-id",
      traceFlags: 1,
      isRemote: false,
    };

    const mockSpan: Partial<Span> = {
      spanContext: () => mockSpanContext,
    };

    vi.spyOn(trace, "getSpan").mockReturnValue(mockSpan as Span);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [openTelemetryPlugin()],
    });

    log.metadataOnly({});
    const line = logger.popLine();

    expect(line.data[0]).toEqual({
      trace_id: "test-trace-id",
      span_id: "test-span-id",
      trace_flags: "01",
    });
  });

  it("should add trace context with custom field names", () => {
    const logger = new TestLoggingLibrary();
    const mockSpanContext: SpanContext = {
      traceId: "test-trace-id",
      spanId: "test-span-id",
      traceFlags: 1,
      isRemote: false,
    };

    const mockSpan: Partial<Span> = {
      spanContext: () => mockSpanContext,
    };

    vi.spyOn(trace, "getSpan").mockReturnValue(mockSpan as Span);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        openTelemetryPlugin({
          traceIdFieldName: "customTraceId",
          spanIdFieldName: "customSpanId",
          traceFlagsFieldName: "customTraceFlags",
        }),
      ],
    });

    log.metadataOnly({});
    const line = logger.popLine();

    expect(line.data[0]).toEqual({
      customTraceId: "test-trace-id",
      customSpanId: "test-span-id",
      customTraceFlags: "01",
    });
  });

  it("should nest trace context under traceFieldName when specified", () => {
    const logger = new TestLoggingLibrary();
    const mockSpanContext: SpanContext = {
      traceId: "test-trace-id",
      spanId: "test-span-id",
      traceFlags: 1,
      isRemote: false,
    };

    const mockSpan: Partial<Span> = {
      spanContext: () => mockSpanContext,
    };

    vi.spyOn(trace, "getSpan").mockReturnValue(mockSpan as Span);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        openTelemetryPlugin({
          traceFieldName: "trace",
        }),
      ],
    });

    log.metadataOnly({});
    const line = logger.popLine();

    expect(line.data[0]).toEqual({
      trace: {
        trace_id: "test-trace-id",
        span_id: "test-span-id",
        trace_flags: "01",
      },
    });
  });

  it("should not add trace context when no span exists", () => {
    const logger = new TestLoggingLibrary();

    vi.spyOn(trace, "getSpan").mockReturnValue(undefined);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [openTelemetryPlugin()],
    });

    log.metadataOnly({});
    const line = logger.popLine();

    expect(line.data[0]).toEqual({});
  });

  it("should merge trace context with existing data", () => {
    const logger = new TestLoggingLibrary();
    const mockSpanContext: SpanContext = {
      traceId: "test-trace-id",
      spanId: "test-span-id",
      traceFlags: 1,
      isRemote: false,
    };

    const mockSpan: Partial<Span> = {
      spanContext: () => mockSpanContext,
    };

    vi.spyOn(trace, "getSpan").mockReturnValue(mockSpan as Span);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [openTelemetryPlugin()],
    });

    log.metadataOnly({ existingField: "value" });
    const line = logger.popLine();

    expect(line.data[0]).toEqual({
      existingField: "value",
      trace_id: "test-trace-id",
      span_id: "test-span-id",
      trace_flags: "01",
    });
  });

  it("should add trace context when using info without explicit metadata", () => {
    const logger = new TestLoggingLibrary();
    const mockSpanContext: SpanContext = {
      traceId: "test-trace-id",
      spanId: "test-span-id",
      traceFlags: 1,
      isRemote: false,
    };

    const mockSpan: Partial<Span> = {
      spanContext: () => mockSpanContext,
    };

    vi.spyOn(trace, "getSpan").mockReturnValue(mockSpan as Span);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [openTelemetryPlugin()],
    });

    log.withMetadata({}).info("test message");
    const line = logger.popLine();

    expect(line.data).toEqual([
      {
        trace_id: "test-trace-id",
        span_id: "test-span-id",
        trace_flags: "01",
      },
      "test message",
    ]);
  });

  it("should add trace context when using info only", () => {
    const logger = new TestLoggingLibrary();
    const mockSpanContext: SpanContext = {
      traceId: "test-trace-id",
      spanId: "test-span-id",
      traceFlags: 1,
      isRemote: false,
    };

    const mockSpan: Partial<Span> = {
      spanContext: () => mockSpanContext,
    };

    vi.spyOn(trace, "getSpan").mockReturnValue(mockSpan as Span);

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [openTelemetryPlugin()],
    });

    log.info("test message");
    const line = logger.popLine();

    expect(line.data).toEqual([
      {
        trace_id: "test-trace-id",
        span_id: "test-span-id",
        trace_flags: "01",
      },
      "test message",
    ]);
  });
});
