import { defineConfig } from "tsdown";
import { workerThreadsPlugin } from "./src/rolldown/index.js";

export default defineConfig((cmdConfig) => ({
  outDir: "dist",
  format: ["esm", "cjs"],
  target: ["es2022"],
  dts: true,
  ...cmdConfig,
  entry: [
    "src/index.ts",
    "src/strategies/server/index.ts",
  ],
  plugins: [workerThreadsPlugin()],
}));
