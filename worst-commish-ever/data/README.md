# League Data Structure

Each year directory contains JSON files with league data extracted from Yahoo Fantasy API.

## Directory Structure

```
data/
├── README.md
├── _schema.json          # Data schema reference
├── 2000/
│   ├── season.json       # Season metadata
│   ├── teams.json        # All teams + owners
│   ├── standings.json    # Final standings
│   ├── playoffs.json     # Playoff bracket + results
│   └── matchups.json     # Week-by-week scores (optional)
├── 2001/
│   └── ...
└── 2024/
    └── ...
```

## File Schemas

### season.json
```json
{
  "year": 2001,
  "game_id": 57,
  "league_id": "116317",
  "league_name": "Worst Commish Ever",
  "num_teams": 10,
  "playoff_start_week": 14,
  "champion_team_id": "1",
  "sacko_team_id": "8"
}
```

### teams.json
```json
{
  "teams": [
    {
      "team_id": "1",
      "team_name": "Team Name",
      "owner_name": "Owner Name",
      "owner_nickname": "Nickname"
    }
  ]
}
```

### standings.json
```json
{
  "final_standings": [
    {
      "rank": 1,
      "team_id": "1",
      "team_name": "Champion Team",
      "owner_name": "Winner",
      "wins": 12,
      "losses": 2,
      "ties": 0,
      "points_for": 1850.5,
      "points_against": 1420.3,
      "playoff_seed": 1
    }
  ]
}
```

### playoffs.json
```json
{
  "bracket": {
    "championship": {
      "team_1": { "team_id": "1", "score": 142.5 },
      "team_2": { "team_id": "3", "score": 128.2 },
      "winner": "1"
    },
    "third_place": { },
    "consolation": { },
    "sacko": {
      "team_1": { "team_id": "8", "score": 85.2 },
      "team_2": { "team_id": "10", "score": 92.1 },
      "loser": "8"
    }
  }
}
```

### matchups.json (optional - large file)
```json
{
  "weeks": [
    {
      "week": 1,
      "matchups": [
        {
          "team_1": { "team_id": "1", "score": 125.4 },
          "team_2": { "team_id": "2", "score": 118.7 }
        }
      ]
    }
  ]
}
```

## Manager Photos

Photos stored in `../images/managers/` with filename matching owner:

```
images/managers/
├── john-smith.jpg
├── mike-jones.jpg
└── ...
```

Reference in teams.json:
```json
{
  "team_id": "1",
  "team_name": "Team Name",
  "owner_name": "John Smith",
  "owner_photo": "john-smith.jpg"
}
```

Photo specs:
- Format: JPG or PNG
- Size: ~200x200px (square crop for display)
- Naming: lowercase, hyphenated (e.g., `john-smith.jpg`)

## Priority Data

For the website, we primarily need:

1. **Champion by year** → Championship Baseball section
2. **Final standings** → Dream Teams historical records
3. **Sacko/last place** → Wall of Shame section
4. **Team names + owners** → Dream Teams roster

Weekly matchups are nice-to-have for stats but not required initially.
