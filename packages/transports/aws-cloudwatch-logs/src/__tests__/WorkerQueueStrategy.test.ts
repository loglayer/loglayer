import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkerQueueStrategy } from "../strategies/worker-queue/worker-queue.strategy.js";

// Mock the worker thread module
const mockWorker = {
  postMessage: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  terminate: vi.fn(),
};

vi.mock("node:worker_threads", () => ({
  Worker: vi.fn(function () {
    return mockWorker;
  }),
}));

// Mock the exit hook
vi.mock("../../vendor/exit-hook/index.js", () => ({
  addExitHook: vi.fn(),
}));

// Mock the worker file
vi.mock("../strategies/worker-queue/worker.js?thread", () => ({
  default: vi.fn(function () {
    return {
      postMessage: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      terminate: vi.fn(),
    };
  }),
}));

describe("WorkerQueueStrategy", () => {
  let strategy: WorkerQueueStrategy;
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new WorkerQueueStrategy({ createIfNotExists: false });
    strategy._configure({ onError });
  });

  it("should initialize worker on first sendEvent call", () => {
    strategy.sendEvent({
      event: { timestamp: Date.now(), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });

    // Check that the worker was created and postMessage was called
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: "event",
      event: { timestamp: expect.any(Number), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });
  });

  it("should validate batch size", () => {
    expect(() => new WorkerQueueStrategy({ batchSize: 1 })).not.toThrow();
    expect(() => new WorkerQueueStrategy({ batchSize: 10001 })).toThrow("Batch size must be between 1 and 10000");
    expect(() => new WorkerQueueStrategy({ batchSize: 1000 })).not.toThrow();
    expect(() => new WorkerQueueStrategy({ batchSize: 0 })).toThrow("Batch size must be between 1 and 10000");
    expect(() => new WorkerQueueStrategy()).not.toThrow();
  });

  it("should validate delay", () => {
    expect(() => new WorkerQueueStrategy({ delay: 0 })).toThrow("The specified delay is must be bigger than 0");
    expect(() => new WorkerQueueStrategy({ delay: 1000 })).not.toThrow();
  });

  it("should handle cleanup when worker exists", () => {
    // Initialize worker
    strategy.sendEvent({
      event: { timestamp: Date.now(), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });

    const cleanupPromise = strategy.cleanup();

    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: "stop" });
    expect(cleanupPromise).toBeInstanceOf(Promise);
  });

  it("should handle cleanup when no worker exists", () => {
    const cleanupPromise = strategy.cleanup();
    expect(cleanupPromise).toBeUndefined();
  });

  it("should setup error handlers when onError is provided", () => {
    strategy.sendEvent({
      event: { timestamp: Date.now(), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });

    expect(mockWorker.on).toHaveBeenCalledWith("error", onError);
    expect(mockWorker.on).toHaveBeenCalledWith("messageerror", onError);
    expect(mockWorker.on).toHaveBeenCalledWith("message", expect.any(Function));
  });
});
