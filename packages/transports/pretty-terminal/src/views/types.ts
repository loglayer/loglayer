import type { DetailedViewConfig, LogEntry, ViewConfig } from "../types.js";

/**
 * Base interface for all view implementations
 */
export interface View {
  /**
   * Renders the view with the current state
   */
  render(): void;

  /**
   * Updates the terminal width when window is resized
   * @param width - New terminal width
   */
  updateTerminalWidth(width: number): void;
}

/**
 * Configuration for the simple view
 */
export interface SimpleViewConfig {
  /** Current view mode */
  viewMode: "truncated" | "condensed" | "full";
  /** Maximum depth for inline data */
  maxInlineDepth: number;
  /** Maximum length for inline data */
  maxInlineLength: number;
  /** View styling configuration */
  config: Required<ViewConfig>;
}

/**
 * Configuration for the detail view
 */
export interface DetailViewConfig {
  /** Current log entry */
  entry: LogEntry;
  /** Previous log entry for context */
  prevEntry: LogEntry | null;
  /** Next log entry for context */
  nextEntry: LogEntry | null;
  /** Current scroll position */
  scrollPos: number;
  /** Whether arrays are collapsed */
  isArraysCollapsed: boolean;
  /** Whether showing raw JSON */
  isJsonView: boolean;
  /** Current log index (1-based) */
  currentLogIndex: number;
  /** Total number of logs */
  totalLogs: number;
  /** Active filter text (if any) */
  filterText: string;
  /** View styling configuration */
  config: Required<DetailedViewConfig>;
}

/**
 * Configuration for the selection view
 */
export interface SelectionViewConfig {
  /** Array of log entries to display */
  logs: LogEntry[];
  /** Index of selected log */
  selectedIndex: number;
  /** Current filter text */
  filterText: string;
  /** Number of new logs available */
  newLogCount: number;
  /** View styling configuration */
  config: Required<ViewConfig>;
}
