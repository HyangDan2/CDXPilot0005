import { existsSync } from 'node:fs';
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) throw new Error('Use Node.js 22.13 or newer.');
for (const file of ['package.json', 'AGENTS.md', 'index.html'])
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
console.log(`Environment OK: Node ${process.versions.node}`);
