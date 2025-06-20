/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { LogLayerPlugin } from "@loglayer/plugin";
import type {
  ErrorOnlyOpts,
  ILogBuilder,
  ILogLayer,
  LogLayerTransport,
  LogLevel,
  MessageDataType,
} from "@loglayer/shared";
import { MockLogBuilder } from "./MockLogBuilder.js";

/**
 * A mock implementation of the ILogLayer interface that does nothing.
 * Useful for writing unit tests.
 */
export class MockLogLayer implements ILogLayer {
  private mockLogBuilder: ILogBuilder = new MockLogBuilder();

  info(..._messages: MessageDataType[]): void {}
  warn(..._messages: MessageDataType[]): void {}
  error(..._messages: MessageDataType[]): void {}
  debug(..._messages: MessageDataType[]): void {}
  trace(..._messages: MessageDataType[]): void {}
  fatal(..._messages: MessageDataType[]): void {}

  getLoggerInstance<_T extends LogLayerTransport>(_id: string) {
    return undefined;
  }

  errorOnly(_error: any, _opts?: ErrorOnlyOpts): void {}

  metadataOnly(_metadata?: Record<string, any>, _logLevel?: LogLevel): void {}

  addPlugins(_plugins: Array<LogLayerPlugin>) {}

  removePlugin(_id: string) {}

  enablePlugin(_id: string) {}

  disablePlugin(_id: string) {}

  withPrefix(_prefix: string): ILogLayer {
    return this;
  }

  withContext(_context?: Record<string, any>): ILogLayer {
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

  withFreshTransports(_transports: LogLayerTransport | Array<LogLayerTransport>) {
    return this;
  }

  withFreshPlugins(_plugins: Array<LogLayerPlugin>) {
    return this;
  }

  withContextManager(_contextManager: any) {
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

  enableIndividualLevel(_logLevel: LogLevel): ILogLayer {
    return this;
  }

  disableIndividualLevel(_logLevel: LogLevel): ILogLayer {
    return this;
  }

  setLevel(_logLevel: LogLevel): ILogLayer {
    return this;
  }

  isLevelEnabled(_logLevel: LogLevel): boolean {
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
