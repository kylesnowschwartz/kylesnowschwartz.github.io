// One-shot: give each book a stable slug `id` (required by Astro's file()
// loader, and a durable key for CRUD + ISBN matching). Idempotent.
import { readFile, writeFile } from 'node:fs/promises';

const url = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await readFile(url, 'utf8'));

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // drop "(Thrawn 1)" etc.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const seen = new Set();
for (const b of books) {
  if (!b.id) {
    let id = slug(b.t);
    let n = 2;
    while (seen.has(id)) id = `${slug(b.t)}-${n++}`;
    b.id = id;
  }
  seen.add(b.id);
}

// rewrite with id first, dropping undefined optional fields
const ordered = books.map((b) => ({
  id: b.id,
  t: b.t,
  a: b.a,
  g: b.g,
  s: b.s,
  b: b.b,
  why: b.why,
  ...(b.isbn ? { isbn: b.isbn } : {}),
  ...(b.coverId !== undefined ? { coverId: b.coverId } : {}),
  ...(b.year !== undefined ? { year: b.year } : {}),
  ...(b.noIsbn ? { noIsbn: true } : {}),
}));

await writeFile(url, JSON.stringify(ordered, null, 2) + '\n');
console.log(`stamped ids on ${ordered.length} books`);
