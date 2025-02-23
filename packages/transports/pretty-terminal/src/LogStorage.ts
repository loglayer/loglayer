/**
 * LogStorage handles the persistence of log entries using SQLite.
 * Uses an in-memory database for fast access and temporary storage.
 */

import { resolve } from "node:path";
import Database from "better-sqlite3";
import type { LogEntry } from "./types.js";

/**
 * Handles storage and retrieval of log entries using SQLite.
 * Uses an in-memory database for optimal performance and automatic cleanup.
 *
 * The database schema includes:
 * - id: Unique identifier for each log
 * - timestamp: Unix timestamp in milliseconds
 * - level: Log level (trace, debug, info, etc.)
 * - message: Main log message
 * - data: Optional structured data as JSON string
 */
export class LogStorage {
  /** SQLite database instance */
  private db: Database.Database;

  /**
   * Creates a new LogStorage instance.
   * Initializes a SQLite database and creates the logs table.
   *
   * @param logFile - Optional path to SQLite file for persistent storage.
   *                 If not provided, uses in-memory database.
   *                 Relative paths are resolved from the current working directory.
   */
  constructor(logFile?: string) {
    // Use specified log file or fallback to in-memory database
    const dbPath = logFile ? (logFile.startsWith("/") ? logFile : resolve(process.cwd(), logFile)) : ":memory:";
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  /**
   * Initializes the database schema.
   * Creates the logs table with appropriate columns and indexes.
   * If the table already exists, it will be dropped to ensure a clean state.
   * @private
   */
  private initializeDatabase(): void {
    this.db.exec(`
      DROP TABLE IF EXISTS logs;
      CREATE TABLE logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        level TEXT,
        message TEXT,
        data TEXT
      )
    `);
  }

  /**
   * Stores a new log entry in the database.
   * Uses prepared statements for efficient and safe insertion.
   *
   * @param entry - The log entry to store
   * @example
   * storage.store({
   *   id: "abc123",
   *   timestamp: Date.now(),
   *   level: "info",
   *   message: "User logged in",
   *   data: JSON.stringify({ userId: 123 })
   * });
   */
  public store(entry: LogEntry): void {
    this.db
      .prepare(`
        INSERT INTO logs (id, timestamp, level, message, data)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(entry.id, entry.timestamp, entry.level, entry.message, entry.data);
  }

  /**
   * Retrieves all logs from the database in chronological order.
   * Used when displaying the full log history or clearing filters.
   *
   * @returns Array of log entries sorted by timestamp
   */
  public getAllLogs(): LogEntry[] {
    return this.db.prepare("SELECT * FROM logs ORDER BY timestamp ASC").all() as LogEntry[];
  }

  /**
   * Searches logs based on a text query.
   * Performs a case-insensitive search across multiple fields:
   * - Log ID
   * - Message content
   * - Structured data
   *
   * @param searchText - Text to search for
   * @returns Array of matching log entries sorted by timestamp
   * @example
   * const errorLogs = storage.searchLogs("error");
   * const userLogs = storage.searchLogs("userId:123");
   */
  public searchLogs(searchText: string): LogEntry[] {
    const query = `
      SELECT * FROM logs 
      WHERE id LIKE ? 
      OR message LIKE ? 
      OR data LIKE ? 
      ORDER BY timestamp ASC
    `;
    const pattern = `%${searchText}%`;
    return this.db.prepare(query).all(pattern, pattern, pattern) as LogEntry[];
  }

  /**
   * Closes the database connection and performs cleanup.
   * Should be called when the application exits or the transport is destroyed.
   */
  public close(): void {
    this.db.close();
  }
}
