
import { defineConfig } from "tsdown";

export default defineConfig({
  "outDir": "dist",
  "format": ["esm", "cjs"],
  "sourcemap": false,
  "target": ["es2022"],
  "nodeProtocol": true
});
