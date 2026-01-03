#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["yfpy"]
# ///
"""List all NFL leagues you're a member of across all years."""

import os
from pathlib import Path
from yfpy.query import YahooFantasySportsQuery

PROJECT_DIR = Path(__file__).parent.parent

# Game IDs by year
GAME_IDS = {
    2001: 57, 2002: 49, 2003: 79, 2004: 101, 2005: 124,
    2006: 153, 2007: 175, 2008: 199, 2009: 222, 2010: 242,
    2011: 257, 2012: 273, 2013: 314, 2014: 331, 2015: 348,
    2016: 359, 2017: 371, 2018: 380, 2019: 390, 2020: 399,
    2021: 406, 2022: 414, 2023: 423, 2024: 449, 2025: 461,
}


def decode_bytes(val):
    if isinstance(val, bytes):
        return val.decode('utf-8')
    return val


def main():
    if not os.environ.get("YAHOO_CONSUMER_KEY"):
        print("Error: source .envrc first")
        return

    print("Your NFL Leagues by Year")
    print("=" * 60)
    print()

    all_leagues = {}

    for year, game_id in sorted(GAME_IDS.items()):
        try:
            query = YahooFantasySportsQuery(
                league_id="1",  # Dummy - not used
                game_code="nfl",
                game_id=game_id,
                yahoo_consumer_key=os.environ.get("YAHOO_CONSUMER_KEY"),
                yahoo_consumer_secret=os.environ.get("YAHOO_CONSUMER_SECRET"),
                env_file_location=PROJECT_DIR,
                save_token_data_to_env_file=True,
            )

            # Get user's leagues for this game
            leagues = query.get_user_leagues_by_game_key(game_id)

            if leagues:
                print(f"{year} (game_id: {game_id}):")
                for league in leagues:
                    league_id = league.league_id
                    name = decode_bytes(league.name)
                    num_teams = getattr(league, 'num_teams', '?')
                    print(f"  - {name} (ID: {league_id}, {num_teams} teams)")
                    all_leagues[year] = all_leagues.get(year, [])
                    all_leagues[year].append({
                        "league_id": str(league_id),
                        "name": name,
                        "num_teams": num_teams,
                    })
            else:
                print(f"{year}: No leagues found")

        except Exception as e:
            err = str(e)
            if "not in this league" in err or "not allowed" in err:
                print(f"{year}: No leagues found")
            else:
                print(f"{year}: Error - {err[:50]}")

        print()

    # Summary for extract.py
    print("=" * 60)
    print("LEAGUE IDS FOR extract.py:")
    print("=" * 60)
    for year in sorted(all_leagues.keys()):
        for lg in all_leagues[year]:
            print(f"  {year}: {lg['league_id']}  # {lg['name']}")


if __name__ == "__main__":
    main()
