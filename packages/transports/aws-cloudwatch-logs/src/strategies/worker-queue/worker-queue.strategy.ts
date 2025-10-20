import type { Worker } from "node:worker_threads";
import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { addExitHook } from "../../vendor/exit-hook.js";
import type { CloudWatchLogsStrategy, CloudWatchLogsStrategyOptions, ICloudWatchLogsStrategy } from "../common.js";
import type {
  CloudWatchLogsWorkerQueueOptions,
  WorkerDataOptions,
  WorkerError,
  WorkerEventMessage,
  WorkerResponse,
  WorkerStopMessage,
} from "./common.js";
import LogWorker from "./worker.js?thread";

const MAX_WAIT_TIME = 30000;

// Uses a worker thread to send logs
class WorkerQueueStrategy implements ICloudWatchLogsStrategy {
  #options: CloudWatchLogsStrategyOptions;
  #queueOptions?: CloudWatchLogsWorkerQueueOptions;
  #errorHandler?: CloudWatchLogsStrategyOptions["onError"];
  #msgErrorHandler: (error: WorkerError) => void;
  #worker?: Worker;

  constructor(options: CloudWatchLogsStrategyOptions, queueOptions?: CloudWatchLogsWorkerQueueOptions) {
    const { onError, ...rest } = options;
    this.#options = rest;
    this.#queueOptions = queueOptions;
    this.#errorHandler = onError;
    this.#msgErrorHandler = (msg: WorkerResponse) => {
      if (msg.type === "error") {
        onError?.(msg.error);
      }
    };

    addExitHook(this.cleanup.bind(this), { wait: MAX_WAIT_TIME });
  }

  public sendEvent(event: InputLogEvent, logGroupName: string, logStreamName: string): void {
    this.#worker ??= this.#initializeWorker();
    this.#worker.postMessage({ type: "event", event, logGroupName, logStreamName } as WorkerEventMessage);
  }

  public cleanup() {
    if (this.#errorHandler) {
      this.#worker?.off("error", this.#errorHandler);
      this.#worker?.off("messageerror", this.#errorHandler);
      this.#worker?.off("message", this.#msgErrorHandler);
    }
    if (this.#worker) {
      let release: () => void;
      const lock = new Promise<void>((resolve) => {
        release = resolve;
      });
      const controller = new AbortController();
      const terminateWorker = () => {
        this.#worker?.terminate();
        this.#worker = undefined;
        release();
      };
      this.#worker.on("exit", terminateWorker);

      // If the worker is not closed up after MAX_WAIT_TIME, force terminate
      const timeout = setTimeout(terminateWorker, MAX_WAIT_TIME);
      controller.signal.addEventListener("abort", () => clearTimeout(timeout));

      // Send stop message
      this.#worker.postMessage({ type: "stop" } as WorkerStopMessage);

      return lock;
    }
  }

  #initializeWorker() {
    const hasErrorHandler = !!this.#errorHandler;
    const instance = new LogWorker({
      workerData: { ...this.#options, ...this.#queueOptions, hasErrorHandler } satisfies WorkerDataOptions,
      env: process.env,
    });
    if (hasErrorHandler) {
      instance.on("error", this.#errorHandler);
      instance.on("messageerror", this.#errorHandler);
      instance.on("message", this.#msgErrorHandler);
    }
    return instance;
  }
}

/**
 * Creates a CloudWatchLogsWorkerQueueStrategy with custom options.
 * @param queueOptions
 * @returns
 */
export function createWorkerQueueStrategy(queueOptions?: CloudWatchLogsWorkerQueueOptions): CloudWatchLogsStrategy {
  if (queueOptions?.batchSize) {
    if (queueOptions.batchSize < 1 || queueOptions.batchSize > 10000) {
      throw new Error("Batch size must be between 1 and 10000");
    }
  }
  if (queueOptions?.delay && queueOptions.delay < 1) {
    throw new Error("The specified delay is must be bigger than 0");
  }
  return (options) => new WorkerQueueStrategy(options, queueOptions);
}

/**
 * A CloudWatchLogsStrategy that uses a worker thread to send logs
 */
export const CloudWatchLogsWorkerQueueStrategy: CloudWatchLogsStrategy = (options) => new WorkerQueueStrategy(options);
