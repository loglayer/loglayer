// This plugin allows vitest to run tests in a worker thread

import type { Vite } from "vitest/node";
import { getImportQueryParams } from "./shared.js";

const plugin = (): Vite.Plugin => {
  return {
    name: "loglayer:vitest-worker-threads",
    enforce: "pre",
    resolveId(source, importer) {
      const query = getImportQueryParams(source);
      if (query.has("thread") && !query.get("thread")) {
        return `${source}=${importer}`;
      }
    },
    async load(id) {
      const query = getImportQueryParams(id);
      const importer = query.get("thread");
      if (importer) {
        let chunkId = id.replace(/\?.*/m, "");
        let resolvedId = await this.resolve(chunkId, importer, { skipSelf: true });
        if (resolvedId === null) {
          if (!chunkId.startsWith(".")) {
            chunkId = `./${chunkId}`;
            resolvedId = await this.resolve(chunkId, importer, { skipSelf: true });
          }
          if (resolvedId === null) {
            this.info(`Cannot resolve ${id} in ${importer}`);
            return null;
          }
        }
        const info = await this.load({ id: resolvedId.id });
        const worker = `import { tsImport } from "tsx/esm/api"; tsImport("${info.id.replace(/^\w:/, "")}", import.meta.url);`;
        return `import { Worker } from 'node:worker_threads'; export default function WorkerWrapper(options) { return new Worker(\`${worker}\`, Object.assign({ eval: true }, options)); }`;
      }
    },
  };
};

export default plugin;
