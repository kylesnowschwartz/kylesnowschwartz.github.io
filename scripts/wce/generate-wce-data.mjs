#!/usr/bin/env node
/**
 * Generates src/data/wce-seasons.generated.ts from the committed Yahoo extracts
 * plus src/data/wce-corrections.json.
 *
 * Usage:
 *   node scripts/wce/generate-wce-data.mjs           # write the file
 *   node scripts/wce/generate-wce-data.mjs --check   # exit 1 if the file is stale
 *
 * Yahoo's `rank` field is the playoff finish, not the regular-season standing, so
 * rank 1 is the champion even when another team has a better win-loss record.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SEASONS_DIR = join(REPO_ROOT, "public/worst-commish-ever/data");
const CORRECTIONS_FILE = join(REPO_ROOT, "src/data/wce-corrections.json");
const OUTPUT_FILE = join(REPO_ROOT, "src/data/wce-seasons.generated.ts");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** Season extracts that actually have standings, keyed by year. */
function loadSeasons() {
  const seasons = new Map();
  for (const entry of readdirSync(SEASONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d{4}$/.test(entry.name)) continue;
    const file = join(SEASONS_DIR, entry.name, "season.json");
    if (!existsSync(file)) continue;
    const season = readJson(file);
    if (!season.standings?.length) continue;
    seasons.set(Number(entry.name), {
      ...season,
      standings: [...season.standings].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    });
  }
  return seasons;
}

/**
 * Resolves a Yahoo nickname to a person. A nickname shared by two people is
 * disambiguated by team, which is the only signal Yahoo leaves behind.
 */
function makeIdentityResolver(identities) {
  return (nickname, teamName) => {
    const scoped = identities.find(
      (i) => i.yahooNickname === nickname && i.teams?.includes(teamName)
    );
    const unscoped = identities.find((i) => i.yahooNickname === nickname && !i.teams);
    const match = scoped ?? unscoped;
    if (!match) return { person: nickname, listAsManager: true };
    return { person: match.person, listAsManager: match.listAsManager !== false };
  };
}

function buildLeagueData(seasons, corrections, resolvePerson) {
  const years = [...seasons.keys()];
  const firstYear = Math.min(corrections.firstSeason, ...years);
  const lastYear = Math.max(...years);

  const rows = [];
  for (let year = firstYear; year <= lastYear; year++) {
    const season = seasons.get(year);
    if (!season) {
      rows.push({ year, missing: true });
      continue;
    }
    const override = corrections.seasons?.[String(year)];
    const standings = season.standings;
    const champion = override?.champion
      ? standings.find((t) => t.team_name === override.champion)
      : standings[0];
    if (!champion) {
      throw new Error(
        `${year}: corrections name "${override.champion}" as champion, but no such team is in the standings.`
      );
    }
    const lastPlace = standings[standings.length - 1];
    rows.push({
      year,
      champion: champion.team_name,
      championMgr: resolvePerson(champion.manager, champion.team_name).person,
      record: `${champion.wins}-${champion.losses}`,
      lastPlace: lastPlace.team_name,
      lastPlaceMgr: resolvePerson(lastPlace.manager, lastPlace.team_name).person,
      note: override?.note
    });
  }
  return rows;
}

function buildTeams(seasons, currentYear, resolvePerson) {
  return seasons.get(currentYear).standings.map((t) => ({
    name: t.team_name,
    manager: resolvePerson(t.manager, t.team_name).person,
    wins: t.wins,
    losses: t.losses
  }));
}

/**
 * Yahoo lets a manager retype their team name between seasons, so the same team
 * shows up as both "Mean Green Machine" and "MeanGreenMachine". Names that match
 * once case and punctuation are dropped are one team, keeping the first spelling.
 */
const teamNameKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

function buildHeroes(seasons, currentYear, resolvePerson) {
  const people = new Map();
  const mergedSpellings = [];
  for (const year of [...seasons.keys()].sort((a, b) => a - b)) {
    for (const team of seasons.get(year).standings) {
      const { person, listAsManager } = resolvePerson(team.manager, team.team_name);
      if (!listAsManager) continue;
      if (!people.has(person)) {
        people.set(person, {
          teamNames: new Map(),
          nicknames: new Set(),
          years: new Set()
        });
      }
      const hero = people.get(person);
      hero.years.add(year);
      hero.nicknames.add(team.manager);

      const key = teamNameKey(team.team_name);
      const known = hero.teamNames.get(key);
      if (known === undefined) {
        hero.teamNames.set(key, team.team_name);
      } else if (known !== team.team_name) {
        mergedSpellings.push(`${person}: "${team.team_name}" (${year}) -> "${known}"`);
      }
    }
  }

  for (const merge of mergedSpellings) console.log(`  merged respelled team ${merge}`);

  return [...people.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([person, hero]) => {
      const years = [...hero.years].sort((a, b) => a - b);
      const lastYear = years[years.length - 1];
      const nicknames = [...hero.nicknames].sort();
      return {
        person,
        years: `${years[0]}-${lastYear}`,
        teamNames: [...hero.teamNames.values()],
        seasons: years.length,
        apiNames: nicknames.length === 1 && nicknames[0] === person ? undefined : nicknames,
        retired: lastYear < currentYear ? true : undefined
      };
    });
}

const str = (v) => JSON.stringify(v);
const list = (values) => `[${values.map(str).join(", ")}]`;

function render({ leagueData, currentYear, teams, heroes }) {
  const seasonRows = leagueData.map((row) => {
    if (row.missing) return `  ${row.year}: MISSING_YEAR,`;
    const fields = [
      `champion: ${str(row.champion)}`,
      `championMgr: ${str(row.championMgr)}`,
      `record: ${str(row.record)}`,
      `lastPlace: ${str(row.lastPlace)}`,
      `lastPlaceMgr: ${str(row.lastPlaceMgr)}`
    ];
    if (!row.note) return `  ${row.year}: { ${fields.join(", ")} },`;
    return [
      `  ${row.year}: {`,
      ...fields.map((f) => `    ${f},`),
      `    note: ${str(row.note)}`,
      `  },`
    ].join("\n");
  });

  const teamRows = teams.map(
    (t) =>
      `  { name: ${str(t.name)}, manager: ${str(t.manager)}, wins: ${t.wins}, losses: ${t.losses} },`
  );

  const heroRows = heroes.map((h) => {
    const fields = [`    years: ${str(h.years)}`, `    teamNames: ${list(h.teamNames)}`];
    if (h.apiNames) fields.push(`    apiNames: ${list(h.apiNames)}`);
    fields.push(`    seasons: ${h.seasons}`);
    if (h.retired) fields.push(`    retired: true`);
    return [`  ${str(h.person)}: {`, fields.join(",\n"), `  },`].join("\n");
  });

  return `/**
 * League data derived from the Yahoo extracts in public/worst-commish-ever/data/
 * and the deviations recorded in src/data/wce-corrections.json.
 *
 * DERIVED FILE - DO NOT EDIT.
 * Change src/data/wce-corrections.json and run \`npm run wce:data\`.
 */

export interface SeasonData {
  champion: string;
  championMgr: string;
  record: string;
  lastPlace: string;
  lastPlaceMgr: string;
  missing?: boolean;
  /** Footnote shown under the Wall of Fame & Shame when Yahoo's numbers are wrong. */
  note?: string;
}

export interface Team {
  name: string;
  manager: string;
  wins: number;
  losses: number;
}

export interface Hero {
  years: string;
  teamNames: string[];
  seasons: number;
  apiNames?: string[];
  retired?: boolean;
}

const MISSING = "--";
const MISSING_YEAR: SeasonData = {
  champion: MISSING,
  championMgr: MISSING,
  record: MISSING,
  lastPlace: MISSING,
  lastPlaceMgr: MISSING,
  missing: true
};

export const CURRENT_YEAR = ${currentYear};

export const LEAGUE_DATA: Record<number, SeasonData> = {
${seasonRows.join("\n")}
};

/** Final standings for CURRENT_YEAR, in playoff-finish order. */
export const TEAMS: Team[] = [
${teamRows.join("\n")}
];

/** Every manager who has a card, aggregated across all seasons with data. */
export const HEROES: Record<string, Hero> = {
${heroRows.join("\n")}
};
`;
}

function main() {
  const corrections = readJson(CORRECTIONS_FILE);
  const seasons = loadSeasons();
  if (seasons.size === 0) throw new Error(`No season.json files found under ${SEASONS_DIR}`);

  const resolvePerson = makeIdentityResolver(corrections.identities ?? []);
  const currentYear = Math.max(...seasons.keys());
  const heroes = buildHeroes(seasons, currentYear, resolvePerson);
  const output = render({
    leagueData: buildLeagueData(seasons, corrections, resolvePerson),
    currentYear,
    teams: buildTeams(seasons, currentYear, resolvePerson),
    heroes
  });

  if (process.argv.includes("--check")) {
    const current = existsSync(OUTPUT_FILE) ? readFileSync(OUTPUT_FILE, "utf8") : "";
    if (current !== output) {
      console.error("src/data/wce-seasons.generated.ts is stale. Run `npm run wce:data`.");
      process.exit(1);
    }
    console.log("src/data/wce-seasons.generated.ts is up to date.");
    return;
  }

  writeFileSync(OUTPUT_FILE, output);
  console.log(
    `Wrote src/data/wce-seasons.generated.ts (${seasons.size} seasons with data, ${heroes.length} managers).`
  );
}

main();
