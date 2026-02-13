/**
 * Shared LogLayer instances used across all ESLint test files.
 */
import {
  BlankTransport,
  ConsoleTransport,
  LogLayer,
  StructuredTransport,
  TestLoggingLibrary,
  TestTransport,
} from "loglayer";

// --- ConsoleTransport ---
export const consoleLog = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
});

// --- StructuredTransport ---
export const structuredLog = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

// --- StructuredTransport with options ---
export const structuredLogCustom = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
    level: "warn",
    messageField: "message",
    dateField: "timestamp",
    levelField: "severity",
    dateFn: () => Date.now(),
    levelFn: (level) => level.toUpperCase(),
    stringify: true,
  }),
});

// --- TestTransport ---
export const testLog = new LogLayer({
  transport: new TestTransport({ logger: new TestLoggingLibrary() }),
});

// --- BlankTransport ---
export const blankLog = new LogLayer({
  transport: new BlankTransport({
    shipToLogger: ({ messages }): string[] => messages as string[],
  }),
});

// --- Multiple transports ---
export const multiLog = new LogLayer({
  transport: [
    new ConsoleTransport({ logger: console }),
    new StructuredTransport({ logger: console }),
    new TestTransport({ logger: new TestLoggingLibrary() }),
    new BlankTransport({ shipToLogger: ({ messages }): string[] => messages as string[] }),
  ],
});

export const allLoggers = [consoleLog, structuredLog, structuredLogCustom, testLog, blankLog, multiLog];
