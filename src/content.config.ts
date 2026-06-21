import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/**
 * Astro content collection over the reading-list data. This is the native
 * "database" layer: `books.json` is the source of truth, validated against this
 * schema at build time. CRUD-by-commit — edit the JSON, the build fails loudly
 * if a genre is misspelled or a required field is missing.
 *
 * `id` is consumed by the file() loader as each entry's key, so it is not part
 * of the validated `data` schema below.
 */
const books = defineCollection({
  loader: file('src/data/books.json'),
  schema: z
    .object({
      t: z.string(),
      a: z.string(),
      g: z.enum(['SFF', 'Thriller', 'Horror', 'Literary', 'Nonfiction']),
      s: z.array(z.string()),
      b: z.array(z.string()),
      why: z.string(),
      isbn: z.string().min(1).optional(),
      coverId: z.number().optional(),
      year: z.number().optional(),
      noIsbn: z.boolean().optional(),
    })
    // Build gate: a new book must be enriched. Either it resolved to an `isbn`,
    // or the enricher marked `noIsbn: true` (attempted, none exists). A bare
    // entry means we forgot — fail loudly with the fix.
    .refine((d) => d.isbn != null || d.noIsbn === true, {
      message: 'book is missing an ISBN — run `npm run enrich:books`',
    }),
});

/**
 * Recommendation artifact, produced by `npm run shelf -- build` from the read
 * shelf + the fetched candidate pool. Committed so the future website UI can
 * read it with zero rework; validated here so a malformed build fails loudly.
 * `genre` is INFERRED (nearest read-shelf centroid), not the publisher's label.
 */
const recommendations = defineCollection({
  loader: file('src/data/recommendations.json'),
  schema: z.object({
    t: z.string(),
    a: z.string(),
    year: z.number().optional(),
    pages: z.number().optional(),
    isbn: z.string().optional(),
    genre: z.enum(['SFF', 'Thriller', 'Horror', 'Literary', 'Nonfiction']),
    baseScore: z.number(), // cosine to nearest taste centroid, [0,1]
    nearestReadId: z.string(),
    nearestReadTitle: z.string(),
    darkness: z.number().min(0).max(1), // mood axis: 0 comforting → 1 dark
    novelty: z.number().min(0).max(1), // 0 familiar → 1 far from the shelf
    subjects: z.array(z.string()),
  }),
});

export const collections = { books, recommendations };
