/**
 * League Data - Extracted from Yahoo Fantasy API
 * Run scripts/extract.py to update this data
 *
 * Years marked missing: need someone with API access to those years to run extract.py
 */

// Type definitions
export interface SeasonData {
  champion: string;
  championMgr: string;
  record: string;
  lastPlace: string;
  lastPlaceMgr: string;
  missing?: boolean;
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

// Constants
const MISSING = "--";
const MISSING_YEAR: SeasonData = {
  champion: MISSING,
  championMgr: MISSING,
  record: MISSING,
  lastPlace: MISSING,
  lastPlaceMgr: MISSING,
  missing: true
};

export const LEAGUE_DATA: Record<number, SeasonData> = {
  2005: MISSING_YEAR,
  2006: { champion: "Beantown Ballers", championMgr: "JBex", record: "8-6", lastPlace: "BATMAN", lastPlaceMgr: "Kyle" },
  2007: MISSING_YEAR,
  2008: MISSING_YEAR,
  2009: MISSING_YEAR,
  2010: { champion: "Captain Arab", championMgr: "Nahush", record: "12-2", lastPlace: "Dallas Cowboys", lastPlaceMgr: "Unknown" },
  2011: { champion: "The Violets", championMgr: "Ben", record: "9-5", lastPlace: "kittencock", lastPlaceMgr: "THomas" },
  2012: { champion: "Mohawk National", championMgr: "McLean", record: "9-5", lastPlace: "TheTheobaldWolftones", lastPlaceMgr: "Bryan" },
  2013: { champion: "Big Bird", championMgr: "Jonathan Young", record: "9-5", lastPlace: "Bronuts", lastPlaceMgr: "THomas" },
  2014: { champion: "Embrace The Chaos!", championMgr: "Gary", record: "9-5", lastPlace: "Half-Smokes", lastPlaceMgr: "Dave G" },
  2015: { champion: "Half-Smokes", championMgr: "Dave G", record: "9-5", lastPlace: "Mi Nombre es Peyton", lastPlaceMgr: "Aaron" },
  2016: { champion: "Koala lambpork", championMgr: "THomas", record: "7-7", lastPlace: "The Violets", lastPlaceMgr: "Ben" },
  2017: { champion: "Nerd Rage", championMgr: "Kyle", record: "10-4", lastPlace: "Big Bird", lastPlaceMgr: "Jonathan Young" },
  2018: { champion: "TheSkeeterValentines", championMgr: "JBex", record: "10-4", lastPlace: "Nerd Rage", lastPlaceMgr: "Kyle" },
  2019: { champion: "Ben's Bold Team", championMgr: "Ben", record: "7-7", lastPlace: "Nerd Rage", lastPlaceMgr: "Kyle" },
  2020: { champion: "Big Bird", championMgr: "Jonathan Young", record: "10-4", lastPlace: "Mi Nombre es Peyton", lastPlaceMgr: "Aaron" },
  2021: { champion: "Mohawk National", championMgr: "McLean", record: "11-4", lastPlace: "Mi Nombre es Peyton", lastPlaceMgr: "Aaron" },
  2022: { champion: "Koala lambpork", championMgr: "THomas", record: "9-6", lastPlace: "F.U.B.A.R.", lastPlaceMgr: "Bryan" },
  2023: { champion: "TheSkeeterValentines", championMgr: "JBex", record: "9-5", lastPlace: "Mohawk National", lastPlaceMgr: "McLean" },
  2024: { champion: "Koala lambpork", championMgr: "THomas", record: "14-1", lastPlace: "Nerd Rage", lastPlaceMgr: "Kyle" },
  2025: { champion: "Koala lambpork", championMgr: "THomas", record: "8-7", lastPlace: "The Violets", lastPlaceMgr: "Ben" }
};

// Current season standings
export const CURRENT_YEAR = 2025;

export const TEAMS: Team[] = [
  { name: "Koala lambpork", manager: "THomas", wins: 8, losses: 7 },
  { name: "Nerd Rage", manager: "Kyle", wins: 9, losses: 6 },
  { name: "Mi Nombre es Peyton", manager: "Aaron", wins: 10, losses: 5 },
  { name: "F.U.B.A.R.", manager: "Bryan", wins: 9, losses: 6 },
  { name: "Mohawk National", manager: "McLean", wins: 8, losses: 7 },
  { name: "Big Bird", manager: "Jonathan Young", wins: 7, losses: 8 },
  { name: "Embrace The Chaos!", manager: "Gary", wins: 8, losses: 7 },
  { name: "Ben's Bold Team", manager: "Ben", wins: 8, losses: 7 },
  { name: "Half-Smokes", manager: "Dave G", wins: 7, losses: 8 },
  { name: "SCHNEEBO'S CTE DREAMERZ", manager: "Boost Poppa Charlie", wins: 7, losses: 8 },
  { name: "TheSkeeterValentines", manager: "JBex", wins: 6, losses: 9 },
  { name: "The Violets", manager: "Ben", wins: 3, losses: 12 }
];

// Manager history - aggregated from all seasons
export const HEROES: Record<string, Hero> = {
  "Aaron": {
    years: "2012-2025",
    teamNames: ["Mi Nombre es Peyton"],
    seasons: 14
  },
  "Ben": {
    years: "2006-2025",
    teamNames: ["Team Weak", "The Violets", "Ben's Bold Team"],
    seasons: 17
  },
  "Boost Poppa Charlie": {
    years: "2006-2025",
    teamNames: ["Countdown to Thunder", "Official Worst Team", "Gary For Congress", "Dakota Vengeance", "BIZARRO GARY", "OPTIMAL GARY", "MEGADONG", "THE STEW PORK WETS", "SCHNEEBO'S CTE DREAMERZ"],
    seasons: 17
  },
  "Conway": {
    apiNames: ["BC", "Bryan"],
    years: "2006-2025",
    teamNames: ["MekonRiverCatfish", "How Ya Like Me Now?", "Justinisaweenus!", "TheTheobaldWolftones", "ThePeytonManningShow", "TheAndyDaltonShow", "F.U.B.A.R."],
    seasons: 17
  },
  "Dave G": {
    years: "2010-2025",
    teamNames: ["More Hopenchange", "Charles Bronson", "Half-Smokes"],
    seasons: 16
  },
  "Gary": {
    years: "2010-2025",
    teamNames: ["Mean Green Machine", "Embrace The Chaos!"],
    seasons: 16
  },
  "JBex": {
    years: "2006-2025",
    teamNames: ["Beantown Ballers", "TheSkeeterValentines", "ImpeachTheCommish", "DefiancePhiladelphia"],
    seasons: 17
  },
  "Jonathan Young": {
    years: "2010-2025",
    teamNames: ["Big Bird", "Horny for Hanie"],
    seasons: 16
  },
  "Kyle": {
    years: "2006-2025",
    teamNames: ["BATMAN", "Zerg Domination", "meatsausagesurprise!", "Nerd Rage"],
    seasons: 17
  },
  "McLean": {
    years: "2006-2025",
    teamNames: ["Mohawk National"],
    seasons: 17
  },
  "Nahush": {
    years: "2006-2018",
    teamNames: ["Captain Arab"],
    seasons: 10,
    retired: true
  },
  "THomas": {
    years: "2006-2025",
    teamNames: ["Hoohah Dogtime", "Shazizmo CougarAlly", "kittencock", "Cheesepleasers", "Bronuts", "Winos", "Koala lambpork"],
    seasons: 17
  }
};

/**
 * Display name mapping - transforms API names to display names
 */
const MANAGER_DISPLAY_NAMES: Record<string, string> = {
  'BC': 'Conway',
  'Bryan': 'Conway'
};

export const displayName = (apiName: string): string => MANAGER_DISPLAY_NAMES[apiName] || apiName;

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
