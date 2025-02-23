/**
 * LogRenderer handles all terminal output formatting and rendering.
 * Provides multiple view modes with different levels of detail:
 * - Simple view for real-time log output
 * - Compact view for context in detailed view
 * - Detailed view for inspecting individual logs
 * - Selection view for browsing and filtering logs
 *
 * Features:
 * - Color-coded log levels
 * - Structured data formatting
 * - Terminal width awareness
 * - Pretty-printed JSON
 * - Truncation of long content
 */

import type { DetailedViewConfig, LogEntry, ViewConfig } from "./types.js";
import { DetailView, SelectionView, SimpleView } from "./views/index.js";

/**
 * LogRenderer coordinates between different view modes and manages the overall rendering state.
 * Delegates actual rendering to specialized view implementations:
 * - SimpleView: For real-time log output
 * - SelectionView: For interactive log browsing
 * - DetailView: For in-depth log inspection
 */
export class LogRenderer {
  /** Current terminal width in characters */
  private termWidth: number;

  /** Maximum depth for displaying nested objects inline */
  private maxInlineDepth: number;

  /** Maximum length for inline data before truncating */
  private maxInlineLength: number;

  /** Whether arrays are currently collapsed in detail view */
  private isArraysCollapsed = true;

  /** Current view mode in simple mode */
  private viewMode: "truncated" | "condensed" | "full" = "full";

  /** Color and formatting config for simple log view */
  private simpleViewConfig: Required<ViewConfig>;

  /** Color and formatting config for detailed view */
  private detailedViewConfig: Required<DetailedViewConfig>;

  /** Whether we're showing raw JSON view */
  private isJsonView = false;

  /** Current scroll position in detailed view */
  private detailViewScrollPos = 0;

  /** View instances */
  private simpleView: SimpleView;
  private detailView: DetailView | null = null;
  private selectionView: SelectionView | null = null;

  /**
   * Creates a new LogRenderer instance.
   *
   * @param simpleViewConfig - Configuration for simple log view
   * @param detailedViewConfig - Configuration for detailed view
   * @param maxInlineDepth - Maximum depth for inline object display
   * @param maxInlineLength - Maximum length before truncation
   */
  constructor(
    simpleViewConfig: Required<ViewConfig>,
    detailedViewConfig: Required<DetailedViewConfig>,
    maxInlineDepth: number,
    maxInlineLength: number,
  ) {
    this.simpleViewConfig = simpleViewConfig;
    this.detailedViewConfig = detailedViewConfig;
    this.maxInlineDepth = maxInlineDepth;
    this.maxInlineLength = maxInlineLength;
    this.termWidth = process.stdout.columns || 80;

    // Initialize views with their configurations
    this.simpleView = new SimpleView({
      viewMode: this.viewMode,
      maxInlineDepth: this.maxInlineDepth,
      maxInlineLength: this.maxInlineLength,
      config: this.simpleViewConfig,
    });

    // Detail view will be initialized when needed with actual log entry
    this.detailView = null as any; // Will be set when entering detail view

    // Selection view will be initialized when needed with actual logs
    this.selectionView = null as any; // Will be set when entering selection view

    // Update terminal width when window is resized
    process.stdout.on("resize", () => {
      this.termWidth = process.stdout.columns || 80;
      this.simpleView.updateTerminalWidth(this.termWidth);
      if (this.detailView) {
        this.detailView.updateTerminalWidth(this.termWidth);
      }
      if (this.selectionView) {
        this.selectionView.updateTerminalWidth(this.termWidth);
      }
    });
  }

  /**
   * Renders a single log line in simple view format.
   * Format: [timestamp] LEVEL [id] message data
   * Condensed Format: [timestamp] LEVEL message
   * Expanded Format: [timestamp] LEVEL [id] message full_data
   *
   * @param entry - Log entry to render
   */
  public renderLogLine(entry: LogEntry): void {
    this.simpleView.renderLogLine(entry);
  }

  /**
   * Renders the detailed view of a log entry.
   * Shows full entry details with context and formatted data.
   *
   * @param entry - Log entry to show in detail
   * @param prevEntry - Previous entry for context
   * @param nextEntry - Next entry for context
   * @param scrollPos - Current scroll position
   * @param currentLogIndex - Current log index (optional)
   * @param totalLogs - Total logs count (optional)
   * @param filterText - Current filter text (if any)
   */
  public renderDetailView(
    entry: LogEntry,
    prevEntry: LogEntry | null,
    nextEntry: LogEntry | null,
    scrollPos = 0,
    currentLogIndex?: number,
    totalLogs?: number,
    filterText = "",
  ): void {
    // Create or update detail view configuration
    const config = {
      entry,
      prevEntry,
      nextEntry,
      scrollPos,
      isArraysCollapsed: this.isArraysCollapsed,
      isJsonView: this.isJsonView,
      currentLogIndex: currentLogIndex ?? (prevEntry ? 2 : nextEntry ? 1 : 1), // Use provided index or fallback
      totalLogs: totalLogs ?? 1, // Use provided total or fallback
      filterText,
      config: this.detailedViewConfig,
    };

    // Create new detail view instance or update existing one
    if (!this.detailView) {
      this.detailView = new DetailView(config);
    } else {
      this.detailView = new DetailView(config);
    }

    this.detailView.render();
  }

  /**
   * Updates the scroll position in detailed view
   * @param delta - Number of lines to scroll
   */
  public scrollDetailView(delta: number): void {
    if (!this.detailView) return;

    const maxScroll = this.detailView.getMaxScrollPosition();
    this.detailViewScrollPos = Math.max(0, Math.min(maxScroll, this.detailViewScrollPos + delta));
  }

  /**
   * Gets the current scroll position
   */
  public getDetailViewScrollPos(): number {
    return this.detailViewScrollPos;
  }

  /**
   * Renders the selection view with a list of logs.
   * Shows filtered logs with selection highlight and data preview.
   *
   * @param logs - Array of logs to display
   * @param selectedIndex - Index of currently selected log
   * @param filterText - Current filter text (if any)
   * @param newLogCount - Number of new logs available
   */
  public renderSelectionView(logs: LogEntry[], selectedIndex: number, filterText: string, newLogCount: number): void {
    // Create or update selection view configuration
    const config = {
      logs,
      selectedIndex,
      filterText,
      newLogCount,
      config: this.detailedViewConfig,
    };

    // Create new selection view instance or update existing one
    if (!this.selectionView) {
      this.selectionView = new SelectionView(config);
    } else {
      this.selectionView = new SelectionView(config);
    }

    this.selectionView.render();
  }

  /**
   * Toggles JSON view state
   */
  public toggleJsonView(): void {
    this.isJsonView = !this.isJsonView;
  }

  /**
   * Gets current JSON view state
   */
  public isInJsonView(): boolean {
    return this.isJsonView;
  }

  /**
   * Toggles array collapse state in detail view
   */
  public toggleArrayCollapse(): void {
    this.isArraysCollapsed = !this.isArraysCollapsed;
  }

  /**
   * Cycles through view modes: full -> truncated -> condensed
   */
  public cycleViewMode(): string {
    switch (this.viewMode) {
      case "full":
        this.viewMode = "truncated";
        break;
      case "truncated":
        this.viewMode = "condensed";
        break;
      case "condensed":
        this.viewMode = "full";
        break;
    }

    // Update simple view configuration
    this.simpleView = new SimpleView({
      viewMode: this.viewMode,
      maxInlineDepth: this.maxInlineDepth,
      maxInlineLength: this.maxInlineLength,
      config: this.simpleViewConfig,
    });

    return this.viewMode;
  }

  /**
   * Gets current view mode
   */
  public getViewMode(): string {
    return this.viewMode;
  }
}
