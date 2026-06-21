# kylesnowschwartz.github.io

Multi-project repo: personal site, playgrounds, and experiments.

## Projects

| Path | Description |
|------|-------------|
| `/src/pages/index.astro` | Personal site (warm CRT / vacuum tube aesthetic) |
| `/src/pages/marmiteroids/` | Marmiteroids - Interactive 3D art piece |
| `/src/pages/worst-commish-ever/` | GeoCities-style fantasy football site |
| `/src/pages/reading-list/` | Reading list ("mental library"); data synced from the external `shelf` repo |

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

Content surfaces sit above via `body > *:not(.bg-layers) { position: relative; z-index: 1 }` -- the homepage's `.bg-layers` composition is the one exception, staying at `z-index: 0` with the textures. The homepage also dials `body::before` down to 0.035 (via a `body.home` rule) because its `.bg-layers` carry the diagonal weave locally; other pages keep 0.1. Note: only `index.astro` imports `global.css`, so these layers/textures are homepage-only.

### Direction (in progress)

Base palette uses warm stone tones (defined in `src/styles/global.css` `:root`). The neon accents predate the vacuum tube direction and will evolve toward ambers, warm oranges, and muted reds -- tube filament glow, warm dust, manual tuning dials, 1940s-70s consumer electronics.

### Reference: Stagehand.dev Techniques

- **Texture tiles**: Small WebP images (< 10KB) tiling via `background-repeat` create organic surfaces
- **Mismatched tile sizes**: Different layer sizes prevent visible repeat patterns
- **Opacity as the tuning knob**: Bake contrast into tiles, control intensity via CSS opacity
- Stagehand's identity comes from `border-dashed` everywhere -- ours comes from the warm texture system

## Layout System: Making & Breaking the Grid (φ)

The personal-site homepage layout is governed by one principle, chosen after exploring four golden-ratio compositional systems (dynamic symmetry, manuscript canon, Swiss modular grid, and this one): **establish a rigorous φ grid as the law of the page, then break it exactly once for the single most important element.** A break only reads as deliberate when everything around it is disciplined; this is the antidote to the earlier "accidentally placed" problem, where negative-margin nudging made blocks feel arbitrary. The reference is Timothy Samara, _Making and Breaking the Grid_.

### Rules (in priority order)

1. **One grid, shared lines.** A single 13-column grid (`repeat(13, 1fr)`, 13 is Fibonacci so column ratios land on φ). One gutter everywhere: `--col-gap: var(--s3)` (21px). Folds land on Fibonacci splits (each ≈ φ): **line 6** (sidebar : content = 5 : 8), **line 11** (what : where = 5 : 3), **line 9** (know : believe = 8 : 5); blocks also share the container edges (lines 1 and 14). Never nudge with negative margins — place by `grid-column` span only.
2. **Hierarchy drives span.** Higher-priority content gets a wider span / earlier reading position. Order: Identity (loudest) → Narrative (Who/What) → Proof (Projects/What I know) → Supporting (What I believe/Where/contact).
3. **One authored break.** The tier-1 identity (ASCII wordmark) is the _only_ element permitted to violate the grid — it goes full-bleed past the container's right edge while its left edge stays pinned to grid line 1, so it is anchored to the system even as it overruns it. The break crosses the same `1/φ` fold the body obeys. A thin accent edge marks the boundary it crossed, making the violation legible rather than accidental.
4. **Breaks need a grid to break.** Below ~900px every block collapses to a single column and the break retracts (wordmark returns inside the container). No grid → no break.
5. **Spacing is the φ/Fibonacci scale only.** `--s0..--s7` = 5,8,13,21,34,55,89,144. Row gap `--s5`, section rhythm `--s6`/`--s7`.

### Reference implementation

`.agent-history/redesign-D-broken-grid.html` is the approved mockup and the source of truth for the grid spec, placements, and the `.ascii-bleed` break. All brand tokens, fonts, texture, neon hover accents, gradient bar, ASCII banner, and the joke tagline (see below) are reused verbatim — the layout system never changes the identity kit.

### Deferred idea: Marmiteroids "canvas" / playground

A dedicated Marmite canvas cell (`#marmite-jar`) is **not** yet decided. The jar identity is already carried by the background click-to-spawn shooter (`/scripts/background-jars.js`) and the spinning sidebar jar. Kyle likes the idea of a "canvas"/playground panel but it is unformed — revisit _after_ the layout refactor lands, as an enhancement, not part of the initial layout work.

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

---

## Reading List (data synced from the external `shelf` repo)

`/reading-list` is a filterable map of books Kyle has read. This repo renders it from two
**committed copies** owned by the external `shelf` engine:
- `src/data/books.json` — the read shelf. An Astro content collection + Zod schema in
  `src/content.config.ts` validates it at build (git-as-DB — a bad genre fails `astro sync`).
- `src/lib/recommend.ts` — the pure ranking model (shared with the page's client-side filters).

**Both are derived, not authored here.** The `shelf` repo (`../shelf`, separate git repo) is
the source of truth and the only writer. After Kyle changes the shelf, `shelf export` writes
byte-identical copies into this repo's `src/data/` and `src/lib/`; committing them deploys the
update. **Never hand-edit these two files** — the next `shelf export` overwrites them.

The full recommendation engine — `add`/`fetch`/`embed`/`build`/`next`/`profile`/`retrieve` and
the agent usage contract (`AGENTS.md`) — now lives in the `shelf` repo. The Claude Code driver
`.claude/skills/shelf-skill/` (local, git-ignored) runs `shelf` from there, not from this repo.

---

Read HYPERRESEARCH.md to understand how to use the /hyperresearch deep-research protocol


