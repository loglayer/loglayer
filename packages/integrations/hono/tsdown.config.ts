
import { defineConfig } from "tsdown";

export default defineConfig({
  "outDir": "dist",
  "format": ["esm", "cjs"],
  "sourcemap": true,
  "target": ["es2022"],
  "nodeProtocol": true,
  "fixedExtension": false
});
