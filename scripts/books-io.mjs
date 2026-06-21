// Shared read/write for books.json — a single serialization point so add-ids
// and enrich-books can't drift on field order or which optional keys persist.
import { readFile, writeFile } from 'node:fs/promises';

const url = new URL('../src/data/books.json', import.meta.url);

export async function readBooks() {
  return JSON.parse(await readFile(url, 'utf8'));
}

export async function writeBooks(books) {
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
}
