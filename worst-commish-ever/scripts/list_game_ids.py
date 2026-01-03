#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["yfpy"]
# ///
"""List all available Yahoo Fantasy NFL game IDs."""

import os
from pathlib import Path
from yfpy.query import YahooFantasySportsQuery

PROJECT_DIR = Path(__file__).parent.parent

query = YahooFantasySportsQuery(
    league_id="1",  # Dummy - not used for this query
    game_code="nfl",
    yahoo_consumer_key=os.environ.get("YAHOO_CONSUMER_KEY"),
    yahoo_consumer_secret=os.environ.get("YAHOO_CONSUMER_SECRET"),
    env_file_location=PROJECT_DIR,
    save_token_data_to_env_file=True,
)

print("NFL Game IDs by Year:")
print("=" * 40)
games = query.get_all_yahoo_fantasy_game_keys()
for game in sorted(games, key=lambda g: g.season):
    print(f"  {game.season}: {game.game_id}")
