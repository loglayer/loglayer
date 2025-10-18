// This custom rolldown plugin is used to compile the worker thread used by CloudWatchLogsWorkerHandler

import path from "node:path";
import { BindingMagicString, type Plugin } from "rolldown";

type AvailableQueryParams = "thread" | "importer";

interface ImportQueryParams extends URLSearchParams {
  has(key: AvailableQueryParams): boolean;
}

function getImportQueryParams(id: string): ImportQueryParams {
  return new URL(id.replace(/^C:/, "/"), "file:").searchParams;
}

const WORKER_ASSET_PREFIX = "__LOGLAYER_ROLLDOWN_WORKERS_ASSET__";
const WORKER_ASSET_PATTERN = /__LOGLAYER_ROLLDOWN_WORKERS_ASSET__([\w\d]+)__/g;

const plugin = (): Plugin => {
  return {
    name: "loglayer/rolldown-worker-threads",
    resolveId(source, importer) {
      const query = getImportQueryParams(source);
      if (query.has("thread")) {
        return `${source}&importer=${importer}`;
      }
    },
    async load(id) {
      const query = getImportQueryParams(id);
      const importer = query.get("importer");
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
        const referenceId = this.emitFile({
          type: "chunk",
          id: resolvedId.id,
          importer: importer,
        });
        const assetRefId = `${WORKER_ASSET_PREFIX}${referenceId}__`;
        return `
import path from 'node:path';
import { Worker } from 'node:worker_threads';
export default function createWorker(options) {
  return new Worker(path.resolve(import.meta.dirname, ${assetRefId}), options);
}
`;
      }
    },
    renderChunk(code, chunk) {
      if (code.match(WORKER_ASSET_PATTERN)) {
        let match = WORKER_ASSET_PATTERN.exec(code);
        const s = new BindingMagicString(code);

        while (match) {
          const [full, hash] = match;
          const filename = this.getFileName(hash!);
          let outputFilepath = path.posix.relative(path.dirname(chunk.fileName), filename);
          if (!outputFilepath.startsWith(".")) {
            outputFilepath = `./${outputFilepath}`;
          }
          const replacement = JSON.stringify(outputFilepath);
          s.overwrite(match.index, match.index + full.length, replacement);

          match = WORKER_ASSET_PATTERN.exec(code);
        }

        return s.toString();
      }
    },
  };
};

export default plugin;
