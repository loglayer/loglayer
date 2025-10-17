import type { Worker } from "node:worker_threads";
import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsHandler, CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "../common.js";
import type { WorkerEventMessage } from "./common.js";
import LogWorker from "./worker.js?thread";

// Uses a worker thread to send logs
class WorkerQueue implements ICloudWatchLogsHandler {
  #options: CloudWatchLogsHandlerOptions;
  #errorHandler: CloudWatchLogsHandlerOptions["onError"];
  #worker?: Worker;
  constructor(options: CloudWatchLogsHandlerOptions) {
    const { onError, ...rest } = options;
    this.#options = rest;
    this.#errorHandler = onError;
  }

  public handleEvent(event: InputLogEvent, logGroupName?: string, logStreamName?: string): void {
    this.#worker ??= this.#createWorker();
    this.#worker.postMessage({ event, logGroupName, logStreamName } as WorkerEventMessage);
  }

  #createWorker() {
    const instance = new LogWorker({ workerData: this.#options, env: process.env });
    instance.on("error", (error) => this.#errorHandler(error));
    instance.on("messageerror", (error) => this.#errorHandler(error));
    return instance;
  }
}

export const CloudWatchLogsWorkerHandler: CloudWatchLogsHandler = (options) => new WorkerQueue(options);
