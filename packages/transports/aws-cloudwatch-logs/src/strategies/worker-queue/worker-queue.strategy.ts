import type { Worker } from "node:worker_threads";
import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsStrategy, CloudWatchLogsStrategyOptions, ICloudWatchLogsStrategy } from "../common.js";
import type { CloudWatchLogsWorkerQueueOptions, WorkerDataOptions, WorkerError, WorkerEventMessage } from "./common.js";
import LogWorker from "./worker.js?thread";

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
    this.#msgErrorHandler = (msg) => onError?.(msg.error);
  }

  public sendEvent(event: InputLogEvent, logGroupName: string, logStreamName: string): void {
    this.#worker ??= this.#initializeWorker();
    this.#worker.postMessage({ event, logGroupName, logStreamName } as WorkerEventMessage);
  }

  public async cleanup() {
    if (this.#errorHandler) {
      this.#worker?.off("error", this.#errorHandler);
      this.#worker?.off("messageerror", this.#errorHandler);
      this.#worker?.off("message", this.#msgErrorHandler);
    }
    await this.#worker?.terminate();
    this.#worker = undefined;
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
