/* eslint @typescript-eslint/no-empty-function: 0 */
/* istanbul ignore file */

import type { ILogBuilder, TaggedTemplateOrMessageArgs } from "@loglayer/shared";

/**
 * A mock implementation of the ILogBuilder interface that does nothing.
 * Useful for writing unit tests.
 */
export class MockLogBuilder implements ILogBuilder<MockLogBuilder, false> {
  // Accepts both regular calls and tagged templates
  debug(..._args: TaggedTemplateOrMessageArgs): void {}
  error(..._args: TaggedTemplateOrMessageArgs): void {}
  info(..._args: TaggedTemplateOrMessageArgs): void {}
  trace(..._args: TaggedTemplateOrMessageArgs): void {}
  warn(..._args: TaggedTemplateOrMessageArgs): void {}
  fatal(..._args: TaggedTemplateOrMessageArgs): void {}

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
