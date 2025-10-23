import type { Worker } from "node:worker_threads";
import type { SendEventParams } from "../../common.types.js";
import { addExitHook } from "../../vendor/exit-hook/index.js";
import { BaseStrategy } from "../base.strategy.js";
import LogWorker from "./worker.js?thread";
import type {
  CloudWatchLogsWorkerQueueOptions,
  WorkerDataOptions,
  WorkerError,
  WorkerEventMessage,
  WorkerResponse,
  WorkerStopMessage,
} from "./worker-queue.types.js";

const MAX_WAIT_TIME = 30000;

// Uses a worker thread to send logs
export class WorkerQueueStrategy extends BaseStrategy {
  #queueOptions?: CloudWatchLogsWorkerQueueOptions;
  #msgErrorHandler: (error: WorkerError) => void;
  #worker?: Worker;
  #createIfNotExists: boolean;

  constructor(queueOptions?: CloudWatchLogsWorkerQueueOptions) {
    if (queueOptions?.batchSize) {
      if (queueOptions.batchSize < 1 || queueOptions.batchSize > 10000) {
        throw new Error("Batch size must be between 1 and 10000");
      }
    }
    if (typeof queueOptions?.delay === "number" && queueOptions.delay < 1) {
      throw new Error("The specified delay is must be bigger than 0");
    }

    super();
    this.#queueOptions = queueOptions;
    this.#createIfNotExists = queueOptions?.createIfNotExists ?? false;
    this.#msgErrorHandler = (msg: WorkerResponse) => {
      if (msg.type === "error") {
        this.onError?.(msg.error);
      }
    };

    addExitHook(this.cleanup.bind(this), { wait: MAX_WAIT_TIME });
  }

  public sendEvent({ event, logGroupName, logStreamName }: SendEventParams): void {
    this.#worker ??= this.#initializeWorker();
    this.#worker.postMessage({ type: "event", event, logGroupName, logStreamName } as WorkerEventMessage);
  }

  public cleanup() {
    if (this.#worker) {
      if (this.onError) {
        this.#worker.off("error", this.onError);
        this.#worker.off("messageerror", this.onError);
        this.#worker.off("message", this.#msgErrorHandler);
      }

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
    const hasErrorHandler = !!this.onError;

    const instance = new LogWorker({
      // These values must be serializable to be passed to the worker thread
      workerData: {
        ...this.#queueOptions,
        hasErrorHandler,
        createIfNotExists: this.#createIfNotExists,
      } satisfies WorkerDataOptions,
      env: process.env,
    });

    if (hasErrorHandler) {
      instance.on("error", this.onError);
      instance.on("messageerror", this.onError);
      instance.on("message", this.#msgErrorHandler);
    }

    return instance;
  }
}
