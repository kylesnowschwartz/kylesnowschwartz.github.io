# kylesnowschwartz.github.io

Multi-project repo: personal site, playgrounds, and experiments.

## Projects

| Path | Description |
|------|-------------|
| `/src/pages/index.astro` | Personal site (retro-futuristic, Scandi-minimalism) |
| `/src/pages/marmiteroids/` | Marmiteroids - Interactive 3D art piece |
| `/src/pages/bumper-lanes/` | Bumper lanes landing page |
| `/src/pages/worst-commish-ever/` | GeoCities-style fantasy football site |

## Marmiteroids Architecture

Interactive 3D art piece - floating Marmite jars in infinite space using Three.js.

### Key Concepts

- **Scene**: White background, black 3D point grid (60k cube, spacing=1400) for depth
- **Jar Spawning**: Click spawns at fixed distance (5000); hold 800ms+ to shoot with velocity
- **Physics**: Boundary bounce (grid +-30000), jar-to-jar elastic collision
- **Performance**: Shared geometry/materials; handles 3000+ jars; O(n^2) collision is bottleneck

### Interactions

| Action | Result |
|--------|--------|
| Click | Spawn stationary jar |
| Hold 800ms + release | Shoot jar into space |
| Shift + click jar | Delete jar |
| Scroll/drag | OrbitControls camera |

## Development Notes

- **Mobile-first responsive** - Test at 320px, 768px, 1200px+

## ASCII Art Generation

```bash
uvx rich-pyfiglet "TEXT" --font ansi_shadow > ascii/output.txt
uvx rich-pyfiglet --list  # Available fonts
```

---

## Astrojs

Activate astro-dev skills for development before making changes to .astro files. Astrojs source code documentation lives in .cloned-sources/

---

## /worst-commish-ever

Fantasy Football League Site - A **1996 GeoCities-style website** for a 25-year fantasy football league. Peak nostalgia: tiled backgrounds, GIF navigation, tables for layout, `<font>` tags, the works.

Design spec extracted from Space Jam 1996: .agent-history/reverse-prompt-spacejam-1996.md



