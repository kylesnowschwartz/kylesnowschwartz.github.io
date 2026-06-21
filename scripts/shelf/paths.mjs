// Repo-relative paths for the shelf CLI. One place so commands can't drift on
// where data and the embedding cache live.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url)); // scripts/shelf
export const ROOT = join(here, '..', '..'); // repo root
export const DATA = join(ROOT, 'src', 'data');
export const BOOKS_JSON = join(DATA, 'books.json');
export const CANDIDATES_JSON = join(DATA, 'candidates.json');
export const RECOMMENDATIONS_JSON = join(DATA, 'recommendations.json');
export const CACHE = join(ROOT, '.cache');
export const EMBED_CACHE = join(CACHE, 'embeddings');
