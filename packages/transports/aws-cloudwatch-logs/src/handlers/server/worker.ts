// This worker wraps the default handler to send the logs to CloudWatch

import { parentPort, workerData } from "node:worker_threads";
import type { CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "../common.js";
import { createDefaultHandler } from "../handler.js";
import type { WorkerEventMessage } from "./common.js";

// The wrapped handler instance, used to send logs
let sender: ICloudWatchLogsHandler | undefined;

const options = workerData as CloudWatchLogsHandlerOptions;
options.onError = (error) => {
  parentPort.emit("messageerror", error);
};

parentPort?.on("message", async (msg: WorkerEventMessage) => {
  // Ensure the wrapped handler is initialized
  sender ??= createDefaultHandler(options);
  await sender.handleEvent(msg.event, msg.logGroupName, msg.logStreamName);
});
