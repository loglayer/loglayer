import { LogLayer } from "loglayer";
import { describe, expect, it, vi } from "vitest";
import { IsolatedContextManager } from "../IsolatedContextManager.js";

// Create a simple mock transport for testing
function createMockTransport(id = "test") {
  const mockShipToLogger = vi.fn().mockReturnValue([]);

  return {
    id,
    enabled: true,
    shipToLogger: mockShipToLogger,
    _sendToLogger: vi.fn(),
    getLoggerInstance: () => ({ mockShipToLogger }),
  };
}

describe("IsolatedContextManager Integration", () => {
  it("should maintain isolated context when used with LogLayer", () => {
    // Create parent logger with isolated context manager
    const parentLog = new LogLayer({
      transport: createMockTransport(),
    }).withContextManager(new IsolatedContextManager());

    // Set context on parent
    parentLog.withContext({ userId: "123", role: "admin" });

    // Create child logger
    const childLog = parentLog.child();

    // Parent should have context
    expect(parentLog.getContext()).toEqual({ userId: "123", role: "admin" });

    // Child should start with empty context (isolation)
    expect(childLog.getContext()).toEqual({});

    // Adding context to child should not affect parent
    childLog.withContext({ sessionId: "abc", action: "read" });

    expect(parentLog.getContext()).toEqual({ userId: "123", role: "admin" });
    expect(childLog.getContext()).toEqual({ sessionId: "abc", action: "read" });

    // Adding more context to parent should not affect child
    parentLog.withContext({ requestId: "xyz" });

    expect(parentLog.getContext()).toEqual({
      userId: "123",
      role: "admin",
      requestId: "xyz",
    });
    expect(childLog.getContext()).toEqual({ sessionId: "abc", action: "read" });
  });

  it("should work with nested child loggers", () => {
    const log1 = new LogLayer({
      transport: createMockTransport(),
    }).withContextManager(new IsolatedContextManager());

    log1.withContext({ level1: "data" });

    const log2 = log1.child();
    log2.withContext({ level2: "data" });

    const log3 = log2.child();
    log3.withContext({ level3: "data" });

    // Each logger should only have its own context
    expect(log1.getContext()).toEqual({ level1: "data" });
    expect(log2.getContext()).toEqual({ level2: "data" });
    expect(log3.getContext()).toEqual({ level3: "data" });
  });

  it("should allow clearing context independently", () => {
    const parentLog = new LogLayer({
      transport: createMockTransport(),
    }).withContextManager(new IsolatedContextManager());

    parentLog.withContext({ parent: "data" });
    const childLog = parentLog.child();
    childLog.withContext({ child: "data" });

    // Clear parent context
    parentLog.clearContext();

    expect(parentLog.getContext()).toEqual({});
    expect(childLog.getContext()).toEqual({ child: "data" });

    // Clear child context
    childLog.clearContext();

    expect(parentLog.getContext()).toEqual({});
    expect(childLog.getContext()).toEqual({});
  });

  it("should preserve isolated behavior with multiple context operations", () => {
    const parentLog = new LogLayer({
      transport: createMockTransport(),
    }).withContextManager(new IsolatedContextManager());

    const childLog = parentLog.child();
    const grandchildLog = childLog.child();

    // Add context at different levels
    parentLog.withContext({ level: "parent" });
    childLog.withContext({ level: "child" });
    grandchildLog.withContext({ level: "grandchild" });

    // Verify isolation
    expect(parentLog.getContext()).toEqual({ level: "parent" });
    expect(childLog.getContext()).toEqual({ level: "child" });
    expect(grandchildLog.getContext()).toEqual({ level: "grandchild" });

    // Modify parent context - should not affect children
    parentLog.withContext({ newKey: "parentValue" });

    expect(parentLog.getContext()).toEqual({
      level: "parent",
      newKey: "parentValue",
    });
    expect(childLog.getContext()).toEqual({ level: "child" });
    expect(grandchildLog.getContext()).toEqual({ level: "grandchild" });

    // Modify child context - should not affect parent or grandchild
    childLog.withContext({ childKey: "childValue" });

    expect(parentLog.getContext()).toEqual({
      level: "parent",
      newKey: "parentValue",
    });
    expect(childLog.getContext()).toEqual({
      level: "child",
      childKey: "childValue",
    });
    expect(grandchildLog.getContext()).toEqual({ level: "grandchild" });
  });

  it("should work correctly with context manager cloning", () => {
    const originalLog = new LogLayer({
      transport: createMockTransport(),
    }).withContextManager(new IsolatedContextManager());

    originalLog.withContext({ original: "data" });

    // Get the context manager and clone it
    const contextManager = originalLog.getContextManager<IsolatedContextManager>();
    const clonedManager = contextManager.clone();

    // Clone should start with empty context (isolated behavior)
    expect(clonedManager.getContext()).toEqual({});
    expect(clonedManager.hasContextData()).toBe(false);

    // Original should be unchanged
    expect(contextManager.getContext()).toEqual({ original: "data" });
    expect(contextManager.hasContextData()).toBe(true);

    // Add context to clone
    clonedManager.setContext({ cloned: "data" });

    // Should not affect original
    expect(contextManager.getContext()).toEqual({ original: "data" });
    expect(clonedManager.getContext()).toEqual({ cloned: "data" });
  });

  it("should handle logger with prefix correctly", () => {
    const parentLog = new LogLayer({
      transport: createMockTransport(),
    }).withContextManager(new IsolatedContextManager());

    parentLog.withContext({ service: "api" });

    // Create child logger with prefix
    const childLog = parentLog.withPrefix("[AUTH]");

    // Child should still start with empty context despite prefix
    expect(childLog.getContext()).toEqual({});
    expect(parentLog.getContext()).toEqual({ service: "api" });

    // Add context to prefixed child
    childLog.withContext({ module: "authentication" });

    expect(parentLog.getContext()).toEqual({ service: "api" });
    expect(childLog.getContext()).toEqual({ module: "authentication" });
  });
});
