/**
 * League Data - Extracted from Yahoo Fantasy API
 * Run scripts/extract.py to update this data
 *
 * Years marked missing: need someone with API access to those years to run extract.py
 */

const MISSING = "--";
const MISSING_YEAR = {
  champion: MISSING,
  championMgr: MISSING,
  record: MISSING,
  lastPlace: MISSING,
  lastPlaceMgr: MISSING,
  missing: true
};

const LEAGUE_DATA = {
  2000: MISSING_YEAR,
  2001: MISSING_YEAR,
  2002: MISSING_YEAR,
  2003: MISSING_YEAR,
  2004: MISSING_YEAR,
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
const CURRENT_YEAR = 2025;
const TEAMS = [
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
