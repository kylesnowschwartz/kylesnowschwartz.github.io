import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { LEAGUE_DATA, TEAMS, HEROES } from './wce-data.ts';

const rawSeason = (year: number) =>
  JSON.parse(readFileSync(`public/worst-commish-ever/data/${year}/season.json`, 'utf8'));

/**
 * Yahoo is the source for everything in wce-seasons.generated.ts, and Yahoo gets
 * some of it wrong. These tests pin the places where the site deliberately
 * disagrees with Yahoo, so regenerating from a fresh extract cannot quietly
 * revert them.
 */
describe('deliberate disagreements with Yahoo', () => {
  it('credits Ben Walker with the 2006 championship, not the team Yahoo ranks first', () => {
    const yahooFirst = rawSeason(2006).standings.find((t: { rank: number }) => t.rank === 1);
    expect(yahooFirst.team_name).toBe('Beantown Ballers');

    expect(LEAGUE_DATA[2006].champion).toBe('Team Weak');
    expect(LEAGUE_DATA[2006].championMgr).toBe('Ben Walker');
    expect(LEAGUE_DATA[2006].note).toBeTruthy();
  });

  it('keeps the 2006 record Yahoo does have, since only the ranking is wrong', () => {
    const teamWeak = rawSeason(2006).standings.find(
      (t: { team_name: string }) => t.team_name === 'Team Weak'
    );
    expect(`${teamWeak.wins}-${teamWeak.losses}`).toBe('8-6');
    expect(LEAGUE_DATA[2006].record).toBe('8-6');
  });

  it('splits the two managers Yahoo reports under the single nickname "Ben"', () => {
    const bens = new Set(
      Object.values(LEAGUE_DATA)
        .flatMap((s) => [s.championMgr, s.lastPlaceMgr])
        .concat(TEAMS.map((t) => t.manager))
        .filter((name) => name.startsWith('Ben'))
    );
    expect(bens).toEqual(new Set(['Ben Knopf', 'Ben Walker']));

    expect(HEROES['Ben Knopf'].teamNames).toEqual(["Ben's Bold Team"]);
    expect(HEROES['Ben Walker'].teamNames).toEqual(['Team Weak', 'The Violets']);
  });

  it('resolves every nickname a manager has used to one person', () => {
    expect(HEROES['Conway'].apiNames).toEqual(['BC', 'Bryan']);
    const names = Object.values(LEAGUE_DATA)
      .flatMap((s) => [s.championMgr, s.lastPlaceMgr])
      .concat(TEAMS.map((t) => t.manager));
    expect(names).not.toContain('BC');
    expect(names).not.toContain('Bryan');
    expect(names).not.toContain('Ben');
  });

  it('gives no manager card to the teams whose owner Yahoo hides', () => {
    expect(LEAGUE_DATA[2010].lastPlaceMgr).toBe('Unknown');
    expect(HEROES['Unknown']).toBeUndefined();
    expect(HEROES['--hidden--']).toBeUndefined();
  });
});

describe('generated file', () => {
  it('is in sync with the raw extracts and the corrections', () => {
    expect(() =>
      execFileSync('node', ['scripts/wce/generate-wce-data.mjs', '--check'], { stdio: 'pipe' })
    ).not.toThrow();
  });
});
