/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { ILogBuilder, MessageDataType } from "@loglayer/shared";

/**
 * A mock implementation of the ILogBuilder interface that does nothing.
 * Useful for writing unit tests.
 */
export class MockLogBuilder implements ILogBuilder<MockLogBuilder, false> {
  // Accepts both regular calls and tagged templates
  debug(..._args: MessageDataType[] | [TemplateStringsArray, ...any[]]): void {}
  error(..._args: MessageDataType[] | [TemplateStringsArray, ...any[]]): void {}
  info(..._args: MessageDataType[] | [TemplateStringsArray, ...any[]]): void {}
  trace(..._args: MessageDataType[] | [TemplateStringsArray, ...any[]]): void {}
  warn(..._args: MessageDataType[] | [TemplateStringsArray, ...any[]]): void {}
  fatal(..._args: MessageDataType[] | [TemplateStringsArray, ...any[]]): void {}

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

  withGroup(_group: string | string[]) {
    return this as any;
  }
}
