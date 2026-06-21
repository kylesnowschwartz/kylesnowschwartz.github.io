import { describe, it, expect } from 'vitest';
import { BOOKS, GROUPS } from '../data/reading-list';
import { emptyActive, activeCount, visible, countForMode } from './reading-list';

/**
 * These tests pin down the ANY (or) vs ALL (and) semantics that drive the
 * mode toggle, and document WHEN the two modes can differ:
 *   - they can only differ when 2+ pills are selected in the SAME group, and
 *   - only on a multi-valued facet (sub-genre/blend), since a book has exactly
 *     one primary genre.
 */
describe('reading-list filter model', () => {
  const sel = (...vals: string[]) => new Set(vals);

  it('shows every book with no filters active', () => {
    const active = emptyActive();
    expect(countForMode(BOOKS, active, GROUPS, 'or')).toBe(BOOKS.length);
    expect(countForMode(BOOKS, active, GROUPS, 'and')).toBe(BOOKS.length);
  });

  it('a single selected pill yields identical ANY and ALL counts', () => {
    const active = { ...emptyActive(), s: sel('Grimdark') };
    const or = countForMode(BOOKS, active, GROUPS, 'or');
    const and = countForMode(BOOKS, active, GROUPS, 'and');
    expect(or).toBe(and);
    expect(or).toBeGreaterThan(0);
  });

  it('two genres under ALL is always 0 (a book has exactly one genre)', () => {
    const active = { ...emptyActive(), g: sel('SFF', 'Thriller') };
    expect(countForMode(BOOKS, active, GROUPS, 'and')).toBe(0);
    // ANY = union of both shelves, comfortably non-zero
    expect(countForMode(BOOKS, active, GROUPS, 'or')).toBeGreaterThan(0);
  });

  it('two co-occurring sub-genres: ALL is non-zero and strictly smaller than ANY', () => {
    const active = { ...emptyActive(), s: sel('Epic Fantasy', 'Grimdark') };
    const or = countForMode(BOOKS, active, GROUPS, 'or');
    const and = countForMode(BOOKS, active, GROUPS, 'and');
    // The 6 books tagged BOTH: The Blade Itself + the 5 ASOIAF volumes.
    expect(and).toBe(6);
    expect(or).toBeGreaterThan(and);
  });

  it('two sub-genres that never co-occur: ALL is 0 while ANY is not', () => {
    const active = { ...emptyActive(), s: sel('Cyberpunk', 'Spy Thriller') };
    expect(countForMode(BOOKS, active, GROUPS, 'and')).toBe(0);
    expect(countForMode(BOOKS, active, GROUPS, 'or')).toBeGreaterThan(0);
  });

  it('across groups, selections always combine as AND regardless of mode', () => {
    // Genre=SFF AND sub-genre=Cyberpunk → only the cyberpunk SFF titles.
    const active = { ...emptyActive(), g: sel('SFF'), s: sel('Cyberpunk') };
    const expected = BOOKS.filter((b) => b.g === 'SFF' && b.s.includes('Cyberpunk')).length;
    expect(countForMode(BOOKS, active, GROUPS, 'or')).toBe(expected);
    expect(countForMode(BOOKS, active, GROUPS, 'and')).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it('visible() agrees with countForMode() for a representative selection', () => {
    const active = { ...emptyActive(), s: sel('Epic Fantasy', 'Grimdark') };
    const manual = BOOKS.filter((b) => visible(b, active, GROUPS, 'and')).length;
    expect(manual).toBe(countForMode(BOOKS, active, GROUPS, 'and'));
  });

  it('activeCount reflects total selected pills across groups', () => {
    const active = { g: sel('SFF'), s: sel('Cyberpunk', 'Grimdark'), b: sel() };
    expect(activeCount(active)).toBe(3);
  });

  it('toggle visibility rule: hidden when ANY and ALL agree, shown when they differ', () => {
    // A single genre → ANY and ALL identical → the toggle must hide.
    const single = { ...emptyActive(), g: sel('SFF') };
    expect(countForMode(BOOKS, single, GROUPS, 'or')).toBe(countForMode(BOOKS, single, GROUPS, 'and'));
    // Two co-occurring sub-genres → counts differ → the toggle must show.
    const twoSubs = { ...emptyActive(), s: sel('Epic Fantasy', 'Grimdark') };
    expect(countForMode(BOOKS, twoSubs, GROUPS, 'or')).not.toBe(countForMode(BOOKS, twoSubs, GROUPS, 'and'));
  });

  it('every book is enriched (has an isbn, or noIsbn after a failed lookup)', () => {
    // Mirrors the content-collection build gate: a bare book means someone
    // added a title and forgot to run `npm run enrich:books`.
    const bare = BOOKS.filter((b) => !b.isbn && b.noIsbn !== true).map((b) => b.t);
    expect(bare, `run \`npm run enrich:books\` for: ${bare.join(', ')}`).toEqual([]);
  });
});
