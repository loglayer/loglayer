/**
 * ESLint type-checked tests for loglayer.
 *
 * This project is linted with @typescript-eslint/recommended-type-checked
 * which includes the no-floating-promises rule.
 *
 * If any log call incorrectly returns Promise<void> when it should return void,
 * ESLint will report a no-floating-promises error and the test will fail.
 *
 * Each file tests a specific area:
 * - setup.ts: Shared LogLayer instances with various transports
 * - log-methods.ts: Direct log methods, errorOnly, withError, withMetadata, metadataOnly, sync lazy, chaining
 * - raw.ts: raw() method with various configurations
 * - context-prefix-child.ts: Context, prefix, child loggers, enable/disable, log levels, mute, transport/config
 * - plugins.ts: All plugin callbacks, combinations, management, typed function signatures
 * - mock.ts: MockLogLayer
 * - groups.ts: Groups (withGroup, runtime management, config, mock)
 * - async-lazy.ts: Async lazy metadata (must be awaited)
 */
import "./setup.js";
import "./log-methods.js";
import "./raw.js";
import "./context-prefix-child.js";
import "./plugins.js";
import "./mock.js";
import "./mixins.js";
import "./groups.js";
import "./async-lazy.js";
