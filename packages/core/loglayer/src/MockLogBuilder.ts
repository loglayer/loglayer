/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { ILogBuilder, MessageDataType } from "@loglayer/shared";

/**
 * A mock implementation of the ILogBuilder interface that does nothing.
 * Useful for writing unit tests.
 */
export class MockLogBuilder implements ILogBuilder<MockLogBuilder> {
  debug(..._messages: MessageDataType[]): void | Promise<void> {}

  error(..._messages: MessageDataType[]): void | Promise<void> {}

  info(..._messages: MessageDataType[]): void | Promise<void> {}

  trace(..._messages: MessageDataType[]): void | Promise<void> {}

  warn(..._messages: MessageDataType[]): void | Promise<void> {}

  fatal(..._messages: MessageDataType[]): void | Promise<void> {}

  enableLogging() {
    return this;
  }

  disableLogging() {
    return this;
  }

  withMetadata(_metadata?: Record<string, any>) {
    return this;
  }

  withError(_error: any) {
    return this;
  }
}
