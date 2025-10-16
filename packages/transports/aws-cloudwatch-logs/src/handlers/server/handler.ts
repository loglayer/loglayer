import type { Worker } from "node:worker_threads";
import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsHandler, CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "../common.js";
import type { WorkerEventMessage } from "./common.js";
import LogWorker from "./worker.js?thread";

class CloudWatchLogsWorkerQueue implements ICloudWatchLogsHandler {
  #worker?: Worker;
  constructor(private readonly options: CloudWatchLogsHandlerOptions) {}

  public handleEvent(event: InputLogEvent, logGroupName?: string, logStreamName?: string): void {
    this.#worker ??= new LogWorker({ workerData: this.options, env: process.env });
    this.#worker.postMessage({ event, logGroupName, logStreamName } as WorkerEventMessage);
  }
}

export const CloudWatchLogsWorkerHandler: CloudWatchLogsHandler = (options) => new CloudWatchLogsWorkerQueue(options);
