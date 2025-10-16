declare module "*?thread" {
  const WorkerHandler: {
    new (options: import("node:worker_threads").WorkerOptions): import("node:worker_threads").Worker;
  };
  export default WorkerHandler;
}
