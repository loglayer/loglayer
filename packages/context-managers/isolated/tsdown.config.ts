
import { defineConfig } from "tsdown";

export default defineConfig({
  "entry": ["src/index.ts"],
  "format": ["cjs", "esm"],

  "sourcemap": true,
  "treeshake": true,
  "nodeProtocol": true,
  "fixedExtension": false
});
