/**
 * Reading List — filter model.
 *
 * Pure, DOM-free matching logic, shared between build-time rendering and the
 * client filter script. Keeping it free of the DOM makes the ANY/ALL semantics
 * unit-testable in isolation.
 *
 * Within a group, selected pills combine as OR ("any") or AND ("all").
 * Across groups, results always combine as AND.
 */
import type { Book, FacetKey, FacetGroup } from '../data/reading-list';

export type Mode = 'or' | 'and';

/** Selected pill values, per facet group. */
export interface ActiveState {
  g: Set<string>;
  s: Set<string>;
  b: Set<string>;
}

export function emptyActive(): ActiveState {
  return { g: new Set(), s: new Set(), b: new Set() };
}

export function activeCount(active: ActiveState): number {
  return active.g.size + active.s.size + active.b.size;
}

function bookMatchesGroup(bk: Book, active: ActiveState, key: FacetKey, mode: Mode): boolean {
  const sel = active[key];
  if (sel.size === 0) return true;
  const v = bk[key];
  const vals = Array.isArray(v) ? v : [v];
  if (mode === 'and') return [...sel].every((x) => vals.includes(x));
  return vals.some((x) => sel.has(x)); // OR
}

export function visible(bk: Book, active: ActiveState, groups: FacetGroup[], mode: Mode): boolean {
  return groups.every((grp) => bookMatchesGroup(bk, active, grp.key, mode));
}

export function countForMode(books: Book[], active: ActiveState, groups: FacetGroup[], mode: Mode): number {
  return books.reduce((n, bk) => n + (visible(bk, active, groups, mode) ? 1 : 0), 0);
}
