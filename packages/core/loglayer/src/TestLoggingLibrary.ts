import { LogLevel } from "@loglayer/shared";

/**
 * A test logging library that can be used to test LogLayer plugins and transports.
 * It is meant to be used with the TestTransport.
 */
export class TestLoggingLibrary {
  /**
   * An array of log lines that have been logged.
   */
  lines: Array<{
    level: LogLevel;
    data: any[];
  }>;

  constructor() {
    this.lines = [];
  }

  info(...params: any[]) {
    this.addLine(LogLevel.info, params);
  }

  warn(...params: any[]) {
    this.addLine(LogLevel.warn, params);
  }

  error(...params: any[]) {
    this.addLine(LogLevel.error, params);
  }

  debug(...params: any[]) {
    this.addLine(LogLevel.debug, params);
  }

  trace(...params: any[]) {
    this.addLine(LogLevel.trace, params);
  }

  fatal(...params: any[]) {
    this.addLine(LogLevel.fatal, params);
  }

  private addLine(logLevel: LogLevel, params: any[]) {
    this.lines.push({
      level: logLevel,
      data: params,
    });
  }

  /**
   * Get the last line that was logged. Returns null if no lines have been logged.
   */
  getLastLine() {
    if (!this.lines.length) {
      return null;
    }

    return this.lines[this.lines.length - 1];
  }

  /**
   * Pops the last line that was logged. Returns null if no lines have been logged.
   */
  popLine() {
    return this.lines.pop();
  }

  /**
   * Clears all lines that have been logged.
   */
  clearLines() {
    this.lines = [];
  }
}
