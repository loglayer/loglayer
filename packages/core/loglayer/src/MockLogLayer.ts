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
  LogGroupConfig,
  LogGroupsConfig,
  LogLayerMetadata,
  LogLayerTransport,
  LogLevel,
  LogLevelType,
  RawLogEntry,
  TaggedTemplateOrMessageArgs,
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

  // Accepts both regular calls and tagged templates
  info(..._args: TaggedTemplateOrMessageArgs): void {}
  warn(..._args: TaggedTemplateOrMessageArgs): void {}
  error(..._args: TaggedTemplateOrMessageArgs): void {}
  debug(..._args: TaggedTemplateOrMessageArgs): void {}
  trace(..._args: TaggedTemplateOrMessageArgs): void {}
  fatal(..._args: TaggedTemplateOrMessageArgs): void {}
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

  withGroup(_group: string | string[]) {
    return this;
  }

  addGroup(_name: string, _config: LogGroupConfig) {
    return this;
  }

  removeGroup(_name: string) {
    return this;
  }

  enableGroup(_name: string) {
    return this;
  }

  disableGroup(_name: string) {
    return this;
  }

  setGroupLevel(_name: string, _level: LogLevelType) {
    return this;
  }

  setActiveGroups(_groups: string[] | null) {
    return this;
  }

  getGroups(): LogGroupsConfig {
    return {};
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
