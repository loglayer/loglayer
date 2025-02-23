/**
 * UIManager handles all user interaction and view state management.
 * This class is responsible for:
 * - Managing keyboard input and navigation
 * - Coordinating between views (simple, selection, detail)
 * - Handling filtering and search
 * - Managing the selection state
 * - Coordinating between storage and rendering
 *
 * The UI has three main modes:
 * 1. Simple View: Real-time log output (default)
 * 2. Selection View: Interactive log browsing with filtering
 * 3. Detail View: In-depth view of a single log entry
 *
 * Navigation Controls:
 * - TAB: Toggle selection mode
 * - Up/Down: Navigate logs in selection mode, scroll in detail mode
 * - Left/Right: Navigate between logs in detail mode
 * - Enter: View log details
 * - Type: Filter logs
 * - Backspace: Clear filter
 * - CTRL+C: Exit
 */

import chalk from "chalk";
// @ts-ignore
import keypress from "keypress";
import type { LogRenderer } from "./LogRenderer.js";
import type { LogStorage } from "./LogStorage.js";
import type { LogEntry } from "./types.js";

/**
 * Manages UI state and user interaction.
 * Acts as the controller between the storage and rendering layers.
 * Handles all keyboard input and view transitions.
 */
export class UIManager {
  /** Whether the UI is in log selection mode */
  private isSelectionMode = false;

  /** Whether the UI is showing detailed log view */
  private isDetailView = false;

  /** Whether log streaming is paused */
  private isPaused = false;

  /** Whether interactive mode is disabled */
  private isInteractiveDisabled: boolean;

  /** Buffer for logs received while paused */
  private pauseBuffer: LogEntry[] = [];

  /** Buffer for new logs in selection mode */
  private selectionBuffer: LogEntry[] = [];

  /** Index of currently selected log entry */
  private selectedIndex = 0;

  /** Current filter text for log searching */
  private filterText = "";

  /** Cached array of filtered log entries */
  private logs: LogEntry[] = [];

  /** Polling interval for checking new logs in detail view */
  private detailViewPollInterval: NodeJS.Timeout | null = null;

  /** Polling interval for checking new logs in selection view */
  private selectionViewPollInterval: NodeJS.Timeout | null = null;

  /** Current terminal width in characters */
  private termWidth: number = process.stdout.columns || 80;

  /**
   * Creates a new UIManager instance.
   * Sets up keyboard handling and cleanup handlers.
   *
   * @param renderer - Instance for handling log display
   * @param storage - Instance for log persistence
   * @param disableInteractiveMode - Whether to disable interactive mode
   */
  constructor(
    private renderer: LogRenderer,
    private storage: LogStorage,
    disableInteractiveMode = false,
  ) {
    this.isInteractiveDisabled = disableInteractiveMode;
    if (!this.isInteractiveDisabled) {
      this.setupKeyboardHandling();
    }
    // Update terminal width when window is resized
    process.stdout.on("resize", () => {
      this.termWidth = process.stdout.columns || 80;
      // Re-render the current view
      if (this.isDetailView) {
        const entry = this.logs[this.selectedIndex];
        const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
        const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
        this.renderer.renderDetailView(entry, prevEntry, nextEntry, this.renderer.getDetailViewScrollPos());
      } else if (this.isSelectionMode) {
        this.renderer.renderSelectionView(this.logs, this.selectedIndex, this.filterText, this.selectionBuffer.length);
      }
    });
  }

  /**
   * Sets up keyboard input handling and cleanup.
   * Configures raw mode for immediate key processing.
   * Sets up process exit handlers for cleanup.
   * @private
   */
  private setupKeyboardHandling(): void {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on("keypress", this.handleKeypress.bind(this));

    // Setup cleanup handlers for graceful exit
    const cleanup = () => {
      if (this.detailViewPollInterval) {
        clearInterval(this.detailViewPollInterval);
      }
      if (this.selectionViewPollInterval) {
        clearInterval(this.selectionViewPollInterval);
      }
      process.stdin.setRawMode(false);
      process.stdin.removeAllListeners("keypress");
      console.clear();
      this.storage.close();
      process.exit(0);
    };

    process.on("SIGINT", cleanup); // Handle Ctrl+C
    process.on("SIGTERM", cleanup); // Handle termination request
  }

  /**
   * Starts polling for new logs in selection view
   * @private
   */
  private startSelectionViewPolling(): void {
    // Clear any existing interval
    if (this.selectionViewPollInterval) {
      clearInterval(this.selectionViewPollInterval);
    }

    // Set up new polling interval
    this.selectionViewPollInterval = setInterval(() => {
      if (!this.isSelectionMode) {
        clearInterval(this.selectionViewPollInterval!);
        this.selectionViewPollInterval = null;
        return;
      }

      // Re-render with notification about buffered logs if any
      if (this.selectionBuffer.length > 0) {
        this.renderer.renderSelectionView(this.logs, this.selectedIndex, this.filterText, this.selectionBuffer.length);
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Starts polling for new logs in detail view
   * @private
   */
  private startDetailViewPolling(): void {
    // Clear any existing interval
    if (this.detailViewPollInterval) {
      clearInterval(this.detailViewPollInterval);
    }

    // Set up new polling interval
    this.detailViewPollInterval = setInterval(() => {
      if (!this.isDetailView) {
        clearInterval(this.detailViewPollInterval!);
        this.detailViewPollInterval = null;
        return;
      }

      // Check if total count has changed
      const totalCount = this.filterText
        ? this.storage.getFilteredLogCount(this.filterText)
        : this.storage.getLogCount();
      if (totalCount !== this.logs.length) {
        // Only load the logs we need for display
        const storedLogs = this.filterText ? this.storage.searchLogs(this.filterText) : this.storage.getAllLogs();
        this.logs = storedLogs;
        const entry = this.logs[this.selectedIndex];
        const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
        const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
        this.renderer.renderDetailView(
          entry,
          prevEntry,
          nextEntry,
          this.renderer.getDetailViewScrollPos(),
          this.selectedIndex + 1,
          totalCount,
          this.filterText,
        );
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Updates the filtered list of logs based on search text.
   * Handles both full list and filtered views.
   * Maintains selection state when filter changes.
   * @private
   */
  private updateFilteredLogs(): void {
    // Get the total count first to check if we need to update
    const totalCount = this.filterText ? this.storage.getFilteredLogCount(this.filterText) : this.storage.getLogCount();
    const effectiveCount = totalCount - this.selectionBuffer.length;

    // Only reload logs if the count has changed
    if (effectiveCount !== this.logs.length) {
      // Always get fresh logs from storage, but don't include buffered logs
      const storedLogs = this.filterText ? this.storage.searchLogs(this.filterText) : this.storage.getAllLogs();
      this.logs = storedLogs.slice(0, storedLogs.length - this.selectionBuffer.length);

      // Ensure selection remains valid after filter
      if (this.logs.length > 0) {
        this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, this.logs.length - 1));
      } else {
        this.selectedIndex = 0;
      }
    }
  }

  private updateNewLogsNotification(): void {
    if (!this.isSelectionMode || !this.selectionBuffer.length) return;

    // Move cursor up 2 lines (to the line above the help text), clear it, and write notification
    process.stdout.write(`\x1b[2A\r${" ".repeat(this.termWidth)}\r`);
    const notification = chalk.dim(
      `${this.selectionBuffer.length} new log${this.selectionBuffer.length === 1 ? "" : "s"} available (press ↓ to view)`,
    );
    process.stdout.write(`${notification}\n\n`);
  }

  /**
   * Handles new log entries from the transport.
   * Stores the log and updates the display if needed.
   *
   * @param entry - New log entry to process
   */
  public handleNewLog(entry: LogEntry): void {
    this.storage.store(entry);

    // If interactive mode is disabled, always render in simple mode
    if (this.isInteractiveDisabled) {
      this.renderer.renderLogLine(entry);
      return;
    }

    // Buffer logs in selection mode
    if (this.isSelectionMode) {
      this.selectionBuffer.push(entry);
      this.renderer.renderSelectionView(this.logs, this.selectedIndex, this.filterText, this.selectionBuffer.length);
      return;
    }

    // Only handle display in simple view mode (not in selection or detail view)
    if (!this.isDetailView) {
      if (this.isPaused) {
        // Add to pause buffer if paused
        this.pauseBuffer.push(entry);
        // Show pause indicator with buffer size
        process.stdout.write(`\r${chalk.yellow(`⏸  Paused (${this.pauseBuffer.length} new logs)`)}${" ".repeat(20)}`);
      } else {
        this.renderer.renderLogLine(entry);
      }
    }
  }

  /**
   * Processes keyboard input and manages UI state.
   * Handles navigation, mode switching, and filtering.
   *
   * Key mappings:
   * - CTRL+C: Exit application
   * - TAB: Toggle selection mode
   * - Up/Down: Navigate logs
   * - Enter: View log details
   * - Backspace: Edit filter
   * - P: Toggle pause in simple view
   * - Other keys: Add to filter
   *
   * @param ch - Character input if available
   * @param key - Key event information
   * @private
   */
  private handleKeypress(ch: string, key: any): void {
    // Handle application exit (CTRL+C)
    if (key?.ctrl && key?.name === "c") {
      process.stdin.setRawMode(false);
      process.stdin.removeAllListeners("keypress");
      console.clear();
      this.storage.close();
      process.exit(0);
      return;
    }

    // Handle pause toggle in simple view
    if (!this.isSelectionMode && !this.isDetailView && ch === "p") {
      this.isPaused = !this.isPaused;
      if (!this.isPaused && this.pauseBuffer.length > 0) {
        // Clear the pause indicator
        process.stdout.write(`\r${" ".repeat(50)}\r`);
        // Render buffered logs
        for (const entry of this.pauseBuffer) {
          this.renderer.renderLogLine(entry);
        }
        this.pauseBuffer = [];
      } else if (this.isPaused) {
        // Show initial pause indicator
        process.stdout.write(`\r${chalk.yellow("⏸  Paused (0 new logs)")}${" ".repeat(20)}`);
      }
      return;
    }

    // Handle condensed view toggle in simple view
    if (!this.isSelectionMode && !this.isDetailView && ch === "c") {
      // Cycle through view modes
      const newMode = this.renderer.cycleViewMode();
      // Clear screen and re-render all logs with new view mode
      console.clear();
      const logs = this.storage.getAllLogs();
      for (const entry of logs) {
        this.renderer.renderLogLine(entry);
      }
      // Show view mode indicator with appropriate description
      const modeDescriptions = {
        full: "Full view enabled (all data shown without truncation)",
        truncated: "Truncated view enabled (timestamp, ID, level, message, truncated data)",
        condensed: "Condensed view enabled (timestamp, level and message only)",
      };
      process.stdout.write(`\r${chalk.cyan(`ℹ  ${modeDescriptions[newMode]}`)}${" ".repeat(20)}`);
      setTimeout(() => {
        process.stdout.write(`\r${" ".repeat(100)}\r`);
      }, 3000);
      return;
    }

    // Enter selection mode from normal view
    if (!this.isSelectionMode && !this.isDetailView && key?.name === "tab") {
      this.isSelectionMode = true;
      this.filterText = "";

      // If we were paused, move paused logs to selection buffer
      if (this.isPaused) {
        this.selectionBuffer = [...this.pauseBuffer];
        this.pauseBuffer = [];
        // Get only the logs that were visible before pause
        const storedLogs = this.storage.getAllLogs();
        this.logs = storedLogs.slice(0, storedLogs.length - this.selectionBuffer.length);
      } else {
        this.updateFilteredLogs();
      }

      this.selectedIndex = Math.max(0, this.logs.length - 1); // Start at most recent log
      this.renderer.renderSelectionView(this.logs, this.selectedIndex, this.filterText, this.selectionBuffer.length);
      this.startSelectionViewPolling(); // Start polling when entering selection mode
      return;
    }

    // Handle selection mode navigation and filtering
    if (this.isSelectionMode) {
      if (key) {
        switch (key.name) {
          case "up": {
            // Move selection up
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.renderer.renderSelectionView(
              this.logs,
              this.selectedIndex,
              this.filterText,
              this.selectionBuffer.length,
            );
            return;
          }
          case "down": {
            // Move selection down
            if (this.selectedIndex === this.logs.length - 1 && this.selectionBuffer.length > 0) {
              // Append buffered logs when user reaches the bottom
              this.logs.push(...this.selectionBuffer);
              this.selectionBuffer = [];
            }
            this.selectedIndex = Math.min(this.logs.length - 1, this.selectedIndex + 1);
            this.renderer.renderSelectionView(
              this.logs,
              this.selectedIndex,
              this.filterText,
              this.selectionBuffer.length,
            );
            return;
          }
          case "return": {
            // Enter detail view for selected log
            if (this.logs.length > 0) {
              this.isSelectionMode = false;
              this.isDetailView = true;
              console.clear(); // Clear console before entering detail view
              const selectedEntry = this.logs[this.selectedIndex];
              const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
              const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
              this.renderer.renderDetailView(
                selectedEntry,
                prevEntry,
                nextEntry,
                0,
                this.selectedIndex + 1,
                this.logs.length,
                this.filterText,
              );
              this.startDetailViewPolling(); // Start polling when entering detail view
            }
            return;
          }
          case "backspace": {
            // Remove last character from filter
            if (this.filterText.length > 0) {
              this.filterText = this.filterText.slice(0, -1);
              this.updateFilteredLogs();
              this.renderer.renderSelectionView(
                this.logs,
                this.selectedIndex,
                this.filterText,
                this.selectionBuffer.length,
              );
            }
            return;
          }
          case "tab": {
            // Exit selection mode back to simple view
            this.isSelectionMode = false;
            if (this.selectionViewPollInterval) {
              clearInterval(this.selectionViewPollInterval);
              this.selectionViewPollInterval = null;
            }
            this.filterText = "";
            console.clear();
            // Re-render all logs in reverse chronological order
            const logs = this.storage.getAllLogs();
            for (const entry of logs) {
              this.renderer.renderLogLine(entry);
            }
            return;
          }
        }
      }

      // Handle text input for filtering
      if (ch && (!key || (!key.ctrl && !key.meta)) && ch.length === 1) {
        this.filterText += ch;
        this.updateFilteredLogs();
        this.renderer.renderSelectionView(this.logs, this.selectedIndex, this.filterText, this.selectionBuffer.length);
        return;
      }
    }

    // Handle detail view navigation
    if (this.isDetailView) {
      // Handle named keys
      if (key?.name) {
        switch (key.name) {
          case "up": {
            // Scroll up one line
            this.renderer.scrollDetailView(-1);
            const entry = this.logs[this.selectedIndex];
            const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
            const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
            this.renderer.renderDetailView(
              entry,
              prevEntry,
              nextEntry,
              this.renderer.getDetailViewScrollPos(),
              this.selectedIndex + 1,
              this.logs.length,
              this.filterText,
            );
            break;
          }
          case "down": {
            // Scroll down one line
            this.renderer.scrollDetailView(1);
            const entry = this.logs[this.selectedIndex];
            const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
            const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
            this.renderer.renderDetailView(
              entry,
              prevEntry,
              nextEntry,
              this.renderer.getDetailViewScrollPos(),
              this.selectedIndex + 1,
              this.logs.length,
              this.filterText,
            );
            break;
          }
          case "left": {
            // Show previous log in detail view
            if (this.selectedIndex > 0) {
              this.selectedIndex = Math.max(0, this.selectedIndex - 1);
              const entry = this.logs[this.selectedIndex];
              const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
              const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
              this.renderer.renderDetailView(
                entry,
                prevEntry,
                nextEntry,
                0,
                this.selectedIndex + 1,
                this.logs.length,
                this.filterText,
              );
            }
            break;
          }
          case "right": {
            // Show next log in detail view
            if (this.selectedIndex < this.logs.length - 1) {
              this.selectedIndex = Math.min(this.logs.length - 1, this.selectedIndex + 1);
              const entry = this.logs[this.selectedIndex];
              const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
              const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
              this.renderer.renderDetailView(
                entry,
                prevEntry,
                nextEntry,
                0,
                this.selectedIndex + 1,
                this.logs.length,
                this.filterText,
              );
            }
            break;
          }
          case "tab": {
            // If in JSON view, return to detail view
            if (this.renderer.isInJsonView()) {
              this.renderer.toggleJsonView();
              const entry = this.logs[this.selectedIndex];
              const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
              const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
              this.renderer.renderDetailView(
                entry,
                prevEntry,
                nextEntry,
                this.renderer.getDetailViewScrollPos(),
                this.selectedIndex + 1,
                this.logs.length,
                this.filterText,
              );
              break;
            }

            // Otherwise return to selection view
            this.isDetailView = false;
            if (this.detailViewPollInterval) {
              clearInterval(this.detailViewPollInterval);
              this.detailViewPollInterval = null;
            }
            this.isSelectionMode = true;
            this.updateFilteredLogs(); // Refresh logs when returning to selection view
            this.renderer.renderSelectionView(
              this.logs,
              this.selectedIndex,
              this.filterText,
              this.selectionBuffer.length,
            );
            break;
          }
        }
      }

      // Handle character inputs (Q/W for page scrolling, A/S for first/last, C for array toggle)
      if (ch) {
        switch (ch.toLowerCase()) {
          case "w": {
            // Scroll down one page
            this.renderer.scrollDetailView(process.stdout.rows - 8); // Account for header/footer space
            const entry = this.logs[this.selectedIndex];
            const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
            const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
            this.renderer.renderDetailView(
              entry,
              prevEntry,
              nextEntry,
              this.renderer.getDetailViewScrollPos(),
              this.selectedIndex + 1,
              this.logs.length,
            );
            break;
          }
          case "q": {
            // Scroll up one page
            this.renderer.scrollDetailView(-process.stdout.rows + 8); // Account for header/footer space
            const entry = this.logs[this.selectedIndex];
            const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
            const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
            this.renderer.renderDetailView(
              entry,
              prevEntry,
              nextEntry,
              this.renderer.getDetailViewScrollPos(),
              this.selectedIndex + 1,
              this.logs.length,
            );
            break;
          }
          case "a": {
            // Jump to first log
            if (this.selectedIndex !== 0) {
              this.selectedIndex = 0;
              const entry = this.logs[this.selectedIndex];
              const prevEntry = null; // No previous entry when at first log
              const nextEntry = this.logs.length > 1 ? this.logs[1] : null;
              this.renderer.renderDetailView(entry, prevEntry, nextEntry, 0, 1, this.logs.length);
            }
            break;
          }
          case "s": {
            // Jump to last log
            const lastIndex = this.logs.length - 1;
            if (this.selectedIndex !== lastIndex) {
              this.selectedIndex = lastIndex;
              const entry = this.logs[this.selectedIndex];
              const prevEntry = lastIndex > 0 ? this.logs[lastIndex - 1] : null;
              const nextEntry = null; // No next entry when at last log
              this.renderer.renderDetailView(entry, prevEntry, nextEntry, 0, this.logs.length, this.logs.length);
            }
            break;
          }
          case "c": {
            // Toggle array collapse
            this.renderer.toggleArrayCollapse();
            const entry = this.logs[this.selectedIndex];
            const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
            const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
            this.renderer.renderDetailView(
              entry,
              prevEntry,
              nextEntry,
              this.renderer.getDetailViewScrollPos(),
              this.selectedIndex + 1,
              this.logs.length,
            );
            break;
          }
          case "j": {
            // Toggle JSON view
            this.renderer.toggleJsonView();
            const entry = this.logs[this.selectedIndex];
            const prevEntry = this.selectedIndex > 0 ? this.logs[this.selectedIndex - 1] : null;
            const nextEntry = this.selectedIndex < this.logs.length - 1 ? this.logs[this.selectedIndex + 1] : null;
            this.renderer.renderDetailView(entry, prevEntry, nextEntry, 0, this.selectedIndex + 1, this.logs.length);
            break;
          }
        }
      }
    }
  }
}
