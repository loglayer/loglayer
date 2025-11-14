import type { ILogLevelManager, LogLevelType, OnChildLogLevelManagerCreatedParams } from "@loglayer/shared";
import { LogLevel, LogLevelPriority } from "@loglayer/shared";

interface LogLevelEnabledStatus {
  info: boolean;
  warn: boolean;
  error: boolean;
  debug: boolean;
  trace: boolean;
  fatal: boolean;
}

/**
 * The default log level manager used by LogLayer. Children inherit log level from parent,
 * but changes from parent do not propagate down to existing children.
 *
 * @see {@link https://loglayer.dev/log-level-managers/default.html | Default Log Level Manager Docs}
 */
export class DefaultLogLevelManager implements ILogLevelManager {
  private logLevelEnabledStatus: LogLevelEnabledStatus = {
    info: true,
    warn: true,
    error: true,
    debug: true,
    trace: true,
    fatal: true,
  };

  /**
   * Sets the minimum log level to be used by the logger. Only messages with
   * this level or higher severity will be logged.
   */
  setLevel(logLevel: LogLevelType): void {
    const minLogValue = LogLevelPriority[logLevel];

    // Enable levels with value >= minLogValue, disable others
    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];

      this.logLevelEnabledStatus[levelKey] = levelValue >= minLogValue;
    }
  }

  /**
   * Enables a specific log level
   */
  enableIndividualLevel(logLevel: LogLevelType): void {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelEnabledStatus) {
      this.logLevelEnabledStatus[level] = true;
    }
  }

  /**
   * Disables a specific log level
   */
  disableIndividualLevel(logLevel: LogLevelType): void {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelEnabledStatus) {
      this.logLevelEnabledStatus[level] = false;
    }
  }

  /**
   * Checks if a specific log level is enabled
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    const level = logLevel as keyof LogLevelEnabledStatus;
    return this.logLevelEnabledStatus[level];
  }

  /**
   * Enable sending logs to the logging library.
   */
  enableLogging(): void {
    for (const level of Object.keys(this.logLevelEnabledStatus)) {
      this.logLevelEnabledStatus[level as keyof LogLevelEnabledStatus] = true;
    }
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   */
  disableLogging(): void {
    for (const level of Object.keys(this.logLevelEnabledStatus)) {
      this.logLevelEnabledStatus[level as keyof LogLevelEnabledStatus] = false;
    }
  }

  /**
   * Copies the parent log level status to the child log level manager.
   * Children inherit log level from parent, but changes from parent do not propagate down.
   */
  onChildLoggerCreated({ parentLogLevelManager, childLogLevelManager }: OnChildLogLevelManagerCreatedParams) {
    // Copy the parent's log level status to the child
    const parentStatus = (parentLogLevelManager as DefaultLogLevelManager).logLevelEnabledStatus;
    if (childLogLevelManager instanceof DefaultLogLevelManager) {
      childLogLevelManager.logLevelEnabledStatus = { ...parentStatus };
    }
  }

  /**
   * Creates a new instance of the log level manager with the same log level settings.
   */
  clone(): ILogLevelManager {
    const clone = new DefaultLogLevelManager();
    clone.logLevelEnabledStatus = { ...this.logLevelEnabledStatus };
    return clone;
  }
}
