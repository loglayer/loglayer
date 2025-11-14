import type { ILogLevelManager, LogLevelType, OnChildLogLevelManagerCreatedParams } from "@loglayer/shared";

/**
 * A mock log level manager for testing purposes.
 * All log levels are enabled by default.
 */
export class MockLogLevelManager implements ILogLevelManager {
  setLevel(_logLevel: LogLevelType): void {
    // Mock implementation
  }

  enableIndividualLevel(_logLevel: LogLevelType): void {
    // Mock implementation
  }

  disableIndividualLevel(_logLevel: LogLevelType): void {
    // Mock implementation
  }

  isLevelEnabled(_logLevel: LogLevelType): boolean {
    return true;
  }

  enableLogging(): void {
    // Mock implementation
  }

  disableLogging(): void {
    // Mock implementation
  }

  onChildLoggerCreated(_params: OnChildLogLevelManagerCreatedParams): void {
    // Mock implementation
  }

  clone(): ILogLevelManager {
    return new MockLogLevelManager();
  }
}
