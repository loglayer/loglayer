import { LogLayer } from "loglayer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSimplePrettyTerminal, moonlight } from "../index.js";

const logMsg = "Test log message";

// Utility to strip ANSI color codes for test assertions
function stripAnsi(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: It's color codes
  return str.replace(/[\u001b\u009b][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
}

describe("SimplePrettyTerminalTransport", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("prints a log line in inline mode", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
    });
    transport.shipToLogger({
      logLevel: "info",
      messages: [logMsg],
      data: { foo: "bar" },
      hasData: true,
    });
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain(logMsg);
    expect(output).toContain("INFO");
    expect(output).toContain("foo");
    expect(output).toContain("bar");
  });

  it("should handle different log levels", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log.trace("Trace message");
    log.debug("Debug message");
    log.info("Info message");
    log.warn("Warning message");
    log.error("Error message");
    log.fatal("Fatal message");

    expect(logSpy).toHaveBeenCalledTimes(6);
  });

  it("should show log IDs when showLogId is enabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      showLogId: true,
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with ID");

    // The log ID appears after the log level, e.g. [timestamp] ▶ INFO [logid] message
    const output = stripAnsi(logSpy.mock.calls[0][0] as string);
    expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] ▶ INFO \[[a-z0-9]{6}\] Test message with ID/);
  });

  it("should not show log IDs when showLogId is disabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      showLogId: false,
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message without ID");

    expect(logSpy).toHaveBeenCalledWith(expect.not.stringMatching(/\[[a-z0-9]{6}\]/));
  });

  it("should format expanded mode with proper JSON indentation", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "expanded",
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log
      .withMetadata({
        test: "metadata",
        test2: "metadata2",
        nested: {
          data: "nested data",
        },
        err: new Error("test error"),
      })
      .error("error message with metadata and error instance");

    // Should have multiple log calls: one for the main line, one for each data line
    expect(logSpy.mock.calls.length).toBeGreaterThan(1);

    // Check that the first call contains the main log line
    const firstCall = stripAnsi(logSpy.mock.calls[0][0] as string);
    expect(firstCall).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] ▶ ERROR error message with metadata and error instance/);

    // Check that subsequent calls contain formatted data
    const dataCalls = logSpy.mock.calls.slice(1);
    expect(dataCalls.length).toBeGreaterThan(0);

    // Check that data lines contain the expected content
    const dataOutput = dataCalls.map((call) => stripAnsi(call[0] as string)).join("\n");
    expect(dataOutput).toContain("test:");
    expect(dataOutput).toContain("test2:");
    expect(dataOutput).toContain("nested:");
    expect(dataOutput).toContain("data: nested data");
    expect(dataOutput).toContain("err:");
  });

  it("should use custom timestamp format with date-fns", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      timestampFormat: "yyyy-MM-dd HH:mm:ss",
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with custom timestamp");

    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/));
  });

  it("should use custom timestamp function", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      timestampFormat: (timestamp: number) => `CUSTOM-${timestamp}`,
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with custom timestamp function");

    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[CUSTOM-\d+\]/));
  });

  it("should handle complex data structures", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log
      .withMetadata({
        user: {
          id: 123,
          name: "John Doe",
          email: "john@example.com",
          preferences: {
            theme: "dark",
            notifications: true,
            language: "en",
          },
        },
        request: {
          method: "POST",
          url: "/api/users",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token123",
          },
          body: {
            name: "Jane Smith",
            email: "jane@example.com",
          },
        },
        timestamp: new Date(),
        duration: 150.5,
        success: true,
      })
      .info("API request processed");

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("API request processed"));
  });

  it("should respect collapseArrays configuration", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "expanded",
      collapseArrays: true,
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log
      .withMetadata({
        numbers: [1, 2, 3, 4, 5],
        mixed: ["a", "b", { nested: "value" }],
      })
      .info("Test with collapsed arrays");

    // Should have multiple log calls: one for the main line, one for each data line
    expect(logSpy.mock.calls.length).toBeGreaterThan(1);

    // Check that arrays are collapsed
    const dataOutput = logSpy.mock.calls
      .slice(1)
      .map((call) => stripAnsi(call[0] as string))
      .join("\n");

    // When collapseArrays is true, arrays should be collapsed to [... items] format
    expect(dataOutput).toContain("numbers:");
    expect(dataOutput).toContain("[... 5 items]");
    expect(dataOutput).toContain("mixed:");
    expect(dataOutput).toContain("[... 3 items]");
  });

  it("should flatten nested objects with dot notation in inline mode", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log
      .withMetadata({
        user: {
          name: "John",
          profile: {
            age: 30,
            preferences: {
              theme: "dark",
            },
          },
        },
        tags: ["admin", "user"],
      })
      .info("User logged in");

    expect(logSpy).toHaveBeenCalled();
    const output = stripAnsi(logSpy.mock.calls[0][0] as string);

    // Should show flattened dot notation for nested objects (default behavior)
    expect(output).toContain("user.name=John");
    expect(output).toContain("user.profile.age=30");
    expect(output).toContain("user.profile.preferences.theme=dark");

    // Arrays should be shown as [...]
    expect(output).toContain("tags=[...]");

    // Should not show the original nested structure
    expect(output).not.toContain('"user":');
    expect(output).not.toContain('"profile":');
    expect(output).not.toContain('"preferences":');
  });

  it("should show JSON format when flattenNestedObjects is disabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      flattenNestedObjects: false,
      theme: moonlight,
    });

    const log = new LogLayer({
      transport,
    });

    log
      .withMetadata({
        user: {
          name: "John",
          profile: {
            age: 30,
          },
        },
        tags: ["admin", "user"],
      })
      .info("User logged in");

    expect(logSpy).toHaveBeenCalled();
    const output = stripAnsi(logSpy.mock.calls[0][0] as string);

    // Should show JSON format instead of dot notation
    expect(output).toContain('user={"name":"John","profile":{"age":30}}');
    expect(output).toContain('tags=["admin","user"]');

    // Should not show flattened dot notation
    expect(output).not.toContain("user.name=John");
    expect(output).not.toContain("user.profile.age=30");
  });

  it("should not truncate long log entries in inline mode", () => {
    const transport = getSimplePrettyTerminal({
      viewMode: "inline",
      maxInlineDepth: 50, // This should be ignored now
    });

    const longMessage =
      "This is a very long message that should not be truncated even though it exceeds the maxInlineDepth setting";
    const longData = {
      veryLongKey: "This is a very long value that should not be truncated even though it might exceed terminal width",
      anotherLongKey: "Another long value that should be preserved in full",
      nested: {
        deepLongKey: "A deeply nested long value that should also be preserved",
      },
    };

    // Mock console.log to capture output
    const originalLog = console.log;
    const logOutput: string[] = [];
    console.log = vi.fn((...args: any[]) => {
      logOutput.push(args.join(" "));
    });

    try {
      transport.shipToLogger({
        logLevel: "info",
        messages: [longMessage],
        data: longData,
        hasData: true,
      });

      // Debug: Log what we actually got
      console.log = originalLog;
      const cleanOutput = stripAnsi(logOutput[0]);
      console.log("Actual output:", cleanOutput);
      console.log("Expected to contain:", longMessage);
      console.log("Expected to contain:", "veryLongKey=This is a very long value that should not be truncated");

      // Verify that the output contains the full message and data
      expect(cleanOutput).toContain(longMessage);
      expect(cleanOutput).toContain("veryLongKey=This is a very long value that should not be truncated");
      expect(cleanOutput).toContain("anotherLongKey=Another long value that should be preserved in full");
      expect(cleanOutput).toContain("nested.deepLongKey=A deeply nested long value that should also be preserved");

      // Verify that nothing was truncated (no ellipsis or cut-off text)
      expect(cleanOutput).not.toContain("...");
    } finally {
      console.log = originalLog;
    }
  });

  it("should expand arrays when both flattenNestedObjects and collapseArrays are false", () => {
    const transport = getSimplePrettyTerminal({
      viewMode: "inline",
      flattenNestedObjects: false,
      collapseArrays: false,
    });

    const testData = {
      numbers: [1, 2, 3, 4, 5],
      strings: ["hello", "world"],
      mixed: [1, "test", true, null],
      nested: {
        array: [10, 20, 30],
      },
    };

    // Mock console.log to capture output
    const originalLog = console.log;
    const logOutput: string[] = [];
    console.log = vi.fn((...args: any[]) => {
      logOutput.push(args.join(" "));
    });

    try {
      transport.shipToLogger({
        logLevel: "info",
        messages: ["Test message"],
        data: testData,
        hasData: true,
      });

      const cleanOutput = stripAnsi(logOutput[0]);

      // Verify that arrays are expanded (not collapsed to [...])
      expect(cleanOutput).toContain("numbers=[1,2,3,4,5]");
      expect(cleanOutput).toContain('strings=["hello","world"]');
      expect(cleanOutput).toContain('mixed=[1,"test",true,null]');

      // Verify that nested objects are also expanded (not flattened)
      expect(cleanOutput).toContain('nested={"array":[10,20,30]}');

      // Verify that arrays are not collapsed
      expect(cleanOutput).not.toContain("numbers=[...]");
      expect(cleanOutput).not.toContain("strings=[...]");
      expect(cleanOutput).not.toContain("mixed=[...]");
    } finally {
      console.log = originalLog;
    }
  });
});
