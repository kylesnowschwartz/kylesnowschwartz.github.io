# Data Extraction: Yahoo Fantasy Football

## Summary

Successfully extracted **16 years** of league data (2006-2024) via Yahoo Fantasy API.

**Missing years:** 2005, 2007-2009 - Either predates current Yahoo account linkage, or data not accessible via API. These will need manual entry if available.

## How to Run

```bash
cd worst-commish-ever
source .envrc                          # Load Yahoo API credentials
uv run scripts/extract.py --all        # Extract all configured years
uv run scripts/extract.py 2024 2023    # Extract specific years
uv run scripts/extract.py 2024 -v      # Verbose output
```

## What Worked

1. **OAuth 2.0 via YFPY** - Token caching to `.env` file works perfectly
2. **League discovery** - `list_my_leagues.py` finds all leagues you're a member of
3. **Per-year league IDs** - Yahoo reuses league IDs across game_ids, so each year needs its own league_id

## League Configuration

The league has had different names and IDs over the years:

| Year | Game ID | League ID | League Name |
|------|---------|-----------|-------------|
| 2006 | 153 | 122917 | Championship Baseball |
| 2010 | 242 | 172584 | Trending Ben's Sloppy Vajayj |
| 2011 | 257 | 310665 | 250 Kicken Chickers |
| 2012 | 273 | 116317 | Action Jackson's Revenge |
| 2013 | 314 | 468061 | Football!Goodbye Productivity! |
| 2014 | 331 | 395447 | WorstCommishEver |
| 2015 | 348 | 395219 | WorstCommishEver |
| 2016 | 359 | 598359 | WorstCommishEver |
| 2017 | 371 | 317448 | WorstCommishEver |
| 2018 | 380 | 325854 | WorstCommishEver |
| 2019 | 390 | 320916 | WorstCommishEver |
| 2020 | 399 | 729517 | WorstCommishEver |
| 2021 | 406 | 794998 | WorstCommishEver |
| 2022 | 414 | 640845 | WorstCommishEver |
| 2023 | 423 | 444015 | WorstCommishEver |
| 2024 | 449 | 500141 | WorstCommishEver |

## Champions by Year

| Year | Champion | Last Place |
|------|----------|------------|
| 2006 | Beantown Ballers | BATMAN |
| 2010 | Captain Arab | Dallas Cowboys |
| 2011 | The Violets | kittencock |
| 2012 | Mohawk National | TheTheobaldWolftones |
| 2013 | Big Bird | Bronuts |
| 2014 | Embrace The Chaos! | Half-Smokes |
| 2015 | Half-Smokes | Mi Nombre es Peyton |
| 2016 | Koala lambpork | The Violets |
| 2017 | Nerd Rage | Big Bird |
| 2018 | TheSkeeterValentines | Nerd Rage |
| 2019 | Ben's Bold Team | Nerd Rage |
| 2020 | Big Bird | Mi Nombre es Peyton |
| 2021 | Mohawk National | Mi Nombre es Peyton |
| 2022 | Koala lambpork | F.U.B.A.R. |
| 2023 | TheSkeeterValentines | Mohawk National |
| 2024 | Koala lambpork | Nerd Rage |

## Files Created

```
data/
├── 2006/season.json
├── 2010/season.json
├── 2011/season.json
├── 2012/season.json
├── 2013/season.json
├── 2014/season.json
├── 2015/season.json
├── 2016/season.json
├── 2017/season.json
├── 2018/season.json
├── 2019/season.json
├── 2020/season.json
├── 2021/season.json
├── 2022/season.json
├── 2023/season.json
└── 2024/season.json
```

Each `season.json` contains:
- League name and team count
- Full standings with ranks (rank = playoff seed/final placement)
- Win/loss records
- Manager nicknames
- Champion and last place teams with playoff seeds

**Important:** The `rank` field represents playoff seeding/final placement, not regular season standing. This is why a 9-5 team can be rank 1 (champion) while a 12-2 team is rank 4 (lost in playoffs). See 2023 data for an example.

## Yahoo API Notes

- **Authentication**: OAuth 2.0, tokens cached in `.env`
- **Rate limits**: Minimal, no throttling encountered
- **Historical data**: Available back to 1999, but only for leagues you have access to
- **Game IDs**: Not sequential by year (e.g., 2005=124, 2006=153)
- **League IDs**: Reused across game_ids, so `116317` in 2012 is different from `116317` in 2006

## Scripts

| Script | Purpose |
|--------|---------|
| `extract.py` | Main extraction script - pulls standings by year |
| `build_data_js.py` | Generate data.js from season.json files |
| `list_game_ids.py` | Discover all NFL game IDs from API |
| `list_my_leagues.py` | Find all leagues you're a member of |

## Build Process

After extracting data from Yahoo API, regenerate the JavaScript file:

```bash
# Step 1: Extract data from Yahoo API
uv run scripts/extract.py --all

# Step 2: Generate data.js from JSON files
uv run scripts/build_data_js.py

# Step 3: Verify changes
git diff data.js

# Step 4: Commit both together
git add data/*/season.json data.js
git commit -m "feat: update league data"
```

**Important:** `data.js` is now auto-generated. Do not edit it manually. Changes to league data should be made by re-running the extraction and build scripts.

## Next Steps

1. Manually add missing years (2005, 2007-2009) if records exist
2. Add manager photos to `images/managers/`
3. Consider adding playoff bracket visualization

---

*Last updated: 2026-01-03*
