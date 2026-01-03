# kylesnowschwartz.github.io

Multi-project repo: personal site, playgrounds, and experiments.

## Quick Start

```bash
python3 -m http.server 8000
# Open: http://localhost:8000
```

## Projects

| Path | Description |
|------|-------------|
| `/index.html` | Personal site (retro-futuristic, Scandi-minimalism) |
| `/marmiteroids/` | Asteroids game clone |
| `/bumper-lanes/` | Bumper lanes landing page |
| `/fantasy-league/` | GeoCities-style fantasy football site (WIP) |

## Development Notes

- **No build system** - Plain HTML/CSS, edit and refresh
- **No frameworks** - Vanilla everything
- **Mobile-first responsive** - Test at 320px, 768px, 1200px+

## ASCII Art Generation

```bash
uvx rich-pyfiglet "TEXT" --font ansi_shadow > ascii/output.txt
uvx rich-pyfiglet --list  # Available fonts
```
