/**
 * LogStorage handles the persistence of log entries using SQLite.
 */

import type { LogEntry, SqliteDatabaseInstance } from "./types.js";

/**
 * Handles storage and retrieval of log entries using SQLite.
 *
 * The database schema includes:
 * - id: Unique identifier for each log
 * - timestamp: Unix timestamp in milliseconds
 * - level: Log level (trace, debug, info, etc.)
 * - message: Main log message
 * - data: Optional structured data as JSON string
 */
export class LogStorage {
  private db: SqliteDatabaseInstance;

  constructor(database: SqliteDatabaseInstance) {
    this.db = database;
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
   * Gets the total number of logs in the database.
   * Uses an efficient COUNT query instead of loading all logs.
   *
   * @returns Total number of log entries
   */
  public getLogCount(): number {
    const result = this.db.prepare("SELECT COUNT(*) as count FROM logs").get() as { count: number };
    return result.count;
  }

  /**
   * Gets the total number of logs matching a search query.
   * Uses an efficient COUNT query instead of loading all logs.
   *
   * @param searchText - Text to search for
   * @returns Number of matching log entries
   */
  public getFilteredLogCount(searchText: string): number {
    const query = `
      SELECT COUNT(*) as count FROM logs 
      WHERE id LIKE ? 
      OR message LIKE ? 
      OR data LIKE ?
    `;
    const pattern = `%${searchText}%`;
    const result = this.db.prepare(query).get(pattern, pattern, pattern) as { count: number };
    return result.count;
  }

  /**
   * Closes the database connection and performs cleanup.
   * Should be called when the application exits or the transport is destroyed.
   */
  public close(): void {
    this.db.close();
  }
}
