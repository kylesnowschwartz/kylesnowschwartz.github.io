#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""
Generate data.js from season.json files.

Usage:
    uv run scripts/build_data_js.py
    uv run scripts/build_data_js.py --output data.js
"""

import argparse
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
OUTPUT_FILE = PROJECT_DIR / "data.js"

# All years (2005-2025)
ALL_YEARS = range(2005, 2026)

# Current year for TEAMS array
CURRENT_YEAR = 2025

# Manager display name mapping (API name → display name)
MANAGER_DISPLAY_NAMES = {
    'BC': 'Conway',
    'Bryan': 'Conway'
}

# Retired managers
RETIRED_MANAGERS = {'Nahush'}


def load_season_data(year: int) -> dict | None:
    """Load season.json for a given year, return None if doesn't exist."""
    season_file = DATA_DIR / str(year) / "season.json"
    if not season_file.exists():
        return None

    try:
        with open(season_file) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Warning: Failed to parse {season_file}: {e}")
        return None


def format_record(wins, losses, playoff_seed=None):
    """Format record with optional playoff seed: '10-4 (#2 seed)' or '10-4'."""
    record = f"{wins}-{losses}"
    if playoff_seed:
        record += f" (#{playoff_seed} seed)"
    return record


def build_league_data() -> dict:
    """Build LEAGUE_DATA object from all season.json files."""
    league_data = {}

    for year in ALL_YEARS:
        data = load_season_data(year)

        if not data or not data.get("success"):
            # Missing year - use placeholder
            league_data[year] = {
                "champion": "--",
                "championMgr": "--",
                "record": "--",
                "lastPlace": "--",
                "lastPlaceMgr": "--",
                "missing": True
            }
            continue

        champ = data.get("champion", {})
        last = data.get("last_place", {})

        # Apply display name mapping
        champ_mgr = champ.get("manager", "--")
        champ_mgr = MANAGER_DISPLAY_NAMES.get(champ_mgr, champ_mgr)

        last_mgr = last.get("manager", "--")
        last_mgr = MANAGER_DISPLAY_NAMES.get(last_mgr, last_mgr)

        # Format records with playoff seeds
        champ_record = format_record(
            champ.get("wins", 0),
            champ.get("losses", 0),
            champ.get("playoff_seed")
        ) if champ else "--"

        last_record = format_record(
            last.get("wins", 0),
            last.get("losses", 0),
            last.get("playoff_seed")
        ) if last else "--"

        league_data[year] = {
            "champion": champ.get("team_name", "--"),
            "championMgr": champ_mgr,
            "record": champ_record,
            "lastPlace": last.get("team_name", "--"),
            "lastPlaceMgr": last_mgr,
            "lastPlaceRecord": last_record
        }

    return league_data


def build_current_teams(year: int) -> list:
    """Build TEAMS array from current season standings."""
    data = load_season_data(year)

    if not data or not data.get("standings"):
        return []

    teams = []
    for team in data["standings"]:
        # Apply display name mapping
        manager = team.get("manager", "")
        manager = MANAGER_DISPLAY_NAMES.get(manager, manager)

        teams.append({
            "name": team.get("team_name", ""),
            "manager": manager,
            "wins": team.get("wins", 0),
            "losses": team.get("losses", 0)
        })

    return teams


def build_heroes() -> dict:
    """Build HEROES dict by aggregating manager history across all years."""
    # Track per manager: years active, team names, season count
    manager_data = defaultdict(lambda: {
        "years": set(),
        "team_names": set(),
        "seasons": 0
    })

    for year in ALL_YEARS:
        data = load_season_data(year)
        if not data or not data.get("standings"):
            continue

        for team in data["standings"]:
            manager = team.get("manager", "")
            if not manager:
                continue

            # Apply display name mapping
            display_name = MANAGER_DISPLAY_NAMES.get(manager, manager)

            manager_data[display_name]["years"].add(year)
            manager_data[display_name]["team_names"].add(team.get("team_name", ""))
            manager_data[display_name]["seasons"] += 1

    # Convert to output format
    heroes = {}
    for manager, data in manager_data.items():
        years_list = sorted(data["years"])
        year_range = f"{years_list[0]}-{years_list[-1]}" if years_list else ""

        hero = {
            "years": year_range,
            "teamNames": sorted(data["team_names"]),
            "seasons": data["seasons"]
        }

        # Add retired flag
        if manager in RETIRED_MANAGERS:
            hero["retired"] = True

        # Add apiNames for managers with mappings
        api_names = [k for k, v in MANAGER_DISPLAY_NAMES.items() if v == manager]
        if api_names:
            hero["apiNames"] = api_names

        heroes[manager] = hero

    return heroes


def generate_data_js(output_path: Path):
    """Generate data.js file from all season data."""
    print("Building data.js...")

    league_data = build_league_data()
    current_teams = build_current_teams(CURRENT_YEAR)
    heroes = build_heroes()

    # Generate JavaScript file
    js_content = f'''/**
 * League Data - Auto-generated from Yahoo Fantasy API
 * DO NOT EDIT MANUALLY
 *
 * To update:
 *   1. Run: uv run scripts/extract.py --all
 *   2. Run: uv run scripts/build_data_js.py
 *   3. Commit both data/*.json and data.js together
 *
 * Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
 * Source: data/YYYY/season.json via scripts/build_data_js.py
 */

const MISSING = "--";
const MISSING_YEAR = {{
  champion: MISSING,
  championMgr: MISSING,
  record: MISSING,
  lastPlace: MISSING,
  lastPlaceMgr: MISSING,
  missing: true
}};

const LEAGUE_DATA = {json.dumps(league_data, indent=2)};

// Current season standings
const CURRENT_YEAR = {CURRENT_YEAR};
const TEAMS = {json.dumps(current_teams, indent=2)};

// Manager history - aggregated from all seasons
const HEROES = {json.dumps(heroes, indent=2)};

/**
 * Display name mapping - transforms API names to display names
 * Use displayName() helper in rendering code
 */
const MANAGER_DISPLAY_NAMES = {json.dumps(MANAGER_DISPLAY_NAMES, indent=2)};

const displayName = (apiName) => MANAGER_DISPLAY_NAMES[apiName] || apiName;
'''

    # Write file
    with open(output_path, 'w') as f:
        f.write(js_content)

    print(f"✓ Generated: {output_path}")
    print(f"  - {len(league_data)} years in LEAGUE_DATA")
    print(f"  - {len(current_teams)} teams in TEAMS ({CURRENT_YEAR})")
    print(f"  - {len(heroes)} managers in HEROES")


def main():
    parser = argparse.ArgumentParser(description="Generate data.js from season.json files")
    parser.add_argument("--output", "-o", type=Path, default=OUTPUT_FILE, help="Output file path")
    args = parser.parse_args()

    if not DATA_DIR.exists():
        print(f"Error: Data directory not found: {DATA_DIR}")
        return

    generate_data_js(args.output)
    print("\n✓ Done! Preview changes with: open index.html")


if __name__ == "__main__":
    main()
