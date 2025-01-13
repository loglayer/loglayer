const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to omit from copying
const omitDirectories = ['console'];

// Create directories if they don't exist
const docsDir = path.join(__dirname, '..');
const transportLogsDir = path.join(docsDir, 'src/transports/changelogs');
const pluginLogsDir = path.join(docsDir, 'src/plugins/changelogs');
const coreLogsDir = path.join(docsDir, 'src/core-changelogs');

fs.mkdirSync(transportLogsDir, { recursive: true });
fs.mkdirSync(pluginLogsDir, { recursive: true });
fs.mkdirSync(coreLogsDir, { recursive: true });

// Copy transport changelogs
const transportPaths = glob.sync(path.join(__dirname, '../../packages/transports/*/CHANGELOG.md'))
    .filter(changelog => !omitDirectories.includes(path.basename(path.dirname(changelog))));
transportPaths.forEach(changelog => {
    const transportName = path.basename(path.dirname(changelog));
    const destination = path.join(transportLogsDir, `${transportName}-changelog.md`);
    fs.copyFileSync(changelog, destination);
    console.log(`Copied ${transportName} changelog`);
});

// Copy plugin changelogs
const pluginPaths = glob.sync(path.join(__dirname, '../../packages/plugins/*/CHANGELOG.md'))
    .filter(changelog => !omitDirectories.includes(path.basename(path.dirname(changelog))));
pluginPaths.forEach(changelog => {
    const pluginName = path.basename(path.dirname(changelog));
    const destination = path.join(pluginLogsDir, `${pluginName}-changelog.md`);
    fs.copyFileSync(changelog, destination);
    console.log(`Copied ${pluginName} changelog`);
});

// Copy core changelogs
const corePaths = glob.sync(path.join(__dirname, '../../packages/core/*/CHANGELOG.md'))
    .filter(changelog => !omitDirectories.includes(path.basename(path.dirname(changelog))));
corePaths.forEach(changelog => {
    const coreName = path.basename(path.dirname(changelog));
    const destination = path.join(coreLogsDir, `${coreName}-changelog.md`);
    fs.copyFileSync(changelog, destination);
    console.log(`Copied ${coreName} changelog`);
}); 