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
├── index.html          # Main site (single page)
├── css/
│   └── style.css       # All styles
├── img/                # Images
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

If you need to regenerate the ASCII banner:

```bash
# Install figlet (macOS)
brew install figlet

# Generate options
figlet -f banner "KYLE"
figlet -f slant "KYLE"
figlet -f block "KYLE"

# List available fonts
figlet -l
```

Current banner uses "ANSI Shadow" style (manually crafted).

## Legacy Files

The following files are from the old site and can be removed once the redesign is complete:

- `about.html`
- `contact.html`
- `css/main.css`
- `css/normalize.css`
- `css/responsive.css`
- `jquery.js`

Keep `marmitegasm/` - it's a standalone project.
