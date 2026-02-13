/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import { MockContextManager } from "@loglayer/context-manager";
import { MockLogLevelManager } from "@loglayer/log-level-manager";
import type { LogLayerPlugin } from "@loglayer/plugin";
import type {
  ContainsAsyncLazy,
  ErrorOnlyOpts,
  IContextManager,
  ILogBuilder,
  ILogLayer,
  ILogLevelManager,
  LogLayerMetadata,
  LogLayerTransport,
  LogLevel,
  LogLevelType,
  MessageDataType,
  RawLogEntry,
} from "@loglayer/shared";
import { MockLogBuilder } from "./MockLogBuilder.js";

/**
 * A mock implementation of the ILogLayer interface that does nothing.
 * Useful for writing unit tests.
 * MockLogLayer implements both ILogLayer and ILogBuilder for simplicity in testing.
 */
export class MockLogLayer implements ILogLayer<MockLogLayer> {
  private mockLogBuilder: ILogBuilder = new MockLogBuilder();
  private mockContextManager: IContextManager = new MockContextManager();
  private mockLogLevelManager: ILogLevelManager = new MockLogLevelManager();

  info(..._messages: MessageDataType[]): void {}
  warn(..._messages: MessageDataType[]): void {}
  error(..._messages: MessageDataType[]): void {}
  debug(..._messages: MessageDataType[]): void {}
  trace(..._messages: MessageDataType[]): void {}
  fatal(..._messages: MessageDataType[]): void {}
  raw(_rawEntry: RawLogEntry): any {}

  getLoggerInstance<_T extends LogLayerTransport>(_id: string) {
    return undefined;
  }

  errorOnly(_error: any, _opts?: ErrorOnlyOpts): void {}

  metadataOnly(_metadata?: Record<string, any>, _logLevel?: LogLevel): any {}

  addPlugins(_plugins: Array<LogLayerPlugin>) {}

  removePlugin(_id: string) {}

  enablePlugin(_id: string) {}

  disablePlugin(_id: string) {}

  withPrefix(_prefix: string) {
    return this;
  }

  withContext(_context?: Record<string, any>) {
    return this;
  }

  withError(_error: any): ILogBuilder<any, false> {
    return this.mockLogBuilder.withError(_error) as ILogBuilder<any, false>;
  }

  withMetadata<M extends LogLayerMetadata>(_metadata?: M): ILogBuilder<any, ContainsAsyncLazy<NonNullable<M>>> {
    return this.mockLogBuilder.withMetadata(_metadata) as unknown as ILogBuilder<
      any,
      ContainsAsyncLazy<NonNullable<M>>
    >;
  }

  getContext(_options?: { raw?: boolean }): Record<string, any> {
    return {};
  }

  clearContext(_keys?: string | string[]) {
    return this;
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

  addTransport(_transports: LogLayerTransport | Array<LogLayerTransport>) {
    return this;
  }

  removeTransport(_id: string): boolean {
    return true;
  }

  withFreshPlugins(_plugins: Array<LogLayerPlugin>) {
    return this;
  }

  withContextManager(_contextManager: any) {
    return this;
  }

  getContextManager<M extends IContextManager = IContextManager>(): M {
    return this.mockContextManager as M;
  }

  withLogLevelManager(_logLevelManager: ILogLevelManager) {
    return this;
  }

  getLogLevelManager<M extends ILogLevelManager = ILogLevelManager>(): M {
    return this.mockLogLevelManager as M;
  }

  getConfig() {
    return {} as any;
  }

  /**
   * Sets the mock log builder to use for testing.
   */
  setMockLogBuilder(mockLogBuilder: ILogBuilder) {
    this.mockLogBuilder = mockLogBuilder;
  }

  enableIndividualLevel(_logLevel: LogLevelType) {
    return this;
  }

  disableIndividualLevel(_logLevel: LogLevelType) {
    return this;
  }

  setLevel(_logLevel: LogLevelType) {
    return this;
  }

  isLevelEnabled(_logLevel: LogLevelType): boolean {
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
