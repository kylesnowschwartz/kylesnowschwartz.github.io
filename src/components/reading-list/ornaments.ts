/**
 * Ornament bands for the reading list — the "reserved band" under a red-figure
 * vase painting. One pattern per genre, plus the meander used for rules.
 *
 * Each tile is a hand-drawn 14px-tall SVG used as a CSS mask, so the colour
 * comes from the page tokens (background-color shows through the strokes) and
 * the lines sit on whole/half pixels to stay crisp at 1x and 2x.
 */
import type { GenreKey } from '../../data/reading-list';

const RAILS = '<path d="M0 0.5H{w}M0 13.5H{w}"/>';

function tile(w: number, body: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="14" viewBox="0 0 ${w} 14" ` +
    `fill="none" stroke="black" stroke-width="1">${RAILS.replaceAll('{w}', String(w))}${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Genre key → ornament pattern (a CSS url() value). */
export const ORNAMENTS: Record<GenreKey | 'meander', string> = {
  // Greek key: a squared spiral rising from the bottom rail — the labyrinth.
  SFF: tile(13, '<path d="M10.5 13.5V3.5H2.5V10.5H7.5V6.5H5.5V8.5"/>'),
  // Zigzag / chevron.
  Thriller: tile(8, '<path d="M0 11L4 3L8 11" stroke-linejoin="miter"/>'),
  // Running wave (Vitruvian scroll): crest curling back into a spiral.
  Horror: tile(
    16,
    '<path d="M0 11.5C4 11.5 6 3.5 10.5 3.5C13.5 3.5 14 8.5 11.5 8.5C10 8.5 9.8 6.3 11.5 6.3"/>' +
      '<path d="M13.4 7.6C14 10 14.8 11.5 16 11.5"/>',
  ),
  // Egg-and-dart.
  Literary: tile(
    10,
    '<ellipse cx="3.5" cy="7" rx="2.5" ry="3.6"/><path d="M8.5 3V11.5M7.3 9.4L8.5 11.5L9.7 9.4"/>',
  ),
  // Dentils: the square tooth course under a cornice.
  Nonfiction: tile(6, '<rect x="1" y="4" width="3" height="7" fill="black" stroke="none"/>'),
  // Plain meander for rules (same key, no genre meaning).
  meander: tile(13, '<path d="M10.5 13.5V3.5H2.5V10.5H7.5V6.5H5.5V8.5"/>'),
};

/** Inline style declaring every pattern as a custom property on the page root. */
export const ornamentVars: string = Object.entries(ORNAMENTS)
  .map(([k, v]) => `--orn-${k.toLowerCase()}: ${v}`)
  .join('; ');
