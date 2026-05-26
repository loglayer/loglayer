import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  dts: true,
  splitting: false,
  clean: true,
  format: ["esm", "cjs"],
});