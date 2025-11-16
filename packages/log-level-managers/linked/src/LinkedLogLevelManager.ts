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

/**
 * A log level manager that keeps log levels synchronized between parent and children.
 * Parent and child changes affect each other bidirectionally.
 * Changes only apply to a parent and their children (not separate instances).
 */
export class LinkedLogLevelManager implements ILogLevelManager, Disposable {
  private logLevelContainer: { status: LogLevelEnabledStatus };
  private parentManager: WeakRef<LinkedLogLevelManager> | null = null;
  private childManagers: Set<WeakRef<LinkedLogLevelManager>> = new Set();
  private isPropagating = false;
  private isDisposed = false;

  constructor(sharedContainer?: { status: LogLevelEnabledStatus }) {
    if (sharedContainer) {
      // Use the shared container (for linked managers in the same hierarchy)
      this.logLevelContainer = sharedContainer;
    } else {
      // Create a new container (for the root of a hierarchy)
      this.logLevelContainer = {
        status: {
          info: true,
          warn: true,
          error: true,
          debug: true,
          trace: true,
          fatal: true,
        },
      };
    }
  }

  /**
   * Gets the parent manager if it's still alive.
   * Returns null if the parent has been garbage collected.
   */
  private getParent(): LinkedLogLevelManager | null {
    if (!this.parentManager) {
      return null;
    }
    return this.parentManager.deref() ?? null;
  }

  /**
   * Gets all alive child managers and removes dead references.
   * This prevents memory leaks by cleaning up references to garbage collected children.
   */
  private getAliveChildren(): LinkedLogLevelManager[] {
    const aliveChildren: LinkedLogLevelManager[] = [];
    const deadRefs: WeakRef<LinkedLogLevelManager>[] = [];

    for (const childRef of this.childManagers) {
      const child = childRef.deref();
      if (child) {
        aliveChildren.push(child);
      } else {
        deadRefs.push(childRef);
      }
    }

    // Clean up dead references
    for (const deadRef of deadRefs) {
      this.childManagers.delete(deadRef);
    }

    return aliveChildren;
  }

  /**
   * Sets the minimum log level to be used by the logger. Only messages with
   * this level or higher severity will be logged.
   * Changes propagate to all linked managers in the hierarchy (parent and children).
   */
  setLevel(logLevel: LogLevelType): void {
    if (this.isDisposed) return;

    // Prevent infinite loops during propagation
    if (this.isPropagating) {
      return;
    }

    this.isPropagating = true;

    const minLogValue = LogLevelPriority[logLevel];

    // Enable levels with value >= minLogValue, disable others
    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];

      this.logLevelContainer.status[levelKey] = levelValue >= minLogValue;
    }

    // Propagate to parent if exists
    const parent = this.getParent();
    if (parent && !parent.isPropagating) {
      parent.setLevel(logLevel);
    }

    // Propagate to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      if (!child.isPropagating) {
        child.setLevel(logLevel);
      }
    }

    this.isPropagating = false;
  }

  /**
   * Enables a specific log level.
   * Changes propagate to all linked managers in the hierarchy (parent and children).
   */
  enableIndividualLevel(logLevel: LogLevelType): void {
    if (this.isDisposed) return;

    // Prevent infinite loops during propagation
    if (this.isPropagating) {
      return;
    }

    this.isPropagating = true;

    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelContainer.status) {
      this.logLevelContainer.status[level] = true;
    }

    // Propagate to parent if exists
    const parent = this.getParent();
    if (parent && !parent.isPropagating) {
      parent.enableIndividualLevel(logLevel);
    }

    // Propagate to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      if (!child.isPropagating) {
        child.enableIndividualLevel(logLevel);
      }
    }

    this.isPropagating = false;
  }

  /**
   * Disables a specific log level.
   * Changes propagate to all linked managers in the hierarchy (parent and children).
   */
  disableIndividualLevel(logLevel: LogLevelType): void {
    if (this.isDisposed) return;

    // Prevent infinite loops during propagation
    if (this.isPropagating) {
      return;
    }

    this.isPropagating = true;

    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelContainer.status) {
      this.logLevelContainer.status[level] = false;
    }

    // Propagate to parent if exists
    const parent = this.getParent();
    if (parent && !parent.isPropagating) {
      parent.disableIndividualLevel(logLevel);
    }

    // Propagate to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      if (!child.isPropagating) {
        child.disableIndividualLevel(logLevel);
      }
    }

    this.isPropagating = false;
  }

  /**
   * Checks if a specific log level is enabled
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    if (this.isDisposed) return false;

    const level = logLevel as keyof LogLevelEnabledStatus;
    return this.logLevelContainer.status[level];
  }

  /**
   * Enable sending logs to the logging library.
   * Changes propagate to all linked managers in the hierarchy (parent and children).
   */
  enableLogging(): void {
    if (this.isDisposed) return;

    // Prevent infinite loops during propagation
    if (this.isPropagating) {
      return;
    }

    this.isPropagating = true;

    for (const level of Object.keys(this.logLevelContainer.status)) {
      this.logLevelContainer.status[level as keyof LogLevelEnabledStatus] = true;
    }

    // Propagate to parent if exists
    const parent = this.getParent();
    if (parent && !parent.isPropagating) {
      parent.enableLogging();
    }

    // Propagate to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      if (!child.isPropagating) {
        child.enableLogging();
      }
    }

    this.isPropagating = false;
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   * Changes propagate to all linked managers in the hierarchy (parent and children).
   */
  disableLogging(): void {
    if (this.isDisposed) return;

    // Prevent infinite loops during propagation
    if (this.isPropagating) {
      return;
    }

    this.isPropagating = true;

    for (const level of Object.keys(this.logLevelContainer.status)) {
      this.logLevelContainer.status[level as keyof LogLevelEnabledStatus] = false;
    }

    // Propagate to parent if exists
    const parent = this.getParent();
    if (parent && !parent.isPropagating) {
      parent.disableLogging();
    }

    // Propagate to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      if (!child.isPropagating) {
        child.disableLogging();
      }
    }

    this.isPropagating = false;
  }

  /**
   * Links the child log level manager to the parent.
   * The child shares the same container as the parent, ensuring bidirectional synchronization.
   * Parent and child changes will affect each other.
   */
  onChildLoggerCreated({ parentLogLevelManager, childLogLevelManager }: OnChildLogLevelManagerCreatedParams) {
    if (this.isDisposed) return;

    if (
      childLogLevelManager instanceof LinkedLogLevelManager &&
      parentLogLevelManager instanceof LinkedLogLevelManager
    ) {
      const child = childLogLevelManager as LinkedLogLevelManager;
      const parent = parentLogLevelManager as LinkedLogLevelManager;

      // Child shares the same container as parent for bidirectional synchronization
      child.logLevelContainer = parent.logLevelContainer;

      // Set up parent-child relationship using WeakRef to prevent memory leaks
      child.parentManager = new WeakRef(parent);
      parent.childManagers.add(new WeakRef(child));
    }
  }

  /**
   * Creates a new instance of the log level manager with its own container.
   * The clone is independent and not linked to the original.
   */
  clone(): ILogLevelManager {
    if (this.isDisposed) {
      const clone = new LinkedLogLevelManager();
      return clone;
    }

    const clone = new LinkedLogLevelManager();
    // Clone gets its own container with the same initial status
    clone.logLevelContainer.status = { ...this.logLevelContainer.status };
    return clone;
  }

  /**
   * Implements the Disposable interface for cleanup.
   * Clears all parent and child references to prevent memory leaks.
   * Note: The shared container is not cleared as other managers in the hierarchy may still be using it.
   */
  [Symbol.dispose](): void {
    if (this.isDisposed) return;

    // Clear parent reference
    this.parentManager = null;

    // Clear all child references
    this.childManagers.clear();

    // Mark as disposed
    this.isDisposed = true;
  }
}
