#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["yfpy"]
# ///
"""
Contribute league data for missing years.

This script auto-discovers leagues you're a member of and extracts data
for any years we're missing.

Usage:
    uv run scripts/contribute.py --key YOUR_KEY --secret YOUR_SECRET
"""

import argparse
import contextlib
import json
import logging
import os
from pathlib import Path

from yfpy.query import YahooFantasySportsQuery


@contextlib.contextmanager
def suppress_yfpy_logs():
    """Suppress YFPY's noisy ERROR logs (it logs errors for expected 'no data' cases).

    YFPY's get_logger() clears and recreates handlers on every call, so we must
    suppress AFTER the query object is created. We clear handlers and disable
    propagation to prevent any output.
    """
    yfpy_logger = logging.getLogger("yfpy.query")
    old_handlers = yfpy_logger.handlers[:]
    old_level = yfpy_logger.level
    old_propagate = yfpy_logger.propagate

    # Clear all handlers and disable propagation
    yfpy_logger.handlers = []
    yfpy_logger.setLevel(logging.CRITICAL + 1)  # Higher than any level
    yfpy_logger.propagate = False

    try:
        yield
    finally:
        yfpy_logger.handlers = old_handlers
        yfpy_logger.setLevel(old_level)
        yfpy_logger.propagate = old_propagate

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent  # holds the .env with the Yahoo credentials
REPO_ROOT = SCRIPT_DIR.parents[2]
DATA_DIR = REPO_ROOT / "public/worst-commish-ever/data"

# NFL game IDs by year (from Yahoo Fantasy API)
GAME_IDS = {
    2005: 124,
    2006: 153, 2007: 175, 2008: 199, 2009: 222, 2010: 242,
    2011: 257, 2012: 273, 2013: 314, 2014: 331, 2015: 348,
    2016: 359, 2017: 371, 2018: 380, 2019: 390, 2020: 399,
    2021: 406, 2022: 414, 2023: 423, 2024: 449, 2025: 461,
}


def decode_bytes(val):
    """Decode bytes to string if needed."""
    if isinstance(val, bytes):
        return val.decode('utf-8')
    return val


def year_has_data(year: int) -> bool:
    """Check if we already have data for this year."""
    return (DATA_DIR / str(year) / "season.json").exists()


def discover_leagues(key: str, secret: str) -> dict:
    """Discover all NFL leagues the user has access to."""
    print("Discovering your leagues...")
    print("=" * 50)

    found = {}

    for year, game_id in sorted(GAME_IDS.items()):
        try:
            # Create query object first (this sets up the logger with handlers)
            query = YahooFantasySportsQuery(
                league_id="1",  # Dummy - not used for discovery
                game_code="nfl",
                game_id=game_id,
                yahoo_consumer_key=key,
                yahoo_consumer_secret=secret,
                env_file_location=PROJECT_DIR,
                save_token_data_to_env_file=True,
            )
            # Suppress logs only around the API call (after handlers are set up)
            with suppress_yfpy_logs():
                leagues = query.get_user_leagues_by_game_key(game_id)

            if leagues:
                for league in leagues:
                    league_id = str(league.league_id)
                    name = decode_bytes(league.name)
                    has_data = year_has_data(year)
                    status = "HAVE" if has_data else "NEW!"
                    print(f"  {year}: {name} (ID: {league_id}) [{status}]")

                    if not has_data:
                        found[year] = {
                            "game_id": game_id,
                            "league_id": league_id,
                            "name": name,
                        }
        except Exception as e:
            err = str(e)
            # "No data found" = no leagues for this year (expected, skip silently)
            # Other errors = might be real problems, show them
            if "No data found" not in err:
                print(f"  {year}: {err[:50]}")

    return found


def extract_year(year: int, game_id: int, league_id: str, key: str, secret: str) -> dict:
    """Extract data for a single year."""
    query = YahooFantasySportsQuery(
        league_id=league_id,
        game_code="nfl",
        game_id=game_id,
        yahoo_consumer_key=key,
        yahoo_consumer_secret=secret,
        env_file_location=PROJECT_DIR,
        save_token_data_to_env_file=True,
    )

    result = {
        "year": year,
        "game_id": game_id,
        "league_id": league_id,
        "success": False,
    }

    try:
        # League info
        league = query.get_league_info()
        result["league_name"] = decode_bytes(league.name)
        result["num_teams"] = league.num_teams

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
                t.update({
                    "wins": getattr(ot, 'wins', None),
                    "losses": getattr(ot, 'losses', None),
                })

            if hasattr(team, 'managers') and team.managers:
                mgr = team.managers[0] if isinstance(team.managers, list) else team.managers
                t["manager"] = decode_bytes(getattr(mgr, 'nickname', ''))

            result["standings"].append(t)

        result["standings"].sort(key=lambda x: x.get("rank") or 999)
        result["champion"] = result["standings"][0] if result["standings"] else None
        result["last_place"] = result["standings"][-1] if result["standings"] else None
        result["success"] = True

    except Exception as e:
        result["error"] = str(e)

    return result


def save_year(year: int, data: dict):
    """Save extracted data to JSON file."""
    year_dir = DATA_DIR / str(year)
    year_dir.mkdir(exist_ok=True)

    with open(year_dir / "season.json", "w") as f:
        json.dump(data, f, indent=2)


def main():
    parser = argparse.ArgumentParser(
        description="Contribute league data for missing years",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example:
    uv run scripts/contribute.py --key YOUR_KEY --secret YOUR_SECRET

Get your API key from Kyle, then run this script. It will:
1. Open a browser for Yahoo login (first time only)
2. Discover leagues you're a member of
3. Extract data for any years we're missing
4. Save to data/YEAR/season.json
        """,
    )
    parser.add_argument("--key", required=True, help="Yahoo API consumer key")
    parser.add_argument("--secret", required=True, help="Yahoo API consumer secret")
    parser.add_argument("--dry-run", action="store_true", help="Discover only, don't extract")
    args = parser.parse_args()

    # Set env vars for YFPY
    os.environ["YAHOO_CONSUMER_KEY"] = args.key
    os.environ["YAHOO_CONSUMER_SECRET"] = args.secret

    print()
    print("WORST COMMISH EVER - Data Contribution Tool")
    print("=" * 50)
    print()

    # Discover leagues
    new_leagues = discover_leagues(args.key, args.secret)

    if not new_leagues:
        print()
        print("No new data to contribute - we already have all years you have access to!")
        print("Thanks for checking though.")
        return

    print()
    print(f"Found {len(new_leagues)} year(s) with NEW data!")
    print()

    if args.dry_run:
        print("(Dry run - not extracting)")
        return

    # Extract data
    print("Extracting data...")
    print("-" * 50)

    extracted = []
    for year, info in sorted(new_leagues.items()):
        print(f"  {year}: {info['name']}...", end=" ", flush=True)

        data = extract_year(
            year=year,
            game_id=info["game_id"],
            league_id=info["league_id"],
            key=args.key,
            secret=args.secret,
        )

        if data["success"]:
            save_year(year, data)
            champ = data.get("champion", {}).get("team_name", "?")
            print(f"OK (Champion: {champ})")
            extracted.append(year)
        else:
            print(f"FAILED: {data.get('error', 'unknown')[:30]}")

    # Summary
    print()
    print("=" * 50)
    print("DONE!")
    print("=" * 50)

    if extracted:
        years_str = ", ".join(str(y) for y in extracted)
        print(f"Extracted: {years_str}")
        print()
        print("To commit your contribution:")
        print()
        print(f'  git add data/')
        print(f'  git commit -m "feat: add {years_str} league data"')
        print(f'  git push')
    else:
        print("No data was extracted.")


if __name__ == "__main__":
    main()
