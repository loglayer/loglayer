import type { Worker } from "node:worker_threads";
import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsHandler, CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "../common.js";
import type { CloudWatchLogsWorkerQueueOptions, WorkerError, WorkerEventMessage } from "./common.js";
import LogWorker from "./worker.js?thread";

// Uses a worker thread to send logs
class WorkerQueueHandler implements ICloudWatchLogsHandler {
  #options: CloudWatchLogsHandlerOptions;
  #queueOptions?: CloudWatchLogsWorkerQueueOptions;
  #errorHandler?: CloudWatchLogsHandlerOptions["onError"];
  #worker?: Worker;

  constructor(options: CloudWatchLogsHandlerOptions, queueOptions?: CloudWatchLogsWorkerQueueOptions) {
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
 * Creates a CloudWatchLogsWorkerQueueHandler with custom options.
 * @param queueOptions
 * @returns
 */
export function createWorkerQueueHandler(queueOptions?: CloudWatchLogsWorkerQueueOptions): CloudWatchLogsHandler {
  return (options) => new WorkerQueueHandler(options, queueOptions);
}

export const CloudWatchLogsWorkerQueueHandler: CloudWatchLogsHandler = createWorkerQueueHandler();
