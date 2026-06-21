import { describe, it, expect } from 'vitest';
import { BOOKS, GROUPS } from '../data/reading-list';
import { emptyActive, activeCount, visible, countForMode, availableCounts } from './reading-list';

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
    // Some books carry both tags (e.g. The Blade Itself + the ASOIAF volumes),
    // so ALL is a non-empty strict subset of ANY. Assert the relationship, not
    // an exact count, so re-tagging the library doesn't break a semantics test.
    expect(and).toBeGreaterThan(0);
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

  describe('availableCounts — faceted pill narrowing', () => {
    it('with no filters, equals the static full-library counts per value', () => {
      const active = emptyActive();
      const s = availableCounts(BOOKS, active, GROUPS, 's', 'or');
      const epic = BOOKS.filter((b) => b.s.includes('Epic Fantasy')).length;
      expect(s.get('Epic Fantasy')).toBe(epic);
    });

    it('narrows a cross-group facet: a sub-genre absent from the picked genre drops to 0/undefined', () => {
      // Pick a genre, then any sub-genre that no book of that genre carries must
      // be unavailable — this is the "Nonfiction + Hard Magic" dead-end case.
      const active = { ...emptyActive(), g: sel('Nonfiction') };
      const s = availableCounts(BOOKS, active, GROUPS, 's', 'or');
      const nonfictionSubs = new Set(BOOKS.filter((b) => b.g === 'Nonfiction').flatMap((b) => b.s));
      for (const [val, n] of s) {
        expect(n).toBeGreaterThan(0);
        expect(nonfictionSubs.has(val)).toBe(true);
      }
      // A sub-genre that exists in the library but not under Nonfiction is gone.
      const orphan = [...new Set(BOOKS.flatMap((b) => b.s))].find((v) => !nonfictionSubs.has(v));
      if (orphan) expect(s.get(orphan)).toBeUndefined();
    });

    it('does not narrow within a group: sibling genres keep their full counts (they widen)', () => {
      // Selecting one genre must NOT shrink the other genre pills — same-group
      // pills combine as OR, so they stay clickable to widen the result.
      const active = { ...emptyActive(), g: sel('Nonfiction') };
      const g = availableCounts(BOOKS, active, GROUPS, 'g', 'or');
      const sff = BOOKS.filter((b) => b.g === 'SFF').length;
      expect(g.get('SFF')).toBe(sff);
    });
  });

  it('every book is enriched (has an isbn, or noIsbn after a failed lookup)', () => {
    // Mirrors the content-collection build gate: a bare book means someone
    // added a title and forgot to run `npm run enrich:books`.
    const bare = BOOKS.filter((b) => !b.isbn && b.noIsbn !== true).map((b) => b.t);
    expect(bare, `run \`npm run enrich:books\` for: ${bare.join(', ')}`).toEqual([]);
  });
});
