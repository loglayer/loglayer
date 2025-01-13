import fs from "node:fs";
import * as url from "node:url";
import pkgJson from "./node_modules/loglayer/package.json" assert { type: "json" };
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

fs.writeFileSync(`${__dirname}/src/version.ts`, `export const version = "${pkgJson.version}";`);