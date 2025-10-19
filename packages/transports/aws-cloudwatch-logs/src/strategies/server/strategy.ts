import type { Worker } from "node:worker_threads";
import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsStrategy, CloudWatchLogsStrategyOptions, ICloudWatchLogsStrategy } from "../common.js";
import type { CloudWatchLogsWorkerQueueOptions, WorkerError, WorkerEventMessage } from "./common.js";
import LogWorker from "./worker.js?thread";

// Uses a worker thread to send logs
class WorkerQueueStrategy implements ICloudWatchLogsStrategy {
  #options: CloudWatchLogsStrategyOptions;
  #queueOptions?: CloudWatchLogsWorkerQueueOptions;
  #errorHandler?: CloudWatchLogsStrategyOptions["onError"];
  #worker?: Worker;

  constructor(options: CloudWatchLogsStrategyOptions, queueOptions?: CloudWatchLogsWorkerQueueOptions) {
    const { onError, ...rest } = options;
    this.#options = rest;
    this.#queueOptions = queueOptions;
    this.#errorHandler = onError;
  }

  public sendEvent(event: InputLogEvent, logGroupName: string, logStreamName: string): Promise<void> {
    this.#worker ??= this.#initializeWorker();
    this.#worker.postMessage({ event, logGroupName, logStreamName } as WorkerEventMessage);
    return Promise.resolve();
  }

  #initializeWorker() {
    const instance = new LogWorker({ workerData: { ...this.#options, ...this.#queueOptions }, env: process.env });
    instance.on("error", (error) => this.#errorHandler?.(error));
    instance.on("messageerror", (error) => this.#errorHandler?.(error));
    instance.on("message", (message: WorkerError) => this.#errorHandler?.(message.error));
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
export const CloudWatchLogsWorkerQueueStrategy: CloudWatchLogsStrategy = createWorkerQueueStrategy();
