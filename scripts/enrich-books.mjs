// Enrich books.json with ISBN-13, Open Library cover id, and first-publish year
// from the free, keyless Open Library search API. Idempotent (skips books that
// are already fully enriched) and polite (throttled). Run: `npm run enrich:books`.
import { readFile, writeFile } from 'node:fs/promises';

const url = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await readFile(url, 'utf8'));

const THROTTLE_MS = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// strip "(Thrawn 1)"-style qualifiers and take the primary author for matching
const cleanTitle = (t) => t.replace(/\([^)]*\)/g, '').trim();
const primaryAuthor = (a) => a.split(/ & |, /)[0].trim();

const pickIsbn = (isbns) => {
  if (!Array.isArray(isbns) || isbns.length === 0) return undefined;
  return isbns.find((x) => x.replace(/[^0-9Xx]/g, '').length === 13) || isbns[0];
};

// Open Library's first_publish_year is crowd-sourced and frequently wrong:
// `1900` is a common junk-import placeholder, and mis-clustered editions yield
// impossible years. Accept only plausible values; leave the rest blank so they
// can be hand-filled rather than silently wrong. (Subtly-wrong-but-plausible
// years, e.g. a wrong-work match, still need manual correction.)
const thisYear = new Date().getFullYear();
const plausibleYear = (y) => typeof y === 'number' && y >= 1800 && y <= thisYear + 1 && y !== 1900;

async function lookup(book) {
  const params = new URLSearchParams({
    title: cleanTitle(book.t),
    author: primaryAuthor(book.a),
    fields: 'title,author_name,isbn,cover_i,first_publish_year',
    limit: '1',
  });
  const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
    headers: { 'User-Agent': 'kylesnowschwartz.com reading-list enricher' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const doc = data.docs?.[0];
  if (!doc) return null;
  return { isbn: pickIsbn(doc.isbn), coverId: doc.cover_i, year: doc.first_publish_year };
}

for (const book of books) {
  // fully enriched = ISBN resolved (or known-missing) AND a publish year known
  if ((book.isbn || book.noIsbn) && book.year !== undefined) continue;
  try {
    const hit = await lookup(book);
    if (!hit) {
      if (!book.isbn) book.noIsbn = true;
    } else {
      if (plausibleYear(hit.year)) book.year = hit.year;
      else if (hit.year !== undefined) console.log(`    (ignored implausible year ${hit.year} for ${book.t})`);
      if (hit.coverId) book.coverId = hit.coverId;
      if (hit.isbn) {
        book.isbn = hit.isbn;
        delete book.noIsbn;
      } else if (!book.isbn) {
        book.noIsbn = true;
      }
    }
    const tag = book.isbn ? `→ ${book.isbn}` : '— no ISBN';
    console.log(`  ${book.isbn ? '✓' : '✗'} ${book.t} ${tag}${book.year ? ` (${book.year})` : ''}`);
  } catch (err) {
    console.log(`  ! ${book.t} — ${err.message}`);
  }
  await sleep(THROTTLE_MS);
}

// preserve id-first key order
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

const resolved = books.filter((b) => b.isbn).length;
const noIsbn = books.filter((b) => !b.isbn).map((b) => b.t);
const noYear = books.filter((b) => b.year === undefined).map((b) => b.t);
console.log(`\nISBN resolved ${resolved}/${books.length}; years missing: ${noYear.length}`);
if (noIsbn.length) console.log('No ISBN:\n' + noIsbn.map((t) => `  - ${t}`).join('\n'));
