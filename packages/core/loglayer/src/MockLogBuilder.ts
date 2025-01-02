/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { MessageDataType } from "@loglayer/shared";
import type { ILogBuilder } from "./types/index.js";

export class MockLogBuilder implements ILogBuilder {
  debug(...messages: MessageDataType[]): void {}

  error(...messages: MessageDataType[]): void {}

  info(...messages: MessageDataType[]): void {}

  trace(...messages: MessageDataType[]): void {}

  warn(...messages: MessageDataType[]): void {}

  fatal(...messages: MessageDataType[]): void {}

  enableLogging() {
    return this;
  }

  disableLogging() {
    return this;
  }

  withMetadata(metadata: Record<string, any>): ILogBuilder {
    return this;
  }

  withError(error: any): ILogBuilder {
    return this;
  }
}