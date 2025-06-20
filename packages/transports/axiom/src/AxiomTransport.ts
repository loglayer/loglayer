import type { Axiom } from "@axiomhq/js";
import type { LogLayerTransportConfig, LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import { BaseTransport, LogLevelPriority } from "@loglayer/transport";

export interface AxiomFieldNames {
  /**
   * Field name for the log level
   * @default "level"
   */
  level?: string;
  /**
   * Field name for the log message
   * @default "message"
   */
  message?: string;
  /**
   * Field name for the timestamp
   * @default "timestamp"
   */
  timestamp?: string;
}

export interface AxiomLevelMap {
  /**
   * Mapping for the 'fatal' log level
   * @example 60 or "FATAL"
   */
  fatal?: string | number;
  /**
   * Mapping for the 'error' log level
   * @example 50 or "ERROR"
   */
  error?: string | number;
  /**
   * Mapping for the 'warn' log level
   * @example 40 or "WARN"
   */
  warn?: string | number;
  /**
   * Mapping for the 'info' log level
   * @example 30 or "INFO"
   */
  info?: string | number;
  /**
   * Mapping for the 'debug' log level
   * @example 20 or "DEBUG"
   */
  debug?: string | number;
  /**
   * Mapping for the 'trace' log level
   * @example 10 or "TRACE"
   */
  trace?: string | number;
}

export interface AxiomTransportConfig extends LogLayerTransportConfig<Axiom> {
  /**
   * The Axiom dataset name to send logs to
   */
  dataset: string;

  /**
   * Custom field names for the log entry JSON
   * Default: { level: "level", message: "message", timestamp: "timestamp" }
   */
  fieldNames?: AxiomFieldNames;

  /**
   * Optional function to generate timestamps.
   * If not provided, defaults to ISO string from new Date()
   */
  timestampFn?: () => string | number;

  /**
   * Optional callback for error handling
   */
  onError?: (error: Error) => void;

  /**
   * Custom mapping for log levels.
   * Each log level can be mapped to either a string or number.
   * Example: { error: 50, warn: 40, info: 30, debug: 20, trace: 10, fatal: 60 }
   * Example: { error: "ERROR", warn: "WARN", info: "INFO", debug: "DEBUG", trace: "TRACE", fatal: "FATAL" }
   */
  levelMap?: AxiomLevelMap;

  /**
   * Minimum log level to process. Defaults to "trace".
   */
  level?: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}

export class AxiomTransport extends BaseTransport<Axiom> implements Disposable {
  private dataset: string;
  private fieldNames: Required<AxiomFieldNames>;
  private timestampFn?: () => string | number;
  private onError?: (error: Error) => void;
  private exitHandlers: Array<() => void> = [];
  private isDisposing: boolean;
  private isFlushing: boolean;
  private levelMap?: AxiomLevelMap;
  private level?: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";

  constructor(config: AxiomTransportConfig) {
    super(config);
    this.dataset = config.dataset;
    this.fieldNames = {
      level: config.fieldNames?.level ?? "level",
      message: config.fieldNames?.message ?? "message",
      timestamp: config.fieldNames?.timestamp ?? "timestamp",
    };
    this.timestampFn = config.timestampFn;
    this.onError = config.onError;
    this.isDisposing = false;
    this.isFlushing = false;
    this.levelMap = config.levelMap;
    this.level = config.level;

    this.setupExitHandlers();
  }

  private setupExitHandlers() {
    // Handle graceful shutdowns (allows async operations)
    const beforeExitHandler = async () => {
      if (!this.isDisposing && !this.isFlushing) {
        try {
          await this.flush();
        } catch (error) {
          if (this.onError) {
            this.onError(error as Error);
          }
        }
      }
    };
    process.on("beforeExit", beforeExitHandler);
    this.exitHandlers.push(() => process.off("beforeExit", beforeExitHandler));

    // Handle SIGINT (Ctrl+C)
    const sigintHandler = () => {
      if (!this.isDisposing && !this.isFlushing) {
        // Synchronously flush logs to ensure they're written before exit
        try {
          this.flushSync();
        } catch (error) {
          if (this.onError) {
            this.onError(error as Error);
          }
        }
        process.exit(130); // 128 + SIGINT(2)
      }
    };
    process.on("SIGINT", sigintHandler);
    this.exitHandlers.push(() => process.off("SIGINT", sigintHandler));

    // Handle SIGTERM
    const sigtermHandler = () => {
      if (!this.isDisposing && !this.isFlushing) {
        // Synchronously flush logs to ensure they're written before exit
        try {
          this.flushSync();
        } catch (error) {
          if (this.onError) {
            this.onError(error as Error);
          }
        }
        process.exit(143); // 128 + SIGTERM(15)
      }
    };
    process.on("SIGTERM", sigtermHandler);
    this.exitHandlers.push(() => process.off("SIGTERM", sigtermHandler));

    // Handle exit (must be synchronous)
    const exitHandler = () => {
      if (!this.isDisposing && !this.isFlushing) {
        this.isFlushing = true;
        try {
          // Call flush synchronously since we're in the exit handler
          this.flushSync();
        } catch (error) {
          if (this.onError) {
            this.onError(error as Error);
          }
        } finally {
          this.isFlushing = false;
        }
      }
    };
    process.on("exit", exitHandler);
    this.exitHandlers.push(() => process.off("exit", exitHandler));
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    // Don't accept new logs if we're disposing
    if (this.isDisposing) {
      return messages;
    }

    // Skip if log level is lower priority than configured minimum
    if (this.level && LogLevelPriority[logLevel] < LogLevelPriority[this.level]) {
      return messages;
    }

    // Combine all messages into a single string
    const message = messages.join(" ");

    // Map the log level if a mapping exists
    const mappedLevel = this.levelMap?.[logLevel] ?? logLevel;

    // Create the log entry
    const logEntry: Record<string, any> = {
      [this.fieldNames.message]: message,
      [this.fieldNames.level]: mappedLevel,
      [this.fieldNames.timestamp]: this.timestampFn ? this.timestampFn() : new Date().toISOString(),
    };

    // Add any additional data
    if (data && hasData) {
      Object.assign(logEntry, data);
    }

    // Send to Axiom
    try {
      this.logger.ingest(this.dataset, [logEntry]);
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      }
    }

    return messages;
  }

  /**
   * Manually flush logs to Axiom.
   * This is automatically called on process exit.
   */
  private async flush(): Promise<void> {
    if (this.isFlushing || this.isDisposing) {
      return;
    }

    this.isFlushing = true;

    try {
      await this.logger.flush();
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Synchronously flush logs to Axiom.
   * This is used during process termination (SIGINT/SIGTERM) to ensure logs are written
   * before the process exits.
   * @private
   */
  private flushSync(): void {
    if (this.isFlushing || this.isDisposing) {
      return;
    }

    this.isFlushing = true;
    try {
      // Call flush synchronously and handle the promise immediately
      Promise.resolve(this.logger.flush()).catch((error) => {
        if (this.onError) {
          this.onError(error as Error);
        }
      });
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Clean up resources and remove event listeners.
   * This method:
   * 1. Prevents new operations from starting
   * 2. Flushes any pending logs
   * 3. Removes event handlers
   * 4. Waits for any in-progress operations to complete
   */
  [Symbol.dispose](): Promise<void> {
    if (this.isDisposing) {
      return Promise.resolve();
    }

    this.isDisposing = true;

    // Remove all event listeners
    for (const cleanup of this.exitHandlers) {
      cleanup();
    }
    this.exitHandlers = [];

    const checkAndFinish = async () => {
      if (!this.isFlushing) {
        return;
      }
      // Wait a bit and check again if still flushing
      await new Promise((resolve) => setTimeout(resolve, 100));
      return checkAndFinish();
    };

    // Flush any remaining logs and wait for completion
    return this.flush()
      .then(() => checkAndFinish())
      .catch((error) => {
        if (this.onError) {
          this.onError(error as Error);
        }
      });
  }
}
