// Stripped version of: https://github.com/sindresorhus/exit-hook/blob/main/index.js

import process from "node:process";

type ExitCode = typeof process.exitCode;
type ExitCallback = (exitCode: ExitCode) => Promise<void>;

const callbacks = new Set<[ExitCallback, number]>();

let isCalled = false;
let isRegistered = false;

async function exit(shouldManuallyExit: boolean, isSynchronous: boolean, signal: number) {
  if (isCalled) {
    return;
  }

  isCalled = true;

  if (callbacks.size > 0 && isSynchronous) {
    console.error(
      [
        "SYNCHRONOUS TERMINATION NOTICE:",
        "When explicitly exiting the process via process.exit or via a parent process,",
        "asynchronous tasks in your exitHooks will not run. Either remove these tasks,",
        "use gracefulExit() instead of process.exit(), or ensure your parent process",
        "sends a SIGINT to the process running this code.",
      ].join(" "),
    );
  }

  let exitCode: ExitCode = 0;

  // A non-graceful signal should be preserved over process.exitCode
  if (signal > 0) {
    exitCode = 128 + signal;
    // Respect process.exitCode for graceful exits
  } else if (typeof process.exitCode === "number" || typeof process.exitCode === "string") {
    exitCode = process.exitCode;
  }

  const done = (force = false) => {
    if (force === true || shouldManuallyExit === true) {
      process.exit(exitCode);
    }
  };

  if (isSynchronous) {
    done();
    return;
  }

  const promises = [];
  let forceAfter = 0;
  for (const [callback, wait] of callbacks) {
    forceAfter = Math.max(forceAfter, wait);
    promises.push(Promise.resolve(callback(exitCode)));
  }

  // Force exit if we exceeded our wait value
  const timer = setTimeout(() => {
    done(true);
  }, forceAfter);

  await Promise.all(promises);
  clearTimeout(timer);
  done();
}

export function addExitHook(onExit: ExitCallback, options: { wait: number }) {
  if (typeof onExit !== "function") {
    throw new TypeError("onExit must be a function");
  }

  const { wait } = options;

  if (!(typeof wait === "number" && wait > 0)) {
    throw new TypeError("wait must be set to a positive numeric value");
  }

  const asyncCallbackConfig: [ExitCallback, number] = [onExit, wait];

  callbacks.add(asyncCallbackConfig);

  if (!isRegistered) {
    isRegistered = true;

    // Exit cases that support asynchronous handling
    process.once("beforeExit", exit.bind(undefined, true, false, -128));
    process.once("SIGINT", exit.bind(undefined, true, false, 2));
    process.once("SIGTERM", exit.bind(undefined, true, false, 15));

    // Explicit exit events. Calling will force an immediate exit and run all
    // synchronous hooks. Explicit exits must not extend the node process
    // artificially. Will log errors if asynchronous calls exist.
    process.once("exit", exit.bind(undefined, false, true, 0));

    // PM2 Cluster shutdown message. Caught to support async handlers with pm2,
    // needed because explicitly calling process.exit() doesn't trigger the
    // beforeExit event, and the exit event cannot support async handlers,
    // since the event loop is never called after it.
    process.on("message", (message) => {
      if (message === "shutdown") {
        exit(true, true, -128);
      }
    });
  }

  return () => {
    callbacks.delete(asyncCallbackConfig);
  };
}

export function gracefulExit(signal = 0) {
  exit(true, false, -128 + signal);
}
