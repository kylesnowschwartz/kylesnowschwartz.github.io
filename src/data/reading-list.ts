/**
 * Reading List — data layer.
 *
 * Source of truth is `books.json` (CRUD-by-commit: edit the JSON, the Astro
 * content collection in `src/content.config.ts` validates it against the Zod
 * schema at build). This module re-exports it as a typed array for the pure
 * model + facet helpers, which run outside Astro (tests, build-time rendering).
 *
 * The genre/sub/blend/why tagging is editorial; `isbn`/`coverId` are populated
 * by `scripts/enrich-books.mjs` from the Open Library API.
 */
import booksData from './books.json';

export type GenreKey = 'SFF' | 'Thriller' | 'Horror' | 'Literary' | 'Nonfiction';
export type FacetKey = 'g' | 's' | 'b';

export interface Book {
  /** stable slug key (source of truth in books.json, used by the content loader) */
  id: string;
  /** title */
  t: string;
  /** author */
  a: string;
  /** primary genre (one shelf) */
  g: GenreKey;
  /** sub-genres */
  s: string[];
  /** cross-genre blends */
  b: string[];
  /** one-line rationale for the tagging */
  why: string;
  /** ISBN-13, resolved from Open Library (optional until enriched) */
  isbn?: string;
  /** Open Library cover id → https://covers.openlibrary.org/b/id/{coverId}-M.jpg */
  coverId?: number;
  /** first-publish year from Open Library (used for sorting) */
  year?: number;
  /** set by the enricher when Open Library genuinely has no ISBN for this title */
  noIsbn?: boolean;
}

export const GENRES: Record<GenreKey, string> = {
  SFF: 'Sci-Fi & Fantasy',
  Thriller: 'Thriller & Crime',
  Horror: 'Horror',
  Literary: 'Literary Fiction',
  Nonfiction: 'Nonfiction',
};

export interface FacetGroup {
  key: FacetKey;
  label: string;
  tip: string;
  /** fixed display order (genres); null = sort by frequency */
  order: GenreKey[] | null;
}

export const GROUPS: FacetGroup[] = [
  { key: 'g', label: 'Genre', tip: 'the primary shelf', order: ['SFF', 'Thriller', 'Horror', 'Literary', 'Nonfiction'] },
  { key: 's', label: 'Sub-genre', tip: 'what it really is', order: null },
  { key: 'b', label: 'Genre blend', tip: 'books that straddle two', order: null },
];

// books.json is the source of truth; the content collection validates it at
// build, so this cast is safe (the JSON's inferred literal types are narrower).
export const BOOKS: Book[] = booksData as unknown as Book[];

/** Build-time facet value counts for a group, used to render pill labels. */
export function facetCounts(key: FacetKey): Map<string, number> {
  const counts = new Map<string, number>();
  for (const bk of BOOKS) {
    const v = bk[key];
    const vals = Array.isArray(v) ? v : [v];
    for (const x of vals) counts.set(x as string, (counts.get(x as string) || 0) + 1);
  }
  return counts;
}

/** Ordered list of facet values for a group (genres by fixed order, others by frequency). */
export function facetValues(group: FacetGroup): string[] {
  const counts = facetCounts(group.key);
  if (group.order) return group.order.filter((k) => counts.has(k));
  return [...counts.keys()].sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b));
}
