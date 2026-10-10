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
 * Weekly Menu recipes. Enums mirror the types in `src/lib/menu.ts`, so a
 * misspelled aisle or unit fails the build instead of dropping off the
 * shopping list.
 */
const menuIngredient = z
  .object({
    text: z.string().min(1),
    item: z.string().min(1),
    qty: z.number().positive().nullable(),
    unit: z.enum(['g', 'ml', 'whole', 'tbsp', 'tsp', 'slices', 'tin']).nullable(),
    aisle: z.enum(['fridge', 'meat-fish', 'veg', 'fruit-frozen', 'nuts-seeds', 'pantry']),
    staple: z.boolean(),
  })
  .refine((i) => (i.qty === null) === (i.unit === null), {
    message: 'qty and unit must both be set, or both null for a vague amount',
  });

const menuRecipes = defineCollection({
  loader: file('src/data/menu-recipes.json'),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
    name: z.string().min(1),
    meal: z.enum(['breakfast', 'lunch', 'dinner', 'dessert', 'extra']),
    tags: z.array(z.string()),
    netCarbsG: z.number().nonnegative(),
    serves: z.number().int().positive(),
    ingredients: z.array(menuIngredient).min(1),
    method: z.array(z.string().min(1)).min(1),
    tip: z.string().optional(),
  }),
});

export const collections = { books, menuRecipes };
