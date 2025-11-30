# Kyle Snow Schwartz - Personal Site

## Quick Start

```bash
# Start local dev server (Python 3)
python3 -m http.server 8000

# Then open: http://localhost:8000
```

Alternative ports if 8000 is busy:

```bash
python3 -m http.server 8080
python3 -m http.server 3000
```

## Project Structure

```
/
├── index.html          # Main site (single page, styles inline)
├── ascii/              # ASCII art text files (loaded via JS)
│   ├── kyle.txt
│   ├── snow.txt
│   └── schwartz.txt
├── img/                # Images (legacy, kept for potential reuse)
├── marmitegasm/        # Standalone project
├── SPECIFICATION.md    # Design spec and decisions
└── CLAUDE.md           # This file
```

## Design Direction

Retro-futuristic + Scandi-minimalism + Light theme

See `SPECIFICATION.md` for full design documentation including:
- Layout structure (ASCII mockups)
- Typography choices
- Color palette
- Component specifications

## Development Notes

- **No build system** - Plain HTML/CSS, edit and refresh
- **No frameworks** - Vanilla everything
- **CSS custom properties** - All colors/sizes in `:root`
- **Mobile-first responsive** - Test at 320px, 768px, 1200px+

## Generating Figlet ASCII Art

ASCII art lives in `/ascii/*.txt` and is loaded via JS at runtime. To regenerate:

```bash
# Using rich-pyfiglet (via uvx)
uvx rich-pyfiglet "KYLE" --font ansi_shadow > ascii/kyle.txt
uvx rich-pyfiglet "SNOW" --font ansi_shadow > ascii/snow.txt

# Note: SCHWARTZ may need wider terminal or manual cleanup
COLUMNS=200 uvx rich-pyfiglet "SCHWARTZ" --font ansi_shadow > ascii/schwartz.txt

# List available fonts
uvx rich-pyfiglet --list
```

Current banner uses "ANSI Shadow" font with staggered indentation via CSS.
