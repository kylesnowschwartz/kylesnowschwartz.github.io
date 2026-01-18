# Contributing League Data

We're missing data for some years (2005, 2007-2009). If you were in the league during those years, you can help!

## Prerequisites

1. [Install uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)
2. Get the API key from Kyle

## Steps

```bash
# Clone the repo
git clone https://github.com/kylesnowschwartz/kylesnowschwartz.github.io.git
cd kylesnowschwartz.github.io/worst-commish-ever

# Run the contribution script (Kyle will give you the key/secret)
uv run scripts/contribute.py --key YOUR_KEY --secret YOUR_SECRET

# First run will open a browser - log in with your Yahoo account
# Script will discover your leagues and extract any missing years

# Commit and push
git add data/
git commit -m "feat: add YYYY league data"
git push
```

## What the Script Does

1. Opens browser for Yahoo login (first time only)
2. Scans all years (2005-2025) for leagues you're a member of
3. Extracts data for any years we don't already have
4. Saves to `data/YEAR/season.json`

## Questions?

Ask Kyle.
