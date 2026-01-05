# Playoff Seeding Investigation - 2026-01-05

## Goal
Display original playoff seeding (e.g., "14-1 (#3 seed)") for champions in the Fame & Shame table, showing which seed they entered playoffs as, not their final placement.

## Problem Discovered
Gary's feature request revealed that `rank` field in Yahoo API represents **final placement**, not **playoff seeding**:
- Champion always has `rank: 1` (they won)
- But they may have entered playoffs as #2, #3, or #4 seed
- Current implementation shows everyone as "#1 seed" because we're using `rank` instead of actual seeding

## What We Tried

### 1. Initial Implementation (INCORRECT)
**File:** `scripts/extract.py` lines 124-128

```python
# Add playoff_seed field (rank represents playoff position, not regular season standing)
if result["champion"]:
    result["champion"]["playoff_seed"] = result["champion"].get("rank")
if result["last_place"]:
    result["last_place"]["playoff_seed"] = result["last_place"].get("rank")
```

**Why it failed:** This overwrites any existing `playoff_seed` with `rank`, forcing champion to always show as #1 seed.

### 2. Investigating Yahoo API Playoff Data

**Methods tested:**
- `query.get_league_matchups_by_week(week)` - Week-specific matchups
- `query.get_league_settings()` - League configuration

**Findings:**
- Playoffs start week 16 (confirmed via `playoff_start_week: 16`)
- Only 4 teams make playoffs (`num_playoff_teams: 4`)
- No reseeding (`uses_playoff_reseeding: 0`)
- Playoff matchups have `is_playoffs: 1` flag
- **NO playoff_seed field exists in matchup data**
- **NO playoff_seed field in team data during playoff weeks**

**Available fields in matchup data:**
```
is_consolation, is_matchup_of_the_week, is_matchup_recap_available,
is_playoffs, is_tied, matchup_grades, matchup_recap_title,
matchup_recap_url, status, teams, week, week_end, week_start,
winner_team_key
```

**Team fields:**
```
team_id, team_name, rank, wins, losses, manager,
faab_balance, number_of_moves, clinched_playoffs, etc.
```

### 3. API Data Structure Analysis

**Current standings extraction:**
- `query.get_league_standings()` returns **final post-playoff standings**
- Teams sorted by final `rank` (1 = champion, 12 = last place)
- The `playoff_seed` field in champion/last_place objects **equals rank** (always 1 and 12)

**Example from 2024 season.json:**
```json
{
  "champion": {
    "team_name": "Koala lambpork",
    "rank": 1,           // final placement
    "wins": 14,
    "losses": 1,
    "playoff_seed": 1    // this equals rank, not original seed
  }
}
```

**Example from 2023 showing the issue:**
```json
{
  "champion": {
    "team_name": "TheSkeeterValentines",
    "rank": 1,           // won championship
    "wins": 9,
    "losses": 5,
    "playoff_seed": 1    // but may have been #2 or #3 seed!
  }
}
```

## Root Cause

**Yahoo Fantasy API limitation:**
- API does not preserve original playoff seeding information
- Only tracks final placement after playoffs complete
- The `playoff_seed` field (when present) mirrors `rank`, not entry seed

**Evidence:**
- Checked 8 different years (2010-2024)
- Every champion has `playoff_seed: 1`
- Every last place has `playoff_seed: 12`
- No variation in playoff_seed values

## Solutions Evaluated

### Option 1: Extract Regular Season Standings ✓ VIABLE
**Approach:** Query standings at end of regular season (week 15) before playoffs start
- Top 4 teams = playoff seeds #1-#4
- Requires additional API call per year
- Accurate for all historical years

**Implementation:**
```python
# Get regular season standings (week 15, before playoffs)
regular_season_standings = query.get_league_standings()  # at week 15?
# OR
# Check team records in week 15 matchups
```

**Question:** Can `get_league_standings()` be called for specific weeks, or does it only return final standings?

### Option 2: Infer from Regular Season Record ⚠️ APPROXIMATE
**Approach:** Sort teams by wins/losses to estimate seeding
- Simple: `sorted(teams, key=lambda t: (-t['wins'], t['losses']))`
- May be incorrect due to tiebreakers (points, head-to-head, etc.)
- Better than nothing, but not 100% accurate

### Option 3: Manual Override ⚠️ MAINTENANCE BURDEN
**Approach:** Add manual seed data to script for historically known cases
```python
MANUAL_SEEDS = {
    2023: {"champion_seed": 2},  # If we know champion was #2 seed
    2019: {"champion_seed": 3},
}
```
- Only works if Gary/users provide historical data
- Requires maintenance
- Not scalable

### Option 4: Skip Feature ✗ NOT ACCEPTABLE
Gary specifically requested this, indicating he knows some champions were lower seeds.

## Next Steps

1. **Test if week-specific standings are available:**
   - Try `query.get_league_standings()` with week parameter
   - Check yfpy documentation for historical standings API

2. **Implement regular season standings extraction:**
   - Modify `extract.py` to capture pre-playoff standings
   - Store in separate field: `regular_season_standings` or `playoff_seeds`
   - Map top 4 teams to seeds #1-#4

3. **Update build script:**
   - Use regular season rank as `playoff_seed` instead of final rank
   - Fall back to inference if regular season data unavailable

4. **Verify with Gary:**
   - Ask which years had upset champions (lower seeds winning)
   - Validate our approach produces correct seeds for those years

## Files Modified (WIP)

- `scripts/extract.py` - Added incorrect playoff_seed logic (lines 124-128) - **NEEDS REVERT**
- `scripts/build_data_js.py` - Uses playoff_seed from JSON (correct, but data is wrong)
- `data.js` - Generated with incorrect playoff_seed values - **NEEDS REGENERATION**
- `index.html` - Display logic is correct (lines 826-843)

## Test Scripts Created

- `/tmp/test_playoff_matchups.py` - Tests week 16 playoff matchup data
- `/tmp/test_league_settings.py` - Extracts league playoff configuration

## References

- yfpy GitHub: https://github.com/uberfastman/yfpy
- Yahoo Fantasy API doesn't expose playoff bracket seeding directly
- Regular season standings must be extracted separately from final standings
