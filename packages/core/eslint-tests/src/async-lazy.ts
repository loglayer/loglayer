/**
 * Tests that async lazy metadata correctly returns Promise<void>
 * and must be awaited (no-floating-promises).
 */
import { lazy, LogLevel } from "loglayer";
import { allLoggers, consoleLog } from "./setup.js";

const fetchValue = (): Promise<string> => Promise.resolve("async");
const fetchNumber = (): Promise<number> => Promise.resolve(123);

async function testAsyncLazyWithAllTransports() {
  for (const log of allLoggers) {
    // withMetadata + async lazy — all log levels
    await log.withMetadata({ key: lazy(async () => await fetchValue()) }).info("async lazy info");
    await log.withMetadata({ key: lazy(async () => await fetchValue()) }).warn("async lazy warn");
    await log.withMetadata({ key: lazy(async () => await fetchValue()) }).error("async lazy error");
    await log.withMetadata({ key: lazy(async () => await fetchValue()) }).debug("async lazy debug");
    await log.withMetadata({ key: lazy(async () => await fetchValue()) }).trace("async lazy trace");
    await log.withMetadata({ key: lazy(async () => await fetchValue()) }).fatal("async lazy fatal");

    // metadataOnly with async lazy
    await log.metadataOnly({ key: lazy(async () => await fetchValue()) });
    await log.metadataOnly({ key: lazy(async () => await fetchNumber()) }, "warn");

    // withError + async lazy metadata
    await log.withError(new Error("test")).withMetadata({ key: lazy(async () => await fetchValue()) }).info("chained async");

    // Mixed sync and async lazy — async wins
    await log.withMetadata({ sync: lazy(() => 1), async: lazy(async () => await fetchNumber()) }).info("mixed lazy");

    // Multiple async lazy values
    await log.withMetadata({
      a: lazy(async () => await fetchValue()),
      b: lazy(async () => await fetchNumber()),
    }).info("multiple async lazy");

    // raw() with async lazy metadata
    await log.raw({
      logLevel: LogLevel.info,
      messages: ["raw async lazy"],
      metadata: { key: lazy(async () => await fetchValue()) },
    });

    // raw() with mixed sync/async lazy metadata
    await log.raw({
      logLevel: LogLevel.warn,
      messages: ["raw mixed lazy"],
      metadata: {
        sync: lazy(() => "sync"),
        async: lazy(async () => await fetchValue()),
      },
    });
  }
}

async function testAsyncLazyWithChild() {
  for (const log of allLoggers) {
    const child = log.child();
    await child.withMetadata({ key: lazy(async () => await fetchValue()) }).info("child async lazy");
    await child.metadataOnly({ key: lazy(async () => await fetchNumber()) });

    const prefixed = log.withPrefix("[ASYNC]");
    await prefixed.withMetadata({ key: lazy(async () => await fetchValue()) }).info("prefixed async lazy");
    await prefixed.metadataOnly({ key: lazy(async () => await fetchValue()) });
  }
}

async function testAsyncLazyBuilderChaining() {
  const log = consoleLog;

  // withMetadata(async) then withError
  await log.withMetadata({ key: lazy(async () => await fetchValue()) }).withError(new Error("test")).info("async then error");

  // Multiple withMetadata — second has async, makes it async
  await log.withMetadata({ a: 1 }).withMetadata({ b: lazy(async () => await fetchNumber()) }).info("second metadata async");

  // enableLogging/disableLogging on async builder
  await log.withMetadata({ key: lazy(async () => await fetchValue()) }).enableLogging().info("async enable");
  await log.withMetadata({ key: lazy(async () => await fetchValue()) }).disableLogging().info("async disable");
}

void testAsyncLazyWithAllTransports();
void testAsyncLazyWithChild();
void testAsyncLazyBuilderChaining();
