// Tests for the zlib source backend. Pure functions (toCandidate, parseSize,
// parseSourceId, etc.) are exercised directly. The spawn-based functions
// (search, download) are exercised against a real fake binary written to a
// temp dir — more honest than mocking child_process, and the same shape we
// use for end-to-end sanity checks.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, chmodSync, statSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  search,
  download,
  toCandidate,
  parseYear,
  parseSize,
  parseRating,
  parseSourceId,
  extractFormat,
  resolveBinary,
  bookIdFromUrl,
  SourceError,
  SOURCE_NAME,
} from './zlib.mjs';

// ─── pure helpers ─────────────────────────────────────────────────────────

describe('toCandidate', () => {
  it('translates a typical zlib Book into a generic Candidate', () => {
    const book = {
      id: '19179031', // numeric attribute id (NOT the one to pass to download)
      url: 'https://z-lib.sk/book/r9bkkbjyzB/dune.html', // path-segment id is what counts
      name: 'Dune',
      authors: ['Frank Herbert'],
      year: '1965',
      extension: 'EPUB',
      size: '1 MB',
      language: 'english',
      rating: '5/5',
      publisher: 'Ace',
      isbn: '9780441172719',
      quality: '4.5',
      cover: 'https://covers.z-lib.sk/x.jpg',
    };
    expect(toCandidate(book)).toEqual({
      sourceId: 'zlib:r9bkkbjyzB',
      title: 'Dune',
      authors: ['Frank Herbert'],
      year: 1965,
      format: 'epub',
      sizeBytes: 1024 * 1024,
      sizeText: '1 MB',
      language: 'english',
      rating: 5,
      publisher: 'Ace',
      isbn: '9780441172719',
      quality: 4.5,
      cover: 'https://covers.z-lib.sk/x.jpg',
    });
  });

  it('tolerates a sparse Book (missing optional fields)', () => {
    const book = { id: 'x', name: 'Unknown' };
    const c = toCandidate(book);
    expect(c.sourceId).toBe('zlib:x');
    expect(c.title).toBe('Unknown');
    expect(c.authors).toEqual([]);
    expect(c.year).toBeNull();
    expect(c.format).toBeNull();
    expect(c.sizeBytes).toBeNull();
    expect(c.language).toBeNull();
    expect(c.rating).toBeNull();
    expect(c.isbn).toBeNull();
    expect(c.quality).toBeNull();
    expect(c.cover).toBeNull();
  });
});

describe('parseYear', () => {
  it('handles real, empty, "0", and non-numeric inputs', () => {
    expect(parseYear('1965')).toBe(1965);
    expect(parseYear('')).toBeNull();
    expect(parseYear('0')).toBeNull();
    expect(parseYear(null)).toBeNull();
    expect(parseYear('forthcoming')).toBeNull();
  });
});

describe('parseSize', () => {
  it('parses common zlib size strings', () => {
    expect(parseSize('1 MB')).toBe(1024 * 1024);
    expect(parseSize('850 KB')).toBe(850 * 1024);
    expect(parseSize('1.5 MB')).toBe(Math.round(1.5 * 1024 * 1024));
    expect(parseSize('12mb')).toBe(12 * 1024 * 1024);
    expect(parseSize('2 GB')).toBe(2 * 1024 ** 3);
  });
  it('returns null for unparseable strings', () => {
    expect(parseSize('')).toBeNull();
    expect(parseSize('huge')).toBeNull();
    expect(parseSize(undefined)).toBeNull();
    expect(parseSize('1 PB')).toBeNull(); // petabyte unit unknown
  });
});

describe('parseRating', () => {
  it('takes the integer or decimal part before the slash', () => {
    expect(parseRating('5/5')).toBe(5);
    expect(parseRating('4.5/5')).toBe(4.5);
    expect(parseRating('-')).toBeNull();
    expect(parseRating('')).toBeNull();
  });
});

describe('parseSourceId', () => {
  it('round-trips zlib:ID', () => {
    expect(parseSourceId('zlib:abc123')).toBe('abc123');
  });
  it('rejects wrong namespace or empty id', () => {
    expect(() => parseSourceId('other:abc123')).toThrow(SourceError);
    expect(() => parseSourceId('zlib:')).toThrow(SourceError);
    expect(() => parseSourceId('')).toThrow(SourceError);
    expect(() => parseSourceId(null as unknown as string)).toThrow(SourceError);
  });
});

describe('extractFormat', () => {
  it('picks the extension off the path', () => {
    expect(extractFormat('/some/dir/dune.epub')).toBe('epub');
    expect(extractFormat('weird.NAME.AZW3')).toBe('azw3');
    expect(extractFormat('no-extension')).toBeNull();
  });
});

describe('resolveBinary', () => {
  it('honors the env override above everything', () => {
    expect(resolveBinary({ env: { SHELF_RETRIEVE_BIN: '/custom/bin' }, home: '/nope' })).toBe('/custom/bin');
  });
  it('falls back to "zlib" on PATH when nothing else applies', () => {
    expect(resolveBinary({ env: {}, home: '/tmp/no-such-home' })).toBe('zlib');
  });
});

// ─── spawn-based: search / download with a real fake binary ──────────────

/**
 * Write a Node-based fake binary to disk that emulates the `--json` contract
 * of our forked zlib CLI. It dispatches on argv[2] (the subcommand) and emits
 * canned output we can assert against.
 */
function writeFakeBinary(dir: string, name: string, body: string) {
  const path = join(dir, name);
  writeFileSync(path, `#!/usr/bin/env node\n${body}`, 'utf8');
  chmodSync(path, 0o755);
  return path;
}

const SEARCH_FAKE = `
const sub = process.argv[2];
const argv = process.argv.slice(3);
if (sub === 'search') {
  // Echo the query back as a single book so we can assert wiring works.
  const query = argv[0];
  const exts = [];
  for (let i = 1; i < argv.length - 1; i++) {
    if (argv[i] === '--ext') exts.push(argv[i + 1]);
  }
  if (process.env.FAKE_EMPTY === '1') {
    console.log(JSON.stringify({ books: [], page: 1, total_pages: 0 }));
    process.exit(0);
  }
  if (process.env.FAKE_AUTH === '1') {
    process.stderr.write('Not logged in. Run: zlib login\\n');
    process.exit(1);
  }
  const ext = exts[0] ? exts[0].toUpperCase() : 'EPUB';
  console.log(JSON.stringify({
    books: [
      { id: 'fake-1', name: query, authors: ['Test Author'], year: '2020',
        extension: ext, size: '1 MB', language: 'english', rating: '5/5' },
    ],
    page: 1, total_pages: 1,
  }));
  process.exit(0);
}
if (sub === 'download') {
  const id = argv[0];
  const dirIdx = argv.indexOf('--dir');
  const dir = dirIdx >= 0 ? argv[dirIdx + 1] : '.';
  const path = dir + '/' + id + '.epub';
  console.log(JSON.stringify({ id, name: 'Test Book', path, size: 1234567 }));
  process.exit(0);
}
process.stderr.write('unknown subcommand: ' + sub + '\\n');
process.exit(2);
`;

let tmpRoot: string;
let fakeBin: string;

beforeAll(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), 'shelf-retrieve-test-'));
  fakeBin = writeFakeBinary(tmpRoot, 'zlib-fake', SEARCH_FAKE);
});

afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

describe('search (spawn-based)', () => {
  it('queries by ISBN when set and returns one Candidate', async () => {
    const res = await search({ isbn: '9780441172719', bin: fakeBin });
    expect(res.candidates).toHaveLength(1);
    // The fake echoes the query back as the book name → assert we built it right.
    expect(res.candidates[0].title).toBe('9780441172719');
    expect(res.candidates[0].sourceId).toBe('zlib:fake-1');
    expect(res.candidates[0].format).toBe('epub');
    expect(res.candidates[0].sizeBytes).toBe(1024 * 1024);
  });

  it('falls back to title + author concatenation when ISBN absent', async () => {
    const res = await search({ title: 'Dune', author: 'Frank Herbert', bin: fakeBin });
    expect(res.candidates[0].title).toBe('Dune Frank Herbert');
  });

  it('passes --ext through to the binary', async () => {
    const res = await search({ isbn: 'x', extensions: ['azw3'], bin: fakeBin });
    expect(res.candidates[0].format).toBe('azw3');
  });

  it('rejects calls with neither isbn nor title+author', async () => {
    await expect(search({ bin: fakeBin })).rejects.toThrow(SourceError);
    await expect(search({ title: 'Dune', bin: fakeBin })).rejects.toThrow(SourceError); // author missing
  });

  it('classifies a "not logged in" stderr as SOURCE_AUTH_REQUIRED', async () => {
    await expect(
      search({ isbn: 'x', bin: fakeBin, env: { ...process.env, FAKE_AUTH: '1' } }),
    ).rejects.toMatchObject({ code: 'SOURCE_AUTH_REQUIRED' });
  });

  it('handles an empty result set cleanly', async () => {
    const res = await search({ isbn: 'x', bin: fakeBin, env: { ...process.env, FAKE_EMPTY: '1' } });
    expect(res.candidates).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('returns SOURCE_BIN_MISSING when the binary path does not exist', async () => {
    await expect(
      search({ isbn: 'x', bin: '/nope/zlib-does-not-exist' }),
    ).rejects.toMatchObject({ code: 'SOURCE_BIN_MISSING' });
  });
});

describe('download (spawn-based)', () => {
  it('writes a file via the fake binary and returns its absolute path + size', async () => {
    const dest = mkdtempSync(join(tmpdir(), 'shelf-deliver-test-'));
    try {
      const res = await download({ sourceId: 'zlib:fake-1', destDir: dest, bin: fakeBin });
      expect(res.path).toBe(`${dest}/fake-1.epub`);
      expect(res.sizeBytes).toBe(1234567);
      expect(res.format).toBe('epub');
      // `name` from the binary lets --source-id callers derive a delivery
      // title without having gone through search first.
      expect(res.name).toBe('Test Book');
    } finally {
      rmSync(dest, { recursive: true, force: true });
    }
  });

  it('rejects an empty or wrong-namespace sourceId before spawning', async () => {
    await expect(download({ sourceId: '', destDir: '/tmp', bin: fakeBin })).rejects.toThrow(SourceError);
    await expect(download({ sourceId: 'other:x', destDir: '/tmp', bin: fakeBin })).rejects.toThrow(SourceError);
  });
});

describe('SOURCE_NAME', () => {
  it('is stable — orchestrator routes on this string', () => {
    expect(SOURCE_NAME).toBe('zlib');
  });
});

describe('bookIdFromUrl', () => {
  it("extracts the URL path-segment id, NOT the numeric Book.id attribute", () => {
    expect(bookIdFromUrl('https://z-lib.sk/book/r9bkkbjyzB/hatchet.html')).toBe('r9bkkbjyzB');
  });
  it('returns null on malformed input', () => {
    expect(bookIdFromUrl('not-a-url')).toBeNull();
    expect(bookIdFromUrl(null as unknown as string)).toBeNull();
    expect(bookIdFromUrl('https://z-lib.sk/some-other-path')).toBeNull();
  });
});
