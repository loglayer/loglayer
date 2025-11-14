import type { ILogLevelManager, LogLevelType, OnChildLogLevelManagerCreatedParams } from "@loglayer/log-level-manager";
import { LogLevel, LogLevelPriority } from "@loglayer/log-level-manager";

interface LogLevelEnabledStatus {
  info: boolean;
  warn: boolean;
  error: boolean;
  debug: boolean;
  trace: boolean;
  fatal: boolean;
}

// Global shared state container for all loggers
const globalLogLevelContainer: { status: LogLevelEnabledStatus } = {
  status: {
    info: true,
    warn: true,
    error: true,
    debug: true,
    trace: true,
    fatal: true,
  },
};

/**
 * A log level manager that applies log level changes to all loggers globally,
 * regardless of whether they are parent or child loggers.
 */
export class GlobalLogLevelManager implements ILogLevelManager {
  /**
   * Sets the minimum log level to be used by the logger. Only messages with
   * this level or higher severity will be logged.
   * This change applies to all loggers globally.
   */
  setLevel(logLevel: LogLevelType): void {
    const minLogValue = LogLevelPriority[logLevel];

    // Enable levels with value >= minLogValue, disable others
    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];

      globalLogLevelContainer.status[levelKey] = levelValue >= minLogValue;
    }
  }

  /**
   * Enables a specific log level.
   * This change applies to all loggers globally.
   */
  enableIndividualLevel(logLevel: LogLevelType): void {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in globalLogLevelContainer.status) {
      globalLogLevelContainer.status[level] = true;
    }
  }

  /**
   * Disables a specific log level.
   * This change applies to all loggers globally.
   */
  disableIndividualLevel(logLevel: LogLevelType): void {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in globalLogLevelContainer.status) {
      globalLogLevelContainer.status[level] = false;
    }
  }

  /**
   * Checks if a specific log level is enabled
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    const level = logLevel as keyof LogLevelEnabledStatus;
    return globalLogLevelContainer.status[level];
  }

  /**
   * Enable sending logs to the logging library.
   * This change applies to all loggers globally.
   */
  enableLogging(): void {
    for (const level of Object.keys(globalLogLevelContainer.status)) {
      globalLogLevelContainer.status[level as keyof LogLevelEnabledStatus] = true;
    }
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   * This change applies to all loggers globally.
   */
  disableLogging(): void {
    for (const level of Object.keys(globalLogLevelContainer.status)) {
      globalLogLevelContainer.status[level as keyof LogLevelEnabledStatus] = false;
    }
  }

  /**
   * Links the child log level manager to use the same global state container.
   */
  onChildLoggerCreated({ childLogLevelManager }: OnChildLogLevelManagerCreatedParams) {
    // Share the same global state container between parent and child
    if (childLogLevelManager instanceof GlobalLogLevelManager) {
      // Already using the global container, no action needed
      return;
    }
    // If child is not a GlobalLogLevelManager, we can't link it
    // This is expected behavior - the child should also be a GlobalLogLevelManager
  }

  /**
   * Creates a new instance of the log level manager that shares the same global state.
   * All instances share the same global log level settings.
   */
  clone(): ILogLevelManager {
    const clone = new GlobalLogLevelManager();
    // All instances share the same global container, so no need to copy
    return clone;
  }
}
