#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["yfpy"]
# ///
"""
Extract Yahoo Fantasy Football league data.

Usage:
    uv run scripts/extract.py 2001              # Single year
    uv run scripts/extract.py 2001 2002 2003    # Multiple years
    uv run scripts/extract.py --all             # All years (2001-2024)
    uv run scripts/extract.py 2001 --verbose    # Show full API response
"""

import argparse
import json
import os
from pathlib import Path
from yfpy.query import YahooFantasySportsQuery

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"

# League info
LEAGUE_ID = "116317"
GAME_CODE = "nfl"

# Game IDs by year (from API - not sequential!)
GAME_IDS = {
    1999: 50, 2000: 53, 2001: 57, 2002: 49, 2003: 79,
    2004: 101, 2005: 124, 2006: 153, 2007: 175, 2008: 199,
    2009: 222, 2010: 242, 2011: 257, 2012: 273, 2013: 314,
    2014: 331, 2015: 348, 2016: 359, 2017: 371, 2018: 380,
    2019: 390, 2020: 399, 2021: 406, 2022: 414, 2023: 423,
    2024: 449, 2025: 461,
}


def decode_bytes(val):
    if isinstance(val, bytes):
        return val.decode('utf-8')
    return val


def obj_to_dict(obj):
    if hasattr(obj, '__dict__'):
        return {k: obj_to_dict(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
    elif isinstance(obj, list):
        return [obj_to_dict(i) for i in obj]
    elif isinstance(obj, bytes):
        return obj.decode('utf-8')
    return obj


def extract_year(year: int, verbose: bool = False) -> dict:
    game_id = GAME_IDS.get(year)
    if not game_id:
        print(f"  Unknown year: {year}")
        return {"year": year, "success": False, "error": "Unknown game_id"}

    print(f"\n{'='*50}")
    print(f"{year} (game_id: {game_id})")
    print('='*50)

    query = YahooFantasySportsQuery(
        league_id=LEAGUE_ID,
        game_code=GAME_CODE,
        game_id=game_id,
        yahoo_consumer_key=os.environ.get("YAHOO_CONSUMER_KEY"),
        yahoo_consumer_secret=os.environ.get("YAHOO_CONSUMER_SECRET"),
        env_file_location=PROJECT_DIR,
        save_token_data_to_env_file=True,
    )

    result = {"year": year, "game_id": game_id, "league_id": LEAGUE_ID, "success": False}

    try:
        # League info
        league = query.get_league_info()
        result["league_name"] = decode_bytes(league.name)
        result["num_teams"] = league.num_teams
        print(f"  League: {result['league_name']} ({result['num_teams']} teams)")

        if verbose:
            print("\n  [LEAGUE INFO]")
            print(json.dumps(obj_to_dict(league), indent=2, default=str))

        # Standings
        standings = query.get_league_standings()
        result["standings"] = []
        for team in standings.teams:
            t = {
                "team_id": str(team.team_id),
                "team_name": decode_bytes(team.name),
                "rank": getattr(team.team_standings, 'rank', None) if hasattr(team, 'team_standings') else None,
            }
            if hasattr(team, 'team_standings') and hasattr(team.team_standings, 'outcome_totals'):
                ot = team.team_standings.outcome_totals
                t.update({"wins": getattr(ot, 'wins', None), "losses": getattr(ot, 'losses', None)})
            if hasattr(team, 'managers') and team.managers:
                mgr = team.managers[0] if isinstance(team.managers, list) else team.managers
                t["manager"] = decode_bytes(getattr(mgr, 'nickname', ''))
            result["standings"].append(t)

        result["standings"].sort(key=lambda x: x.get("rank") or 999)
        result["champion"] = result["standings"][0] if result["standings"] else None
        result["last_place"] = result["standings"][-1] if result["standings"] else None

        print(f"  Champion: {result['champion']['team_name']}" if result['champion'] else "  No champion data")
        print(f"  Last: {result['last_place']['team_name']}" if result['last_place'] else "")

        if verbose:
            print("\n  [STANDINGS]")
            for t in result["standings"]:
                print(f"    {t['rank']}. {t['team_name']} ({t.get('wins', '?')}-{t.get('losses', '?')})")

        result["success"] = True

    except Exception as e:
        result["error"] = str(e)
        print(f"  ERROR: {e}")

    return result


def save_year(year: int, data: dict):
    year_dir = DATA_DIR / str(year)
    year_dir.mkdir(exist_ok=True)
    with open(year_dir / "season.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Saved: {year_dir}/season.json")


def main():
    parser = argparse.ArgumentParser(description="Extract Yahoo Fantasy Football data")
    parser.add_argument("years", nargs="*", type=int, help="Year(s) to extract")
    parser.add_argument("--all", action="store_true", help="Extract all years")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show full API responses")
    parser.add_argument("--no-save", action="store_true", help="Don't save to files")
    args = parser.parse_args()

    if not os.environ.get("YAHOO_CONSUMER_KEY"):
        print("Error: source .envrc first")
        return

    years = list(GAME_IDS.keys()) if args.all else args.years
    if not years:
        parser.print_help()
        return

    results = {}
    for year in sorted(years):
        data = extract_year(year, verbose=args.verbose)
        results[year] = data
        if data["success"] and not args.no_save:
            save_year(year, data)

    # Summary
    print("\n" + "="*50)
    print("CHAMPIONS")
    print("="*50)
    for year in sorted(results.keys()):
        if results[year]["success"]:
            champ = results[year].get("champion", {})
            print(f"  {year}: {champ.get('team_name', '?')}")


if __name__ == "__main__":
    main()
