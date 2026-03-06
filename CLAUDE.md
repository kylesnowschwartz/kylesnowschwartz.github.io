# kylesnowschwartz.github.io

Multi-project repo: personal site, playgrounds, and experiments.

## Projects

| Path | Description |
|------|-------------|
| `/src/pages/index.astro` | Personal site (warm CRT / vacuum tube aesthetic) |
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

## Visual Design Identity: Warm CRT / Vacuum Tube

The personal site evokes the warmth and tactile quality of vintage electronics -- the soft orange glow of vacuum tubes through chassis vents, the hum of warming capacitors, Bakelite knobs and phosphor screens.

### Design Principles

- **Warm chassis, clean screens**: Textured warm background (the "enclosure"), with clean opaque content surfaces (the "display windows")
- **Single signature technique**: Texture layering borrowed from Stagehand.dev's approach -- small tiling images + CSS gradients composited at low opacity
- **Warmth over coolness**: Every neutral leans warm (cream, stone, brown-black) rather than cool (blue-gray, navy)

### Texture System

Two layers on `body` pseudo-elements, behind content (`z-index: 0`):

| Layer | File/Method | Purpose |
|-------|-------------|---------|
| `body::before` | `/textures/diagonal-tile.webp` tiling at 68px | Diagonal line texture (chassis weave) |
| `body::after` | `/textures/noise-tile.webp` tiling at 97px | Phosphor grain noise |

Content surfaces sit above via `body > * { position: relative; z-index: 1 }`.

### Direction (in progress)

Base palette uses warm stone tones (defined in `src/styles/global.css` `:root`). The neon accents predate the vacuum tube direction and will evolve toward ambers, warm oranges, and muted reds -- tube filament glow, warm dust, manual tuning dials, 1940s-70s consumer electronics.

### Reference: Stagehand.dev Techniques

- **Texture tiles**: Small WebP images (< 10KB) tiling via `background-repeat` create organic surfaces
- **Mismatched tile sizes**: Different layer sizes prevent visible repeat patterns
- **Opacity as the tuning knob**: Bake contrast into tiles, control intensity via CSS opacity
- Stagehand's identity comes from `border-dashed` everywhere -- ours comes from the warm texture system

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



