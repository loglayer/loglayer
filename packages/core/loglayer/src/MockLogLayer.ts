/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { ErrorOnlyOpts, ILogBuilder, ILogLayer, LogLevel, MessageDataType } from "@loglayer/shared";
import type { LogLayerTransport } from "@loglayer/transport";
import { MockLogBuilder } from "./MockLogBuilder.js";

import type { LogLayerPlugin } from "@loglayer/plugin";

export class MockLogLayer implements ILogLayer {
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

  metadataOnly(metadata: Record<string, any>, logLevel: LogLevel): void {}

  addPlugins(plugins: Array<LogLayerPlugin>) {}

  removePlugin(id: string) {}

  enablePlugin(id: string) {}

  disablePlugin(id: string) {}

  withPrefix(prefix: string) {
    return new MockLogLayer() as ILogLayer;
  }

  withContext(context: Record<string, any>): ILogLayer {
    return this as ILogLayer;
  }

  withError(error: any): ILogBuilder {
    return new MockLogBuilder();
  }

  withMetadata(metadata: Record<string, any>): ILogBuilder {
    return new MockLogBuilder();
  }

  getContext(): Record<string, any> {
    return {};
  }

  enableLogging() {
    return this;
  }

  disableLogging() {
    return this;
  }

  child() {
    return new MockLogLayer() as ILogLayer;
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
}
