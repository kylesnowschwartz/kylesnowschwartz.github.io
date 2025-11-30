# Kyle Snow Schwartz - Personal Site Redesign

## Design Direction

**Aesthetic**: Retro-futuristic meets Scandi-minimalism on a light theme

The tension here is intentional: most retro-futurism goes dark (neon glows on black). We're inverting that - using sharp monospace typography and ASCII art as the retro element against a warm, minimal Scandinavian background.

### Key Principles

1. **Typography as the retro element** - Figlet ASCII banner, monospace project list
2. **Light, warm background** - Off-white (`#faf9f7` or similar)
3. **Minimal chrome** - Border-based dividers, generous whitespace
4. **Subtle texture** - Optional scanlines or grain (very light)
5. **Single accent color** - TBD (considering teal, coral, or classic red)

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ██╗  ██╗██╗   ██╗██╗     ███████╗                          │
│   ██║ ██╔╝╚██╗ ██╔╝██║     ██╔════╝                          │
│   █████╔╝  ╚████╔╝ ██║     █████╗                            │
│   ██╔═██╗   ╚██╔╝  ██║     ██╔══╝                            │
│   ██║  ██╗   ██║   ███████╗███████╗                          │
│   ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝                          │
│                                                              │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  PROJECTS  │   ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│            │   │  WHO    │  │  WHAT   │  │  WHERE  │        │
│  > marmite │   │         │  │         │  │         │        │
│  > thing2  │   │         │  │         │  │         │        │
│  > thing3  │   └─────────┘  └─────────┘  └─────────┘        │
│            │                                                 │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

### Desktop Layout

- **Full-width header**: ASCII figlet banner of "KYLE" (or full name)
- **Left column** (~200px): Vertical project navigation with terminal-style `>` prefixes
- **Right area**: 3-panel "about me" grid

### Mobile Layout

- Banner (scaled down or simplified)
- Projects (horizontal scroll or accordion)
- About panels (stacked single column)

---

## Typography

### Fonts (from frontend-design-pro guidelines - NO generic fonts)

- **Display/ASCII**: `Share Tech Mono` - monospace with character
- **Body**: `Instrument Sans` - clean, modern sans-serif
- **Optional accent**: `Newsreader` - elegant serif for quotes or emphasis

### Hierarchy

- Figlet banner: ASCII art (pre-rendered)
- Section headers: Monospace, uppercase, small
- Body text: Sans-serif, comfortable reading size
- Project links: Monospace with `>` prefix

---

## Color Palette

### Base (Scandi-minimal light theme)

```css
--color-bg: #faf9f7;        /* Warm off-white */
--color-text: #1a1a1a;      /* Near-black */
--color-text-muted: #666666; /* Secondary text */
--color-border: #e5e5e5;    /* Subtle dividers */
```

### Accent (TBD - options)

- Classic red: `#e53935`
- Teal: `#0d9488`
- Coral: `#f97316`

---

## Components

### 1. Figlet Banner

Pre-rendered ASCII art. Options to generate:

```bash
# Using figlet CLI
figlet -f banner "KYLE"
figlet -f slant "KYLE"
figlet -f block "KYLE"
```

Current candidate (ANSI Shadow font):

```
██╗  ██╗██╗   ██╗██╗     ███████╗
██║ ██╔╝╚██╗ ██╔╝██║     ██╔════╝
█████╔╝  ╚████╔╝ ██║     █████╗
██╔═██╗   ╚██╔╝  ██║     ██╔══╝
██║  ██╗   ██║   ███████╗███████╗
╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝
```

### 2. Project Navigation

Vertical list with terminal aesthetic:

```
PROJECTS
─────────
> marmitegasm
> project-two
> project-three
```

Hover state: accent color, slight indent

### 3. About Panels

Three equal-width boxes:

| Panel | Content Type | Placeholder |
|-------|--------------|-------------|
| WHO   | Bio text     | TBD         |
| WHAT  | Skills/work  | TBD         |
| WHERE | Location/contact | TBD    |

---

## Technical Notes

### No Build System

Plain HTML + CSS. No frameworks, no bundlers, no npm. This is a personal site, not a SaaS product.

### File Structure

```
/
├── index.html          # Single page site
├── css/
│   └── style.css       # All styles (replaces old multi-file setup)
├── img/                # Keep existing images
├── marmitegasm/        # Existing project (preserved)
├── CLAUDE.md           # Dev instructions
├── SPECIFICATION.md    # This file
└── README.md           # Existing
```

### Browser Support

Modern browsers only. No IE11, no ancient Safari. Use CSS Grid, custom properties, etc.

---

## Open Questions

1. **Accent color**: Red, teal, or coral?
2. **About panel content**: What goes in WHO/WHAT/WHERE?
3. **Additional projects**: What besides marmitegasm?
4. **Social links**: Any? Where to place them?
5. **Footer**: Needed? Minimal copyright line?

---

## Version History

| Version | Date       | Notes                          |
|---------|------------|--------------------------------|
| 0.1     | 2025-11-30 | Initial specification created  |
