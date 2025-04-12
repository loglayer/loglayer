const fs = require("node:fs");
const path = require("node:path");
const glob = require("glob");

// Directories to omit from copying
const omitDirectories = ["console", "tsconfig"];

// Create directories if they don't exist
const docsDir = path.join(__dirname, "..");
const transportLogsDir = path.join(docsDir, "src/transports/changelogs");
const pluginLogsDir = path.join(docsDir, "src/plugins/changelogs");
const coreLogsDir = path.join(docsDir, "src/core-changelogs");
const contextManagerLogsDir = path.join(docsDir, "src/context-managers/changelogs");

fs.mkdirSync(transportLogsDir, { recursive: true });
fs.mkdirSync(pluginLogsDir, { recursive: true });
fs.mkdirSync(coreLogsDir, { recursive: true });
fs.mkdirSync(contextManagerLogsDir, { recursive: true });

// Copy transport changelogs
const transportPaths = glob
  .sync(path.join(__dirname, "../../packages/transports/*/CHANGELOG.md"))
  .filter((changelog) => !omitDirectories.includes(path.basename(path.dirname(changelog))));

for (const changelog of transportPaths) {
  const transportName = path.basename(path.dirname(changelog));
  const destination = path.join(transportLogsDir, `${transportName}-changelog.md`);
  fs.copyFileSync(changelog, destination);
  console.log(`Copied ${transportName} changelog`);
}

// Copy plugin changelogs
const pluginPaths = glob
  .sync(path.join(__dirname, "../../packages/plugins/*/CHANGELOG.md"))
  .filter((changelog) => !omitDirectories.includes(path.basename(path.dirname(changelog))));

for (const changelog of pluginPaths) {
  const pluginName = path.basename(path.dirname(changelog));
  const destination = path.join(pluginLogsDir, `${pluginName}-changelog.md`);
  fs.copyFileSync(changelog, destination);
  console.log(`Copied ${pluginName} changelog`);
}

// Copy core changelogs
const corePaths = glob
  .sync(path.join(__dirname, "../../packages/core/*/CHANGELOG.md"))
  .filter((changelog) => !omitDirectories.includes(path.basename(path.dirname(changelog))));

for (const changelog of corePaths) {
  const coreName = path.basename(path.dirname(changelog));
  const destination = path.join(coreLogsDir, `${coreName}-changelog.md`);
  fs.copyFileSync(changelog, destination);
  console.log(`Copied ${coreName} changelog`);
}

// Copy context manager changelogs
const contextManagerPaths = glob
  .sync(path.join(__dirname, "../../packages/context-managers/*/CHANGELOG.md"))
  .filter((changelog) => !omitDirectories.includes(path.basename(path.dirname(changelog))));

for (const changelog of contextManagerPaths) {
  const contextManagerName = path.basename(path.dirname(changelog));
  const destination = path.join(contextManagerLogsDir, `${contextManagerName}-changelog.md`);
  fs.copyFileSync(changelog, destination);
  console.log(`Copied ${contextManagerName} changelog`);
}
