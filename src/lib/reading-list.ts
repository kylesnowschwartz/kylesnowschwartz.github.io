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

export function bookMatchesGroup(bk: Book, active: ActiveState, key: FacetKey, mode: Mode): boolean {
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

/**
 * Faceted availability: for each value in `group`, how many books carry it
 * among those already matching every OTHER group's active filters. Excluding
 * the value's own group is what keeps the two filter rules intact — within a
 * group, pills widen (a sibling pill never zeroes out its neighbours), so its
 * own selection is dropped; across groups, pills narrow, so those constraints
 * stay. A value the client should hide (e.g. "Hard Magic" once "Nonfiction" is
 * picked) lands here as 0.
 */
export function availableCounts(
  books: Book[],
  active: ActiveState,
  groups: FacetGroup[],
  group: FacetKey,
  mode: Mode,
): Map<string, number> {
  const others = groups.filter((g) => g.key !== group);
  const counts = new Map<string, number>();
  for (const bk of books) {
    if (!others.every((g) => bookMatchesGroup(bk, active, g.key, mode))) continue;
    const v = bk[group];
    const vals = Array.isArray(v) ? v : [v];
    for (const x of vals) counts.set(x as string, (counts.get(x as string) || 0) + 1);
  }
  return counts;
}
