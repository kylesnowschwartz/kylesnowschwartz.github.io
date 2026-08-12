/**
 * League data entry point for the worst-commish-ever pages.
 *
 * The seasons, standings, and manager histories are derived - see
 * wce-seasons.generated.ts. Everything hand-authored lives below.
 */

export type { SeasonData, Team, Hero } from './wce-seasons.generated.ts';
export { CURRENT_YEAR, LEAGUE_DATA, TEAMS, HEROES } from './wce-seasons.generated.ts';

import { LEAGUE_DATA, HEROES } from './wce-seasons.generated.ts';
import type { Hero } from './wce-seasons.generated.ts';

// Hero popup configuration
export const HERO_POPUPS: Record<string, { src: string; title: string }> = {
  'Gary': { src: '/worst-commish-ever/images/Gary-Claude-Van-Damme.jpg', title: 'gary.jpg' }
};

// Helper to get sorted league years (newest first)
export const getLeagueYears = (): number[] => {
  return Object.keys(LEAGUE_DATA)
    .map(Number)
    .sort((a, b) => b - a);
};

// Helper to get heroes sorted by seasons
export const getHeroesSorted = (): [string, Hero][] => {
  return Object.entries(HEROES)
    .sort((a, b) => b[1].seasons - a[1].seasons);
};
