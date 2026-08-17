#!/usr/bin/env node
// Render the /cv page to PDF via Playwright (pinned Chromium).
// Builds the site, serves dist/ in-process on a free loopback port,
// waits for network idle + web fonts, prints with CSS page size.
// Usage: node scripts/render-cv-pdf.mjs [output.pdf]
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] ?? join(process.env.HOME, 'Documents/CVs and Cover Letters', 'KyleSchwartz_CV.pdf'));

execSync('npx astro build', { cwd: repo, stdio: 'inherit' });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    let path = join(repo, 'dist', decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/cv/`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
} finally {
  await browser.close();
  server.close();
}
console.log(`PDF written to: ${out}`);
