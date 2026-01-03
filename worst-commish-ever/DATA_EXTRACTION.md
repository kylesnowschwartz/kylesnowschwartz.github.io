# Data Extraction: Yahoo Fantasy Football

## Goal

Pull 25 years of league history (2000-2024) from Yahoo Fantasy Football to populate the Worst Commish Ever website.

## League Info

- **URL**: `https://football.fantasysports.yahoo.com/2001/f1/116317`
- **League ID**: `116317`
- **Years**: 2000-2024 (25 seasons)

## Yahoo Fantasy API

### Game Keys (NFL)

| Year | Game ID | Year | Game ID |
|------|---------|------|---------|
| 2001 | 57 | 2013 | 314 |
| 2002 | 49 | 2014 | 331 |
| 2003 | 79 | 2015 | 348 |
| 2004 | 101 | 2016 | 359 |
| 2005 | 124 | 2017 | 371 |
| 2006 | 153 | 2018 | 380 |
| 2007 | 175 | 2019 | 390 |
| 2008 | 199 | 2020 | 399 |
| 2009 | 222 | 2021 | 406 |
| 2010 | 242 | 2022 | 414 |
| 2011 | 257 | 2023 | 423 |
| 2012 | 273 | 2024 | TBD |

### Authentication

Requires OAuth 2.0:
1. Register app at [Yahoo Developer Network](https://developer.yahoo.com/)
2. Get consumer key + secret
3. User authorizes via browser redirect
4. Refresh tokens for ongoing access

### Access Rules

- Private leagues: Must be a member
- Public leagues: Anyone can access
- Historical data: Available if you have league access

## Tools

### YFPY (Python)

```bash
pip install yfpy
```

```python
from yfpy.query import YahooFantasySportsQuery

query = YahooFantasySportsQuery(
    league_id="116317",
    game_code="nfl",
    game_id=57,  # 2001
    yahoo_consumer_key="YOUR_KEY",
    yahoo_consumer_secret="YOUR_SECRET"
)

# Get standings
standings = query.get_league_standings()

# Get teams
teams = query.get_league_teams()
```

Docs: https://github.com/uberfastman/yfpy

## Data We Need

| Section | Data Points |
|---------|-------------|
| Dream Teams | Team names, owner names, current record |
| Championship Baseball | Champion by year, team name, final record |
| Wall of Shame | Worst moments (manual curation?) |
| League History | Key events by year (manual curation?) |
| League Rules | Current ruleset |

## Finding Yahoo Developer Credentials

Check these locations:
1. https://developer.yahoo.com/apps/ (logged into Yahoo)
2. `~/.yfpy/` directory (if YFPY was used before)
3. Any `.env` files in old projects
4. Password manager under "Yahoo" or "Fantasy"

Credentials needed:
- **Consumer Key** (client ID)
- **Consumer Secret** (client secret)

## Open Questions

- [x] Do we have OAuth credentials? → Yes, somewhere
- [ ] Is the league still accessible via API?
- [ ] What's the league ID for each year? (might change)
- [ ] Is historical data complete or partial?

## Next Steps

1. ~~Set up Yahoo Developer app~~ → Find existing credentials
2. Test API access to one historical season
3. Script to pull all seasons
4. Transform data to site format

---

*Last updated: 2026-01-03*
