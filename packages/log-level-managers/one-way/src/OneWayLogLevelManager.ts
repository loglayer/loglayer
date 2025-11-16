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
 * Parent changes affect children, but child changes do not affect parents.
 * Changes only apply to a parent and their children (not separate instances).
 */
export class OneWayLogLevelManager implements ILogLevelManager, Disposable {
  private logLevelContainer: { status: LogLevelEnabledStatus } = {
    status: {
      info: true,
      warn: true,
      error: true,
      debug: true,
      trace: true,
      fatal: true,
    },
  };
  private parentManager: WeakRef<OneWayLogLevelManager> | null = null;
  private childManagers: Set<WeakRef<OneWayLogLevelManager>> = new Set();
  private isDisposed = false;

  /**
   * Gets all alive child managers and removes dead references.
   * This prevents memory leaks by cleaning up references to garbage collected children.
   */
  private getAliveChildren(): OneWayLogLevelManager[] {
    const aliveChildren: OneWayLogLevelManager[] = [];
    const deadRefs: WeakRef<OneWayLogLevelManager>[] = [];

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
   * If this is a parent, the change applies to all its children.
   * If this is a child, the change only applies to this instance.
   */
  setLevel(logLevel: LogLevelType): void {
    if (this.isDisposed) return;

    const minLogValue = LogLevelPriority[logLevel];

    // Enable levels with value >= minLogValue, disable others
    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];

      this.logLevelContainer.status[levelKey] = levelValue >= minLogValue;
    }

    // If this is a parent, propagate changes to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      child.setLevel(logLevel);
    }
  }

  /**
   * Enables a specific log level.
   * If this is a parent, the change applies to all its children.
   * If this is a child, the change only applies to this instance.
   */
  enableIndividualLevel(logLevel: LogLevelType): void {
    if (this.isDisposed) return;

    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelContainer.status) {
      this.logLevelContainer.status[level] = true;
    }

    // If this is a parent, propagate changes to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      child.enableIndividualLevel(logLevel);
    }
  }

  /**
   * Disables a specific log level.
   * If this is a parent, the change applies to all its children.
   * If this is a child, the change only applies to this instance.
   */
  disableIndividualLevel(logLevel: LogLevelType): void {
    if (this.isDisposed) return;

    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelContainer.status) {
      this.logLevelContainer.status[level] = false;
    }

    // If this is a parent, propagate changes to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      child.disableIndividualLevel(logLevel);
    }
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
   * If this is a parent, the change applies to all its children.
   * If this is a child, the change only applies to this instance.
   */
  enableLogging(): void {
    if (this.isDisposed) return;

    for (const level of Object.keys(this.logLevelContainer.status)) {
      this.logLevelContainer.status[level as keyof LogLevelEnabledStatus] = true;
    }

    // If this is a parent, propagate changes to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      child.enableLogging();
    }
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   * If this is a parent, the change applies to all its children.
   * If this is a child, the change only applies to this instance.
   */
  disableLogging(): void {
    if (this.isDisposed) return;

    for (const level of Object.keys(this.logLevelContainer.status)) {
      this.logLevelContainer.status[level as keyof LogLevelEnabledStatus] = false;
    }

    // If this is a parent, propagate changes to all children
    const aliveChildren = this.getAliveChildren();
    for (const child of aliveChildren) {
      child.disableLogging();
    }
  }

  /**
   * Links the child log level manager to the parent.
   * The child gets its own container initialized from the parent's status.
   * Parent changes will propagate to children, but child changes won't affect the parent.
   */
  onChildLoggerCreated({ parentLogLevelManager, childLogLevelManager }: OnChildLogLevelManagerCreatedParams) {
    if (this.isDisposed) return;

    if (
      childLogLevelManager instanceof OneWayLogLevelManager &&
      parentLogLevelManager instanceof OneWayLogLevelManager
    ) {
      const child = childLogLevelManager as OneWayLogLevelManager;
      const parent = parentLogLevelManager as OneWayLogLevelManager;

      // Initialize child's container with parent's current status
      child.logLevelContainer.status = { ...parent.logLevelContainer.status };

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
      const clone = new OneWayLogLevelManager();
      return clone;
    }

    const clone = new OneWayLogLevelManager();
    // Clone gets its own container with the same initial status
    clone.logLevelContainer.status = { ...this.logLevelContainer.status };
    return clone;
  }

  /**
   * Implements the Disposable interface for cleanup.
   * Clears all parent and child references to prevent memory leaks.
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
