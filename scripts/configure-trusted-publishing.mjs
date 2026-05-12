// Set publish access to "Require two-factor authentication and disallow tokens"
// for all @loglayer packages.  Idempotent — skips already-set packages.
// Usage: node scripts/configure-trusted-publishing.mjs <npm-token> <otp>

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const token = process.argv[2];
const otp = process.argv[3];
if (!token) { console.log('Usage: node scripts/configure-trusted-publishing.mjs <npm-token> <otp>'); process.exit(1); }

const stateFile = '.npm-access-state.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Load done set
let done = new Set();
if (existsSync(stateFile)) done = new Set(JSON.parse(readFileSync(stateFile, 'utf8')));

// Discover packages
const packages = [];
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'package.json') {
      const pkg = JSON.parse(readFileSync(p, 'utf8'));
      if (pkg.name && !pkg.name.startsWith('@internal/')) packages.push(pkg.name);
    }
  }
}
walk('packages');
packages.sort();

// Filter out already-done
const remaining = packages.filter(p => !done.has(p));

const accessBody = JSON.stringify({
  access: 'public',
  publish_requires_tfa: true,
  automation_token_overrides_tfa: false,
});

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  ...(otp ? { 'npm-otp': otp } : {}),
};

console.log(`${done.size} already done, ${remaining.length} remaining out of ${packages.length}`);
console.log();

if (remaining.length === 0) {
  console.log('All packages already configured!');
  process.exit(0);
}

let ok = 0, fail = 0;
for (let i = 0; i < remaining.length; i++) {
  const pkg = remaining[i];
  const url = `https://registry.npmjs.org/-/package/${encodeURIComponent(pkg)}/access`;
  const res = await fetch(url, { method: 'POST', headers, body: accessBody });
  if (res.ok) {
    console.log(`  OK   #${String(i+1).padStart(2)} ${pkg}`);
    done.add(pkg);
    writeFileSync(stateFile, JSON.stringify([...done].sort(), null, 2) + '\n');
    ok++;
  }
  else {
    const text = await res.text();
    console.log(`  fail #${i+1} ${pkg} (${res.status}: ${text.slice(0, 200)})`);
    fail++;
    break;
  }
  if (i < remaining.length - 1) await sleep(500);
}

console.log(`\n${ok} set, ${fail} failed`);
if (fail > 0) process.exit(1);
