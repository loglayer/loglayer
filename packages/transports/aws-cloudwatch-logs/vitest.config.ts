import { defineConfig } from "vitest/config";
import { vitestWorkerThreadsPlugin } from "./src/build-tools/index.js";

// This configuration adds a special plugin to allow vitest to resolve the worker threads propertly
export default defineConfig({
    plugins: [vitestWorkerThreadsPlugin()]
});
