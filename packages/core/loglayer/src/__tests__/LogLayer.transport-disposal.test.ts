import { describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";

function createDisposableTransport(id: string) {
  const disposeSpy = vi.fn();
  const transport = new ConsoleTransport({
    id,
    // @ts-expect-error
    logger: new TestLoggingLibrary(),
  });

  // Add Symbol.dispose method
  Object.defineProperty(transport, Symbol.dispose, {
    value: disposeSpy,
    writable: true,
    configurable: true,
  });
  return { transport, disposeSpy };
}

describe("LogLayer transport disposal", () => {
  it("should dispose of single transport when replacing it", () => {
    const { transport: transport1, disposeSpy: disposeSpy1 } = createDisposableTransport("transport1");
    const { transport: transport2, disposeSpy: disposeSpy2 } = createDisposableTransport("transport2");

    const log = new LogLayer({
      transport: transport1,
    });

    // Replace transport
    log.withFreshTransports(transport2);

    // Verify transport1 was disposed
    expect(disposeSpy1).toHaveBeenCalledTimes(1);
    // Verify transport2 was not disposed
    expect(disposeSpy2).not.toHaveBeenCalled();
  });

  it("should dispose of multiple transports when replacing them", () => {
    const { transport: transport1, disposeSpy: disposeSpy1 } = createDisposableTransport("transport1");
    const { transport: transport2, disposeSpy: disposeSpy2 } = createDisposableTransport("transport2");
    const { transport: transport3, disposeSpy: disposeSpy3 } = createDisposableTransport("transport3");

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    // Replace transports
    log.withFreshTransports(transport3);

    // Verify transport1 and transport2 were disposed
    expect(disposeSpy1).toHaveBeenCalledTimes(1);
    expect(disposeSpy2).toHaveBeenCalledTimes(1);
    // Verify transport3 was not disposed
    expect(disposeSpy3).not.toHaveBeenCalled();
  });

  it("should not fail when transport has no dispose method", () => {
    const transport1 = new ConsoleTransport({
      id: "transport1",
      // @ts-expect-error
      logger: new TestLoggingLibrary(),
    });
    const { transport: transport2, disposeSpy: disposeSpy2 } = createDisposableTransport("transport2");

    const log = new LogLayer({
      transport: transport1,
    });

    // This should not throw
    expect(() => log.withFreshTransports(transport2)).not.toThrow();
    // Verify transport2 was not disposed
    expect(disposeSpy2).not.toHaveBeenCalled();
  });
});
