import { defineConfig } from "tsdown";
import { rolldownWorkerThreadsPlugin } from "./src/build-tools/index.js";

export default defineConfig((cmdConfig) => ({
  outDir: "dist",
  format: ["esm", "cjs"],
  target: ["es2022"],
  dts: true,
  plugins: [rolldownWorkerThreadsPlugin()],
  ...cmdConfig,
}));
