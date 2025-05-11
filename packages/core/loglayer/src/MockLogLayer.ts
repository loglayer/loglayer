/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type {
  ErrorOnlyOpts,
  ILogBuilder,
  ILogLayer,
  LogLayerTransport,
  LogLevel,
  MessageDataType,
} from "@loglayer/shared";
import { MockLogBuilder } from "./MockLogBuilder.js";

import type { LogLayerPlugin } from "@loglayer/plugin";

/**
 * A mock implementation of the ILogLayer interface that does nothing.
 * Useful for writing unit tests.
 */
export class MockLogLayer implements ILogLayer {
  private mockLogBuilder: ILogBuilder = new MockLogBuilder();

  info(...messages: MessageDataType[]): void {}
  warn(...messages: MessageDataType[]): void {}
  error(...messages: MessageDataType[]): void {}
  debug(...messages: MessageDataType[]): void {}
  trace(...messages: MessageDataType[]): void {}
  fatal(...messages: MessageDataType[]): void {}

  getLoggerInstance<T extends LogLayerTransport>(id: string) {
    return undefined;
  }

  errorOnly(error: any, opts?: ErrorOnlyOpts): void {}

  metadataOnly(metadata?: Record<string, any>, logLevel?: LogLevel): void {}

  addPlugins(plugins: Array<LogLayerPlugin>) {}

  removePlugin(id: string) {}

  enablePlugin(id: string) {}

  disablePlugin(id: string) {}

  withPrefix(prefix: string): ILogLayer {
    return this;
  }

  withContext(context?: Record<string, any>): ILogLayer {
    return this;
  }

  withError(error: any): ILogBuilder {
    this.mockLogBuilder.withError(error);

    return this.mockLogBuilder;
  }

  withMetadata(metadata?: Record<string, any>): ILogBuilder {
    this.mockLogBuilder.withMetadata(metadata);

    return this.mockLogBuilder;
  }

  getContext(): Record<string, any> {
    return {};
  }

  clearContext(): ILogLayer {
    return this as ILogLayer;
  }

  enableLogging() {
    return this;
  }

  disableLogging() {
    return this;
  }

  child() {
    return this;
  }

  muteContext() {
    return this;
  }

  unMuteContext() {
    return this;
  }

  muteMetadata() {
    return this;
  }

  unMuteMetadata() {
    return this;
  }

  withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>) {
    return this;
  }

  withFreshPlugins(plugins: Array<LogLayerPlugin>) {
    return this;
  }

  withContextManager(contextManager: any) {
    return this;
  }

  getContextManager() {
    return undefined;
  }

  /**
   * Sets the mock log builder to use for testing.
   */
  setMockLogBuilder(mockLogBuilder: ILogBuilder) {
    this.mockLogBuilder = mockLogBuilder;
  }

  enableIndividualLevel(logLevel: LogLevel): ILogLayer {
    return this;
  }

  disableIndividualLevel(logLevel: LogLevel): ILogLayer {
    return this;
  }

  setLogLevel(logLevel: LogLevel): ILogLayer {
    return this;
  }

  isLogLevelEnabled(logLevel: LogLevel): boolean {
    return true;
  }

  /**
   * Returns the mock log builder used for testing.
   */
  getMockLogBuilder() {
    return this.mockLogBuilder;
  }

  /**
   * Resets the mock log builder to a new instance of MockLogBuilder.
   */
  resetMockLogBuilder() {
    this.mockLogBuilder = new MockLogBuilder();
  }
}
