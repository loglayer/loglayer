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
  let logSpy: any;
  let infoSpy: any;
  let warnSpy: any;
  let errorSpy: any;
  let debugSpy: any;
  let stdoutSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    debugSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("prints a log line in inline mode", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "node",
    });
    transport.shipToLogger({
      logLevel: "info",
      messages: [logMsg],
      data: { foo: "bar" },
      hasData: true,
    });
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stripAnsi(stdoutSpy.mock.calls[0][0] as string);
    expect(output).toContain(logMsg);
    expect(output).toContain("INFO");
    expect(output).toContain("foo");
    expect(output).toContain("bar");
  });

  it("should handle different log levels", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      theme: moonlight,
      runtime: "node",
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

    expect(stdoutSpy).toHaveBeenCalledTimes(6);
  });

  it("should show log IDs when showLogId is enabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      showLogId: true,
      theme: moonlight,
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with ID");

    // The log ID appears after the log level, e.g. [timestamp] ▶ INFO [logid] message
    const output = stripAnsi(stdoutSpy.mock.calls[0][0] as string);
    expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] ▶ INFO \[[a-z0-9]{6}\] Test message with ID/);
  });

  it("should not show log IDs when showLogId is disabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      showLogId: false,
      theme: moonlight,
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message without ID");

    expect(stdoutSpy).toHaveBeenCalledWith(expect.not.stringMatching(/\[[a-z0-9]{6}\]/));
  });

  it("should format expanded mode with proper JSON indentation", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "expanded",
      theme: moonlight,
      runtime: "node",
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
    expect(stdoutSpy.mock.calls.length).toBeGreaterThan(1);

    // Check that the first call contains the main log line
    const firstCall = stripAnsi(stdoutSpy.mock.calls[0][0] as string);
    expect(firstCall).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] ▶ ERROR error message with metadata and error instance/);

    // Check that subsequent calls contain formatted data
    const dataCalls = stdoutSpy.mock.calls.slice(1);
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
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with custom timestamp");

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringMatching(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/));
  });

  it("should use custom timestamp function", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      timestampFormat: (timestamp: number) => `CUSTOM-${timestamp}`,
      theme: moonlight,
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with custom timestamp function");

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringMatching(/\[CUSTOM-\d+\]/));
  });

  it("should handle complex data structures", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "node",
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
            name: "Jane Doe",
            email: "jane@example.com",
          },
        },
        response: {
          status: 201,
          data: {
            id: 456,
            name: "Jane Doe",
            email: "jane@example.com",
            createdAt: new Date().toISOString(),
          },
        },
        performance: {
          duration: 125.5,
          memory: {
            used: 45.2,
            total: 512,
            percentage: 8.8,
          },
        },
        errors: [new Error("Validation failed"), new Error("Database connection timeout")],
        tags: ["api", "user", "create"],
        metadata: {
          version: "1.0.0",
          environment: "production",
          region: "us-west-2",
        },
      })
      .info("API request processed");

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("API request processed"));
  });

  it("should respect collapseArrays configuration", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "expanded",
      collapseArrays: true,
      theme: moonlight,
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log
      .withMetadata({
        numbers: [1, 2, 3, 4, 5],
        strings: ["hello", "world"],
        mixed: [1, "test", true, null],
        nested: {
          array: [10, 20, 30],
        },
      })
      .info("Test message with arrays");

    // Should have multiple log calls: one for the main line, one for each data line
    expect(stdoutSpy.mock.calls.length).toBeGreaterThan(1);

    // Check that arrays are collapsed
    const dataCalls = stdoutSpy.mock.calls.slice(1);
    const dataOutput = dataCalls.map((call) => stripAnsi(call[0] as string)).join("\n");
    expect(dataOutput).toContain("numbers:");
    expect(dataOutput).toContain("[... 5 items]");
    expect(dataOutput).toContain("strings:");
    expect(dataOutput).toContain("[... 2 items]");
    expect(dataOutput).toContain("mixed:");
    expect(dataOutput).toContain("[... 4 items]");
    expect(dataOutput).toContain("nested:");
    expect(dataOutput).toContain("array:");
    expect(dataOutput).toContain("[... 3 items]");
  });

  it("should flatten nested objects with dot notation in inline mode", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      flattenNestedObjects: true,
      theme: moonlight,
      runtime: "node",
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

    expect(stdoutSpy).toHaveBeenCalled();
    const output = stripAnsi(stdoutSpy.mock.calls[0][0] as string);

    // Should show flattened dot notation
    expect(output).toContain("user.name=John");
    expect(output).toContain("user.profile.age=30");
    expect(output).toContain("tags=[...]");

    // Should not show JSON format
    expect(output).not.toContain('user={"name":"John","profile":{"age":30}}');
  });

  it("should show JSON format when flattenNestedObjects is disabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      flattenNestedObjects: false,
      theme: moonlight,
      runtime: "node",
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

    expect(stdoutSpy).toHaveBeenCalled();
    const output = stripAnsi(stdoutSpy.mock.calls[0][0] as string);

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
      runtime: "node",
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

    transport.shipToLogger({
      logLevel: "info",
      messages: [longMessage],
      data: longData,
      hasData: true,
    });

    // Verify that process.stdout.write was called
    expect(stdoutSpy).toHaveBeenCalled();
    const cleanOutput = stripAnsi(stdoutSpy.mock.calls[0][0] as string);

    // Verify that the output contains the full message and data
    expect(cleanOutput).toContain(longMessage);
    expect(cleanOutput).toContain("veryLongKey=This is a very long value that should not be truncated");
    expect(cleanOutput).toContain("anotherLongKey=Another long value that should be preserved in full");
    expect(cleanOutput).toContain("nested.deepLongKey=A deeply nested long value that should also be preserved");

    // Verify that nothing was truncated (no ellipsis or cut-off text)
    expect(cleanOutput).not.toContain("...");
  });

  it("should expand arrays when both flattenNestedObjects and collapseArrays are false", () => {
    const transport = getSimplePrettyTerminal({
      viewMode: "inline",
      flattenNestedObjects: false,
      collapseArrays: false,
      runtime: "node",
    });

    const testData = {
      numbers: [1, 2, 3, 4, 5],
      strings: ["hello", "world"],
      mixed: [1, "test", true, null],
      nested: {
        array: [10, 20, 30],
      },
    };

    transport.shipToLogger({
      logLevel: "info",
      messages: ["Test message"],
      data: testData,
      hasData: true,
    });

    // Verify that process.stdout.write was called
    expect(stdoutSpy).toHaveBeenCalled();
    const cleanOutput = stripAnsi(stdoutSpy.mock.calls[0][0] as string);

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
  });

  it("should use console.info when runtime is set to browser", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "browser",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with browser runtime");

    // Verify that console.info was called (since we're using browser runtime and info level)
    expect(infoSpy).toHaveBeenCalled();
    const output = stripAnsi(infoSpy.mock.calls[0][0] as string);
    expect(output).toContain("Test message with browser runtime");
    expect(output).toContain("INFO");

    // Verify that process.stdout.write was not called
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("should use appropriate console methods for different log levels in browser runtime", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "browser",
    });

    const log = new LogLayer({
      transport,
    });

    // Test different log levels
    log.trace("Trace message");
    log.debug("Debug message");
    log.info("Info message");
    log.warn("Warning message");
    log.error("Error message");
    log.fatal("Fatal message");

    // Verify that appropriate console methods were called
    expect(debugSpy).toHaveBeenCalledTimes(2); // trace and debug both use console.debug
    expect(infoSpy).toHaveBeenCalledTimes(1); // info uses console.info
    expect(warnSpy).toHaveBeenCalledTimes(1); // warn uses console.warn
    expect(errorSpy).toHaveBeenCalledTimes(2); // error and fatal both use console.error

    // Verify that console.log was not called (since we have specific mappings)
    expect(logSpy).not.toHaveBeenCalled();

    // Verify that process.stdout.write was not called
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("should use process.stdout.write when runtime is set to node", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with node runtime");

    // Verify that process.stdout.write was called (since we're using node runtime)
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stripAnsi(stdoutSpy.mock.calls[0][0] as string);
    expect(output).toContain("Test message with node runtime");
    expect(output).toContain("INFO");

    // Verify that console.log was not called
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("should use process.stdout.write by default (node runtime)", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "node",
    });

    const log = new LogLayer({
      transport,
    });

    log.info("Test message with default runtime");

    // Verify that process.stdout.write was called (since default is node runtime)
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stripAnsi(stdoutSpy.mock.calls[0][0] as string);
    expect(output).toContain("Test message with default runtime");
    expect(output).toContain("INFO");

    // Verify that console.log was not called
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("should include data in browser console when includeDataInBrowserConsole is enabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "browser",
      includeDataInBrowserConsole: true,
    });

    const testData = { foo: "bar", nested: { value: 123 } };

    transport.shipToLogger({
      logLevel: "info",
      messages: ["Test message with data"],
      data: testData,
      hasData: true,
    });

    // Verify that console.info was called with both message and data
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("Test message with data"), testData);
  });

  it("should not include data in browser console when includeDataInBrowserConsole is disabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "browser",
      includeDataInBrowserConsole: false,
    });

    const testData = { foo: "bar" };

    transport.shipToLogger({
      logLevel: "info",
      messages: ["Test message with data"],
      data: testData,
      hasData: true,
    });

    // Verify that console.info was called with only the message
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("Test message with data"));
    expect(infoSpy).not.toHaveBeenCalledWith(expect.any(String), testData);
  });

  it("should not include undefined data in browser console even when includeDataInBrowserConsole is enabled", () => {
    const transport = getSimplePrettyTerminal({
      enabled: true,
      viewMode: "inline",
      theme: moonlight,
      runtime: "browser",
      includeDataInBrowserConsole: true,
    });

    transport.shipToLogger({
      logLevel: "info",
      messages: ["Test message without data"],
      data: undefined,
      hasData: false,
    });

    // Verify that console.info was called with only the message (no second parameter)
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("Test message without data"));
    expect(infoSpy).not.toHaveBeenCalledWith(expect.any(String), undefined);
  });
});
