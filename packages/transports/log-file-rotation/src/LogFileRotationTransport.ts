import type { WriteStream } from "node:fs";
import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { access, unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import type { LoggerlessTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { LoggerlessTransport } from "@loglayer/transport";
import FileStreamRotator from "file-stream-rotator";

interface FileStreamRotatorOptions {
  filename: string;
  frequency?: string;
  verbose?: boolean;
  date_format?: string;
  size?: string;
  max_logs?: string;
  audit_file?: string;
  end_stream?: boolean;
  extension?: string;
  create_symlink?: boolean;
  symlink_name?: string;
  utc?: boolean;
  audit_hash_type?: "md5" | "sha256";
  file_options?: {
    flags?: string;
    encoding?: string;
    mode?: number;
  };
}

export interface LogFileRotationCallbacks {
  /**
   * Called when a log file is rotated
   * @param oldFile - The path to the old log file
   * @param newFile - The path to the new log file
   */
  onRotate?: (oldFile: string, newFile: string) => void;
  /**
   * Called when a new log file is created
   * @param newFile - The path to the new log file
   */
  onNew?: (newFile: string) => void;
  /**
   * Called when a log file is opened
   */
  onOpen?: () => void;
  /**
   * Called when a log file is closed
   */
  onClose?: () => void;
  /**
   * Called when an error occurs
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
  /**
   * Called when the stream is finished
   */
  onFinish?: () => void;
  /**
   * Called when a log file is removed due to retention policy
   * @param info - Information about the removed log file
   */
  onLogRemoved?: (info: { date: number; name: string; hash: string }) => void;
}

export interface LogFileRotationFieldNames {
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

export interface LogFileRotationLevelMap {
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

export interface LogFileRotationBatchConfig {
  /**
   * Maximum number of log entries to queue before writing.
   * Default: 1000
   */
  size?: number;
  /**
   * Maximum time in milliseconds to wait before writing queued logs.
   * Default: 5000 (5 seconds)
   */
  timeout?: number;
}

export interface LogFileRotationTransportConfig extends LoggerlessTransportConfig {
  /**
   * The filename pattern to use for the log files.
   * Supports date format using numerical values.
   * Example: "./logs/application-%DATE%.log"
   */
  filename: string;
  /**
   * Static data to be included in every log entry.
   * Can be either:
   * - A function that returns an object containing static data
   * - A direct object containing static data
   *
   * The data will be merged with the log entry before any other data.
   * If using a function, it will be called for each log entry.
   * @example
   * ```typescript
   * // Using a function
   * staticData: () => ({
   *   hostname: hostname(),
   *   pid: process.pid
   * })
   *
   * // Using an object
   * staticData: {
   *   hostname: hostname(),
   *   pid: process.pid
   * }
   * ```
   */
  staticData?: (() => Record<string, any>) | Record<string, any>;
  /**
   * The frequency of rotation. Can be:
   * - 'daily' for daily rotation
   * - 'date' for rotation on date format change
   * - '[1-30]m' for rotation every X minutes
   * - '[1-12]h' for rotation every X hours
   */
  frequency?: string;
  /**
   * The date format to use in the filename.
   * Uses single characters for each date component:
   * - 'Y' for full year
   * - 'M' for month
   * - 'D' for day
   * - 'H' for hour
   * - 'm' for minutes
   * - 's' for seconds
   *
   * Common patterns:
   * - For daily rotation: use "YMD" (creates files like app-20240117.log)
   * - For hourly/minute rotation: use "YMDHm" (creates files like app-202401171430.log)
   *
   * @default "YMD"
   */
  dateFormat?: string;
  /**
   * The size at which to rotate.
   * Examples: "10M", "100K", "100B"
   * If frequency is specified, this will be ignored.
   */
  size?: string;
  /**
   * Maximum number of logs to keep.
   * Can be a number of files or days (e.g., "10d" for 10 days)
   */
  maxLogs?: string | number;
  /**
   * Location to store the log audit file.
   * If not set, it will be stored in the root of the application.
   */
  auditFile?: string;
  /**
   * File extension to be appended to the filename.
   * Useful when using size restrictions as the rotation adds a count at the end.
   */
  extension?: string;
  /**
   * Create a tailable symlink to the current active log file.
   * Default: false
   */
  createSymlink?: boolean;
  /**
   * Name to use when creating the symbolic link.
   * Default: 'current.log'
   */
  symlinkName?: string;
  /**
   * Use UTC time for date in filename.
   * Default: false
   */
  utc?: boolean;
  /**
   * Use specified hashing algorithm for audit.
   * Default: 'md5'
   * Use 'sha256' for FIPS compliance.
   */
  auditHashType?: "md5" | "sha256";
  /**
   * File mode to be used when creating log files.
   * Default: 0o640 (user read/write, group read, others none)
   */
  fileMode?: number;
  /**
   * Options passed to the file stream.
   * See: https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
   */
  fileOptions?: {
    flags?: string;
    encoding?: string;
    mode?: number;
  };
  /**
   * Event callbacks for various file stream events
   */
  callbacks?: LogFileRotationCallbacks;
  /**
   * Custom field names for the log entry JSON
   * Default: { level: "level", message: "message", data: "data", timestamp: "timestamp" }
   */
  fieldNames?: LogFileRotationFieldNames;
  /**
   * Delimiter between log entries.
   * Default: "\n"
   */
  delimiter?: string;
  /**
   * Custom function to generate timestamps for log entries.
   * Can return either a string (e.g., ISO string) or a number (e.g., Unix timestamp)
   * If not provided, defaults to new Date().toISOString()
   */
  timestampFn?: () => string | number;
  /**
   * Custom mapping for log levels.
   * Each log level can be mapped to either a string or number.
   * Example: { error: 50, warn: 40, info: 30, debug: 20, trace: 10, fatal: 60 }
   * Example: { error: "ERROR", warn: "WARN", info: "INFO", debug: "DEBUG", trace: "TRACE", fatal: "FATAL" }
   */
  levelMap?: LogFileRotationLevelMap;
  /**
   * Whether to compress rotated log files using gzip.
   * When enabled, rotated files will be compressed with .gz extension.
   * Default: false
   */
  compressOnRotate?: boolean;
  /**
   * Whether to enable verbose mode in the underlying file-stream-rotator.
   * When enabled, the rotator will log detailed information about its operations.
   * Default: false
   */
  verbose?: boolean;
  /**
   * Batch processing configuration.
   * If defined, batch processing will be enabled.
   * When batching is enabled, logs are queued in memory and written to disk in batches.
   * Queued logs are automatically flushed in the following situations:
   * - When the batch size is reached
   * - When the batch timeout is reached
   * - When the transport is disposed
   * - When the process exits (including SIGINT and SIGTERM signals)
   */
  batch?: LogFileRotationBatchConfig;
}

/**
 * A transport that writes logs to rotating files with support for time-based and size-based rotation.
 * Features include:
 * - Automatic log file rotation based on time (hourly, daily) or size
 * - Support for date patterns in filenames using numerical values (YYYY, MM, DD, etc.)
 * - Size-based rotation with support for KB, MB, and GB units
 * - Compression of rotated log files using gzip
 * - Maximum file count or age-based retention
 * - Automatic cleanup of old log files
 * - Batch processing of logs for improved performance
 * - Safe handling of process termination signals
 *
 * Each instance must have a unique filename to prevent race conditions.
 * If you need multiple loggers to write to the same file, share the same transport instance between them.
 */
export class LogFileRotationTransport extends LoggerlessTransport implements Disposable {
  /** Registry of active filenames to prevent multiple transports writing to the same file */
  private static activeFilenames = new Set<string>();
  /** The current write stream for the log file */
  private stream: WriteStream;
  /** Custom field names for log entries */
  private fieldNames: Required<LogFileRotationFieldNames>;
  /** Delimiter between log entries */
  private delimiter: string;
  /** Function to generate timestamps for log entries */
  private timestampFn: () => string | number;
  /** Custom mapping for log levels */
  private levelMap: LogFileRotationLevelMap;
  /** Whether to compress rotated files */
  private compressOnRotate: boolean;
  /** Whether a file is currently being compressed */
  private isCompressing: boolean;
  /** The base filename pattern for log files */
  private filename: string;
  /** Static data to be included in every log entry */
  private staticData?: (() => Record<string, any>) | Record<string, any>;
  /** Whether batch processing is enabled */
  private batchEnabled: boolean;
  /** Maximum number of log entries to queue before writing */
  private batchSize: number;
  /** Maximum time in milliseconds to wait before writing queued logs */
  private batchTimeout: number;
  /** Queue of log entries waiting to be written */
  private batchQueue: string[];
  /** Timer for batch flush timeout */
  private batchTimer: NodeJS.Timeout | null;
  /** Whether the transport is being disposed */
  private isDisposing: boolean;
  /** Event callbacks for various file stream events */
  private callbacks?: LogFileRotationCallbacks;
  /** Frequency of rotation (daily, hourly, etc.) */
  private frequency?: string;
  /** Whether to enable verbose mode */
  private verbose?: boolean;
  /** Date format for filename patterns */
  private dateFormat?: string;
  /** Size threshold for rotation */
  private size?: string;
  /** Maximum number of log files to keep */
  private maxLogs?: string | number;
  /** Path to the audit file */
  private auditFile?: string;
  /** File extension for log files */
  private extension?: string;
  /** Whether to create a symlink to current log */
  private createSymlink?: boolean;
  /** Name of the symlink file */
  private symlinkName?: string;
  /** Whether to use UTC time in filenames */
  private utc?: boolean;
  /** Hash algorithm for audit file */
  private auditHashType?: "md5" | "sha256";
  /** Options for file streams */
  private fileOptions?: {
    flags?: string;
    encoding?: string;
    mode?: number;
  };
  /** File mode to be used when creating log files */
  private fileMode?: number;

  /**
   * Generates the options for FileStreamRotator consistently across the transport
   * @returns FileStreamRotatorOptions object
   * @private
   */
  private getRotatorOptions(): FileStreamRotatorOptions {
    return {
      filename: this.filename,
      frequency: this.frequency,
      verbose: this.verbose ?? false,
      date_format: this.dateFormat,
      size: this.size,
      max_logs: this.maxLogs?.toString(),
      audit_file: this.auditFile || undefined,
      end_stream: true,
      extension: this.extension,
      create_symlink: this.createSymlink,
      symlink_name: this.symlinkName,
      utc: this.utc,
      audit_hash_type: this.auditHashType,
      file_options: {
        flags: "a",
        encoding: "utf8",
        mode: this.fileMode ?? 0o640,
        ...this.fileOptions,
      },
    };
  }

  /**
   * Creates a new LogFileRotationTransport instance.
   * @param params - Configuration options for the transport
   * @throws {Error} If the filename is already in use by another transport instance
   */
  constructor(params: LogFileRotationTransportConfig) {
    super(params);

    // Check if filename is already in use
    if (LogFileRotationTransport.activeFilenames.has(params.filename)) {
      throw new Error(
        `LogFileRotationTransport: Filename "${params.filename}" is already in use by another instance. To use the same file for multiple loggers, share the same transport instance between them.`,
      );
    }

    // Register the filename
    this.filename = params.filename;
    LogFileRotationTransport.activeFilenames.add(this.filename);

    // Set up field names with defaults
    this.fieldNames = {
      level: params.fieldNames?.level ?? "level",
      message: params.fieldNames?.message ?? "message",
      timestamp: params.fieldNames?.timestamp ?? "timestamp",
    };

    // Set up delimiter
    this.delimiter = params.delimiter ?? "\n";

    // Set up timestamp function
    this.timestampFn = params.timestampFn ?? (() => new Date().toISOString());

    // Set up level mapping
    this.levelMap = params.levelMap ?? {};

    // Set up compression
    this.compressOnRotate = params.compressOnRotate ?? false;
    this.isCompressing = false;

    // Set up batching
    this.batchEnabled = !!params.batch;
    this.batchSize = params.batch?.size ?? 1000;
    this.batchTimeout = params.batch?.timeout ?? 5000;
    this.batchQueue = [];
    this.batchTimer = null;
    this.isDisposing = false;

    // Store other options
    this.callbacks = params.callbacks;
    this.frequency = params.frequency;
    this.verbose = params.verbose;
    this.dateFormat = params.dateFormat;
    this.size = params.size;
    this.maxLogs = params.maxLogs;
    this.auditFile = params.auditFile;
    this.extension = params.extension;
    this.createSymlink = params.createSymlink;
    this.symlinkName = params.symlinkName;
    this.utc = params.utc;
    this.auditHashType = params.auditHashType;
    this.fileOptions = params.fileOptions;
    this.fileMode = params.fileMode;
    this.staticData = params.staticData;

    // Set up exit handler for flushing
    if (this.batchEnabled) {
      // Handle normal process exit
      process.on("beforeExit", () => {
        if (!this.isDisposing) {
          this.flush();
        }
      });

      // Handle SIGINT (Ctrl+C) and SIGTERM
      const handleSignal = (signal: string) => {
        if (!this.isDisposing) {
          // Synchronously flush logs to ensure they're written before exit
          this.flushSync();
          // Remove the filename from registry
          LogFileRotationTransport.activeFilenames.delete(this.filename);
          // Exit with the original signal
          process.exit(signal === "SIGINT" ? 130 : 143);
        }
      };

      process.on("SIGINT", () => handleSignal("SIGINT"));
      process.on("SIGTERM", () => handleSignal("SIGTERM"));
    }

    // Only create the stream if not in batch mode or if we have logs to write
    if (!this.batchEnabled) {
      this.initStream(this.getRotatorOptions());
    }
  }

  /**
   * Initializes the write stream and sets up event listeners.
   * This is called either immediately if batching is disabled,
   * or lazily when the first batch needs to be written if batching is enabled.
   * @param options - Options for the file stream rotator
   * @private
   */
  private initStream(options: FileStreamRotatorOptions): void {
    // FileStreamRotator.getStream() returns a WriteStream-compatible object
    this.stream = FileStreamRotator.getStream(options) as unknown as WriteStream;

    // Set up event listeners if callbacks are provided
    if (this.callbacks) {
      const { onRotate, onNew, onOpen, onClose, onError, onFinish, onLogRemoved } = this.callbacks;

      // Wrap the onRotate callback to handle compression
      if (this.compressOnRotate) {
        this.stream.on("rotate", async (oldFile: string, newFile: string) => {
          try {
            this.isCompressing = true;
            const compressedPath = await this.compressFile(oldFile);
            await unlink(oldFile);
            onRotate?.(compressedPath, newFile);
          } catch (error) {
            this.callbacks?.onError?.(error as Error);
          } finally {
            this.isCompressing = false;
          }
        });
      } else if (onRotate) {
        this.stream.on("rotate", onRotate);
      }

      if (onNew) {
        this.stream.on("new", onNew);
      }
      if (onOpen) {
        this.stream.on("open", onOpen);
      }
      if (onClose) {
        this.stream.on("close", onClose);
      }
      if (onError) {
        this.stream.on("error", onError);
      }
      if (onFinish) {
        this.stream.on("finish", onFinish);
      }
      if (onLogRemoved) {
        this.stream.on("logRemoved", onLogRemoved);
      }
    }
  }

  /**
   * Generates a unique path for a compressed log file.
   * If a file with .gz extension already exists, appends timestamp and counter.
   * @param filePath - The original log file path
   * @returns The unique path for the compressed file
   * @private
   */
  private async getUniqueCompressedFilePath(filePath: string): Promise<string> {
    let finalPath = `${filePath}.gz`;
    let counter = 0;

    try {
      while (true) {
        try {
          await access(finalPath);
          counter++;
          finalPath = `${filePath}.${Date.now()}.${counter}.gz`;
        } catch {
          break;
        }
      }
    } catch (_error) {
      finalPath = `${filePath}.${Date.now()}.gz`;
    }

    return finalPath;
  }

  /**
   * Compresses a log file using gzip.
   * @param filePath - Path to the file to compress
   * @returns Path to the compressed file
   * @private
   */
  private async compressFile(filePath: string): Promise<string> {
    const gzPath = await this.getUniqueCompressedFilePath(filePath);
    const gzip = createGzip();
    const source = createReadStream(filePath);
    const destination = createWriteStream(gzPath);

    await pipeline(source, gzip, destination);
    return gzPath;
  }

  /**
   * Flushes queued log entries to disk asynchronously.
   * This is used for normal batch processing operations.
   * @private
   */
  private flush(): void {
    if (!this.batchEnabled || this.batchQueue.length === 0) {
      return;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Initialize stream if it hasn't been created yet
    if (!this.stream) {
      this.initStream(this.getRotatorOptions());
    }

    const batchContent = this.batchQueue.join("");
    this.stream.write(batchContent);
    this.batchQueue = [];
  }

  /**
   * Synchronously flush logs to disk.
   * This is used during process termination (SIGINT/SIGTERM) to ensure logs are written
   * before the process exits. This method uses synchronous file I/O to guarantee that
   * logs are written even during abrupt process termination.
   * @private
   */
  private flushSync(): void {
    if (!this.batchEnabled || this.batchQueue.length === 0) {
      return;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Initialize stream if it hasn't been created yet
    if (!this.stream) {
      this.initStream(this.getRotatorOptions());
    }

    const batchContent = this.batchQueue.join("");
    // Use writeFileSync to ensure logs are written before process exit
    const rotator = this.stream as unknown as { currentFile: string };
    if (rotator.currentFile) {
      writeFileSync(rotator.currentFile, batchContent, { flag: "a" });
    }
    this.batchQueue = [];
  }

  /**
   * Schedules a batch flush operation.
   * This creates a timer that will flush the batch after the configured timeout.
   * The timer is unref'd to prevent keeping the process alive.
   * @private
   */
  private scheduleBatchFlush(): void {
    if (!this.batchTimer && !this.isDisposing) {
      this.batchTimer = setTimeout(() => {
        this.flush();
      }, this.batchTimeout);

      // Prevent timer from keeping the process alive
      if (this.batchTimer.unref) {
        this.batchTimer.unref();
      }
    }
  }

  /**
   * Processes and writes a log entry.
   * If batching is enabled, the entry is queued and written based on batch settings.
   * If batching is disabled, the entry is written immediately.
   * @param params - The log entry parameters
   * @returns The original messages array
   */
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const logEntry = {
      [this.fieldNames.level]: this.levelMap[logLevel as keyof LogFileRotationLevelMap] ?? logLevel,
      [this.fieldNames.message]: messages.join(" ") || "",
      [this.fieldNames.timestamp]: this.timestampFn(),
      ...(this.staticData ? (typeof this.staticData === "function" ? this.staticData() : this.staticData) : {}),
      ...(hasData ? data : {}),
    };

    const logString = `${JSON.stringify(logEntry)}${this.delimiter}`;

    if (this.batchEnabled) {
      this.batchQueue.push(logString);

      if (this.batchQueue.length >= this.batchSize) {
        this.flush();
      } else {
        this.scheduleBatchFlush();
      }
    } else {
      this.stream.write(logString);
    }

    return messages;
  }

  /**
   * Disposes of the transport, cleaning up resources and flushing any remaining logs.
   * This method:
   * 1. Prevents new batch flushes from being scheduled
   * 2. Cancels any pending batch flush
   * 3. Flushes any remaining logs
   * 4. Waits for any in-progress compression to complete
   * 5. Closes the write stream
   * 6. Removes the filename from the registry
   */
  [Symbol.dispose](): void {
    if (this.stream || this.batchEnabled) {
      this.isDisposing = true;

      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      // Flush any remaining logs
      if (this.batchEnabled) {
        this.flush();
      }

      const checkAndEnd = () => {
        if (!this.isCompressing) {
          if (this.stream) {
            this.stream.end();
          }
          // Remove the filename from registry when disposed
          LogFileRotationTransport.activeFilenames.delete(this.filename);
        } else {
          setTimeout(checkAndEnd, 100);
        }
      };
      checkAndEnd();
    }
  }
}
