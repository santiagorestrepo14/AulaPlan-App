import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

function injectOfflinePrecache() {
  return {
    name: 'aulaplan-offline-precache',
    closeBundle() {
      const output = path.resolve('dist');
      const workerPath = path.join(output, 'sw.js');
      if (!fs.existsSync(workerPath)) return;
      const assets = ['./', ...walkFiles(output)
        .filter(file => path.basename(file) !== 'sw.js')
        .map(file => `./${path.relative(output, file).split(path.sep).join('/')}`)
        .sort()];
      const worker = fs.readFileSync(workerPath, 'utf8').replace(
        /\/\*__AULAPLAN_PRECACHE__\*\/\s*\[[\s\S]*?\];/,
        `/*__AULAPLAN_PRECACHE__*/ ${JSON.stringify(assets)};`,
      );
      fs.writeFileSync(workerPath, worker);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [injectOfflinePrecache()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
