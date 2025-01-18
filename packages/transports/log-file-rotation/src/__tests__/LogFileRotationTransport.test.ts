import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, readFile, readdir, readlink, rm } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { LogLevel } from "@loglayer/transport";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LogFileRotationTransport } from "../LogFileRotationTransport.js";

const TEST_DIR = join(__dirname, "test-logs");
const WAIT_TIME = 500; // Increased wait time for file operations

describe("LogFileRotationTransport", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  async function waitForFileOperation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  }

  async function readCompressedFile(filePath: string): Promise<string> {
    const gunzip = createGunzip();
    const tempPath = filePath.replace(".gz", ".tmp");
    const source = createReadStream(filePath);
    const destination = createWriteStream(tempPath);

    await pipeline(source, gunzip, destination);
    const content = await readFile(tempPath, "utf8");
    await rm(tempPath);
    return content;
  }

  test("should write log entries with custom field names", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "custom-fields.log"),
      fieldNames: {
        level: "severity",
        message: "msg",
        timestamp: "time",
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: { test: true },
      hasData: true,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "custom-fields.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry).toHaveProperty("severity", "info");
    expect(logEntry).toHaveProperty("msg", "Test message");
    expect(logEntry).toHaveProperty("test", true);
    expect(logEntry).toHaveProperty("time");
  });

  test("should use numeric level mapping", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "level-map.log"),
      levelMap: {
        info: 30,
        error: 50,
        warn: 40,
        debug: 20,
        trace: 10,
        fatal: 60,
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "level-map.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry.level).toBe(30);
  });

  test("should use string level mapping", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "string-level-map.log"),
      levelMap: {
        info: "INFO",
        error: "ERROR",
        warn: "WARNING",
        debug: "DEBUG",
        trace: "TRACE",
        fatal: "FATAL",
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.error,
      messages: ["Error message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "string-level-map.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry.level).toBe("ERROR");
  });

  test("should use custom timestamp function", async () => {
    const timestamp = 1705499445123;
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "custom-timestamp.log"),
      timestampFn: () => timestamp,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "custom-timestamp.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry.timestamp).toBe(timestamp);
  });

  test("should use custom delimiter", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "custom-delimiter.log"),
      delimiter: ";\n",
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["First message"],
      data: {},
      hasData: false,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Second message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "custom-delimiter.log"), "utf8");

    expect(content).toContain(";\n");
    expect(content.split(";\n").length).toBe(3); // 2 messages + empty string from split
  });

  test("should compress rotated files", async () => {
    const onRotate = vi.fn();
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "compress-test"),
      size: "1k",
      extension: ".log", // Add extension to ensure proper file naming
      compressOnRotate: true,
      callbacks: { onRotate },
    });

    // Wait for initial file to be created and opened
    await vi.waitFor(
      async () => {
        const files = await readdir(TEST_DIR);
        return files.some((f) => f === "compress-test.log");
      },
      { timeout: 5000, interval: 100 },
    );

    // Write enough data to trigger rotation
    const message = "A".repeat(200); // Increased from 50 to 200 to ensure we exceed 1k
    for (let i = 0; i < 10; i++) {
      // Increased from 5 to 10 messages
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: [message + i],
        data: { test: true },
        hasData: true,
      });
      await waitForFileOperation();
    }

    // Wait for rotation to occur and compression to complete
    await vi.waitFor(
      async () => {
        const files = await readdir(TEST_DIR);
        return files.some((f) => f.endsWith(".gz")) && onRotate.mock.calls.length > 0;
      },
      { timeout: 10000, interval: 100 },
    );

    // Additional wait to ensure compression is complete
    await waitForFileOperation();

    const files = await readdir(TEST_DIR);
    const gzFiles = files.filter((f) => f.endsWith(".gz"));
    expect(gzFiles.length).toBeGreaterThan(0);

    const compressedContent = await readCompressedFile(join(TEST_DIR, gzFiles[0]));
    expect(compressedContent).toContain(message);
  }, 20000);

  test("should handle file existence during compression", async () => {
    const onRotate = vi.fn();
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "duplicate-test"),
      size: "1k",
      extension: ".log", // Add extension to ensure proper file naming
      compressOnRotate: true,
      callbacks: { onRotate },
    });

    // Wait for initial file to be created and opened
    await vi.waitFor(
      async () => {
        const files = await readdir(TEST_DIR);
        return files.some((f) => f === "duplicate-test.log");
      },
      { timeout: 5000, interval: 100 },
    );

    // Write enough data to trigger multiple rotations
    const message = "A".repeat(200); // Increased from 50 to 200 to ensure we exceed 1k
    for (let i = 0; i < 10; i++) {
      // Increased from 5 to 10 messages
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: [message + i],
        data: { test: true },
        hasData: true,
      });
      await waitForFileOperation();
    }

    // Wait for rotation to occur and compression to complete
    await vi.waitFor(
      async () => {
        const files = await readdir(TEST_DIR);
        return files.some((f) => f.endsWith(".gz")) && onRotate.mock.calls.length > 0;
      },
      { timeout: 10000, interval: 100 },
    );

    // Additional wait to ensure compression is complete
    await waitForFileOperation();

    const files = await readdir(TEST_DIR);
    const compressedFiles = files.filter((f) => f.endsWith(".gz"));
    expect(compressedFiles.length).toBeGreaterThan(0);
    expect(compressedFiles[0]).toMatch(/duplicate-test\.\d+\.log\.gz/);
  }, 20000);

  test("should handle all callback events", async () => {
    const callbacks = {
      onRotate: vi.fn(),
      onNew: vi.fn(),
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onFinish: vi.fn(),
      onLogRemoved: vi.fn(),
    };

    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "callback-test"),
      size: "1k",
      extension: ".log", // Add extension to ensure proper file naming
      callbacks,
    });

    // Wait for initial file to be created and opened
    await vi.waitFor(
      async () => {
        const files = await readdir(TEST_DIR);
        return files.some((f) => f === "callback-test.log") && callbacks.onOpen.mock.calls.length > 0;
      },
      { timeout: 5000, interval: 100 },
    );

    // Write enough data to trigger rotation
    const message = "A".repeat(200); // Increased from 50 to 200 to ensure we exceed 1k
    for (let i = 0; i < 10; i++) {
      // Increased from 5 to 10 messages
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: [message + i],
        data: { test: true },
        hasData: true,
      });
      await waitForFileOperation();
    }

    // Write more data to trigger additional events
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["final message"],
      data: {},
      hasData: false,
    });

    // Wait for rotation to occur
    await vi.waitFor(() => callbacks.onRotate.mock.calls.length > 0, { timeout: 10000, interval: 100 });

    // Dispose to trigger close and finish events
    transport[Symbol.dispose]();

    // Wait for all callbacks with increased timeout
    await vi.waitFor(
      () => {
        return (
          callbacks.onRotate.mock.calls.length > 0 &&
          callbacks.onOpen.mock.calls.length > 0 &&
          callbacks.onClose.mock.calls.length > 0
        );
      },
      { timeout: 15000, interval: 100 },
    );

    expect(callbacks.onRotate).toHaveBeenCalled();
    expect(callbacks.onOpen).toHaveBeenCalled();
    expect(callbacks.onClose).toHaveBeenCalled();
  }, 30000);

  test("should handle errors gracefully", async () => {
    const onError = vi.fn();
    const readOnlyDir = join(TEST_DIR, "readonly");
    await mkdir(readOnlyDir, { mode: 0o444 });

    const transport = new LogFileRotationTransport({
      filename: join(readOnlyDir, "error-test.log"),
      callbacks: { onError },
    });

    // Write multiple messages to ensure error is triggered
    const message = "A".repeat(1000);
    for (let i = 0; i < 5; i++) {
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: [message + i],
        data: {},
        hasData: false,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Wait for error callback
    await vi.waitFor(() => onError.mock.calls.length > 0, { timeout: 10000, interval: 100 });
    expect(onError).toHaveBeenCalled();
  }, 20000);

  test("should create symlink to current log file", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "symlink-test.log"),
      createSymlink: true,
      symlinkName: "current.log",
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const symlinkPath = join(TEST_DIR, "current.log");
    const target = await readlink(symlinkPath);
    expect(target).toContain("symlink-test.log");
  });

  test("should use custom file options", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "file-options-test.log"),
      fileOptions: {
        flags: "a",
        encoding: "utf8",
        mode: 0o666,
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    // Check if file exists and is readable
    await expect(access(join(TEST_DIR, "file-options-test.log"))).resolves.toBeUndefined();
  });

  test("should use fileMode parameter for file permissions", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "file-mode-test.log"),
      fileMode: 0o644,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    // Check if file exists and is readable
    await expect(access(join(TEST_DIR, "file-mode-test.log"))).resolves.toBeUndefined();
  });

  test("should prioritize fileOptions.mode over fileMode", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "file-mode-priority-test.log"),
      fileMode: 0o644,
      fileOptions: {
        mode: 0o666,
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    // Check if file exists and is readable
    await expect(access(join(TEST_DIR, "file-mode-priority-test.log"))).resolves.toBeUndefined();
  });

  test("should concatenate multiple messages", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "multi-message-test.log"),
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["First part", "Second part", "Third part"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "multi-message-test.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry.message).toBe("First part Second part Third part");
  });

  test("should respect maxLogs limit", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "max-logs-test.log"),
      size: "1k",
      maxLogs: 2,
    });

    // Write enough data to create multiple log files
    for (let i = 0; i < 10; i++) {
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: [`Test message ${i}`],
        data: {},
        hasData: false,
      });
      await waitForFileOperation();
    }

    transport[Symbol.dispose]();
    await waitForFileOperation();

    // Wait for file cleanup
    await vi.waitFor(
      async () => {
        const files = await readdir(TEST_DIR);
        const logFiles = files.filter((f) => f.startsWith("max-logs-test"));
        return logFiles.length <= 2;
      },
      { timeout: 10000 },
    );

    const files = await readdir(TEST_DIR);
    const logFiles = files.filter((f) => f.startsWith("max-logs-test"));
    expect(logFiles.length).toBeLessThanOrEqual(2);
  }, 20000);

  test("should prevent creating multiple transports with the same filename", () => {
    const filename = join(TEST_DIR, "shared.log");

    // Create first transport
    const transport1 = new LogFileRotationTransport({
      filename,
    });

    // Attempt to create second transport with same filename
    expect(() => {
      new LogFileRotationTransport({
        filename,
      });
    }).toThrow(/Filename .* is already in use by another instance/);

    transport1[Symbol.dispose]();
  });

  test("should allow reusing filename after transport is disposed", async () => {
    const filename = join(TEST_DIR, "reuse.log");

    // Create and dispose first transport
    const transport1 = new LogFileRotationTransport({
      filename,
    });
    transport1[Symbol.dispose]();
    await waitForFileOperation();

    // Should be able to create new transport with same filename
    expect(() => {
      const transport2 = new LogFileRotationTransport({
        filename,
      });
      transport2[Symbol.dispose]();
    }).not.toThrow();
  });

  test("should properly cleanup filename registry on dispose", async () => {
    const filename = join(TEST_DIR, "cleanup.log");

    const transport = new LogFileRotationTransport({
      filename,
    });

    // Verify filename is registered
    expect(() => {
      new LogFileRotationTransport({
        filename,
      });
    }).toThrow();

    // Dispose transport
    transport[Symbol.dispose]();
    await waitForFileOperation();

    // Verify filename is unregistered
    expect(() => {
      const transport2 = new LogFileRotationTransport({
        filename,
      });
      transport2[Symbol.dispose]();
    }).not.toThrow();
  });

  test("should batch log entries when batching is enabled", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "batch-test.log"),
      batch: {
        size: 3,
        timeout: 1000,
      },
    });

    // Write two messages (less than batchSize)
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["First message"],
      data: {},
      hasData: false,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Second message"],
      data: {},
      hasData: false,
    });

    // Wait a bit and check that file doesn't exist yet (logs are queued)
    await waitForFileOperation();
    await expect(access(join(TEST_DIR, "batch-test.log"))).rejects.toThrow();

    // Write third message to trigger batch flush
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Third message"],
      data: {},
      hasData: false,
    });

    // Wait for flush and check file content
    await waitForFileOperation();
    const content = await readFile(join(TEST_DIR, "batch-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs).toHaveLength(3);
    expect(logs[0].message).toBe("First message");
    expect(logs[1].message).toBe("Second message");
    expect(logs[2].message).toBe("Third message");

    transport[Symbol.dispose]();
  });

  test("should flush batch on timeout", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "batch-timeout-test.log"),
      batch: {
        size: 5,
        timeout: 100, // Short timeout for testing
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for timeout flush
    await new Promise((resolve) => setTimeout(resolve, 200));

    const content = await readFile(join(TEST_DIR, "batch-timeout-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe("Test message");

    transport[Symbol.dispose]();
  });

  test("should flush batch on dispose", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "batch-dispose-test.log"),
      batch: {
        size: 5,
        timeout: 5000,
      },
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message 1"],
      data: {},
      hasData: false,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message 2"],
      data: {},
      hasData: false,
    });

    // Dispose immediately without waiting for timeout
    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "batch-dispose-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs).toHaveLength(2);
    expect(logs[0].message).toBe("Test message 1");
    expect(logs[1].message).toBe("Test message 2");
  });

  test("should handle large batch sizes", async () => {
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "large-batch-test.log"),
      batch: {
        size: 100,
        timeout: 5000,
      },
    });

    // Write 150 messages to test multiple batch flushes
    for (let i = 0; i < 150; i++) {
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: [`Message ${i}`],
        data: {},
        hasData: false,
      });
    }

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "large-batch-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs).toHaveLength(150);
    for (let i = 0; i < 150; i++) {
      expect(logs[i].message).toBe(`Message ${i}`);
    }
  });

  test("should flush batch on process signals", async () => {
    // Mock process.exit before creating transport
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "signal-test.log"),
      batch: {
        size: 5,
        timeout: 5000,
      },
    });

    // Write some messages
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Message before signal"],
      data: {},
      hasData: false,
    });

    // Simulate SIGTERM signal
    process.emit("SIGTERM");

    // Wait for file operations
    await waitForFileOperation();

    // Check that logs were written
    const content = await readFile(join(TEST_DIR, "signal-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe("Message before signal");
    expect(mockExit).toHaveBeenCalledWith(143); // SIGTERM exit code

    mockExit.mockRestore();
  });

  test("should handle SIGINT signal", async () => {
    // Mock process.exit before creating transport
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "sigint-test.log"),
      batch: {
        size: 5,
        timeout: 5000,
      },
    });

    // Write some messages
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Message before interrupt"],
      data: {},
      hasData: false,
    });

    // Simulate SIGINT signal (Ctrl+C)
    process.emit("SIGINT");

    // Wait for file operations
    await waitForFileOperation();

    // Check that logs were written
    const content = await readFile(join(TEST_DIR, "sigint-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe("Message before interrupt");
    expect(mockExit).toHaveBeenCalledWith(130); // SIGINT exit code

    mockExit.mockRestore();
  });

  test("should include static data from function in log entries", async () => {
    const staticData = {
      hostname: "test-host",
      pid: 12345,
      environment: "test",
    };

    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "static-data-fn-test.log"),
      staticData: () => staticData,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: { customField: "value" },
      hasData: true,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "static-data-fn-test.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry).toMatchObject({
      level: "info",
      message: "Test message",
      ...staticData,
      customField: "value",
    });
  });

  test("should include static data from object in log entries", async () => {
    const staticData = {
      hostname: "test-host",
      pid: 12345,
      environment: "test",
    };

    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "static-data-obj-test.log"),
      staticData, // Use object directly
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: { customField: "value" },
      hasData: true,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "static-data-obj-test.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry).toMatchObject({
      level: "info",
      message: "Test message",
      ...staticData,
      customField: "value",
    });
  });

  test("should allow dynamic data to override static data", async () => {
    const staticData = {
      environment: "production",
      version: "1.0.0",
    };

    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "static-data-override-test.log"),
      staticData, // Use object directly
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Test message"],
      data: { environment: "test" }, // This should override the static environment
      hasData: true,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "static-data-override-test.log"), "utf8");
    const logEntry = JSON.parse(content);

    expect(logEntry.environment).toBe("test"); // Dynamic value should win
    expect(logEntry.version).toBe("1.0.0"); // Static value should remain
  });

  test("should handle dynamic values in static data function", async () => {
    let counter = 0;
    const transport = new LogFileRotationTransport({
      filename: join(TEST_DIR, "static-data-dynamic-test.log"),
      staticData: () => ({
        counter: counter++, // This value should increment with each call
        constant: "fixed", // This value should remain the same
      }),
    });

    // Write two log entries
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["First message"],
      data: {},
      hasData: false,
    });

    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Second message"],
      data: {},
      hasData: false,
    });

    transport[Symbol.dispose]();
    await waitForFileOperation();

    const content = await readFile(join(TEST_DIR, "static-data-dynamic-test.log"), "utf8");
    const logs = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(logs[0].counter).toBe(0); // First log entry should have counter = 0
    expect(logs[1].counter).toBe(1); // Second log entry should have counter = 1
    expect(logs[0].constant).toBe("fixed"); // Constant value should remain the same
    expect(logs[1].constant).toBe("fixed"); // Constant value should remain the same
  });
});
