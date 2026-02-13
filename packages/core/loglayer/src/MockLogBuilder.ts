/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { ILogBuilder, MessageDataType } from "@loglayer/shared";

/**
 * A mock implementation of the ILogBuilder interface that does nothing.
 * Useful for writing unit tests.
 */
export class MockLogBuilder implements ILogBuilder<MockLogBuilder, false> {
  debug(..._messages: MessageDataType[]): void {}

  error(..._messages: MessageDataType[]): void {}

  info(..._messages: MessageDataType[]): void {}

  trace(..._messages: MessageDataType[]): void {}

  warn(..._messages: MessageDataType[]): void {}

  fatal(..._messages: MessageDataType[]): void {}

  enableLogging() {
    return this;
  }

  disableLogging() {
    return this;
  }

  withMetadata(_metadata?: Record<string, any>) {
    return this as any;
  }

  withError(_error: any) {
    return this as any;
  }
}
