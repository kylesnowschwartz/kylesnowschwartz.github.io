# CV Page

Print-first HTML/CSS pipeline that renders Markdown content to match Google Docs PDF output.

## Architecture

```
src/
├── content/cv/
│   └── kyle-snow-schwartz.md    # Content source (Markdown + HTML)
├── components/cv/
│   ├── CVHeader.astro           # Header with scoped styles
│   ├── ViewModeToggle.astro     # Mode switcher (HTML/Markdown/PDF)
│   └── MarkdownViewer.astro     # Raw source display
├── pages/cv/
│   └── index.astro              # Page shell, imports cv.css
└── styles/
    └── cv.css                   # Global print-first styles
```

## Gotchas

### `:global()` Only Works in Astro Components

`:global()` is Astro's syntax for escaping scoped styles. It only works in `<style>` blocks within `.astro` files.

```css
/* WRONG - in cv.css (regular CSS file) */
.cv-content :global(.career-entry) { display: flex; }

/* CORRECT - in cv.css */
.cv-content .career-entry { display: flex; }

/* CORRECT - in Component.astro <style> block */
.wrapper :global(.child-from-markdown) { color: blue; }
```

### Dev Server CSS Caching

If CSS changes don't appear, restart the dev server:
```bash
pkill -f "astro dev" && npm run dev
```

### Tables vs Flexbox for Date Alignment

Tables with `width: 100%` fight you on column widths. Use flexbox instead:

```html
<!-- In Markdown content -->
<div class="career-entry">
  <span class="role"><strong>Title</strong> – Company</span>
  <span class="date">Apr 2021 – Present</span>
</div>
```

```css
.career-entry {
  display: flex;
  justify-content: space-between;
}
.career-entry .date {
  flex-shrink: 0;      /* Won't compress */
  white-space: nowrap; /* Won't wrap */
}
```

### Two-Column Layouts

Use CSS Grid, not tables:
```css
.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16pt 32pt;
}
```

## Typography

Print-first settings that match Google Docs:
- Base font: 10pt
- Line height: 1.4
- Page padding: 48pt 56pt (~0.67in × 0.78in)
- Use `pt` units consistently

## Print/Screen Utility Classes

Tailwind-style utility classes for managing screen vs print presentation, without adding Tailwind as a dependency.

### Available Utilities

| Class | Effect |
|-------|--------|
| `print-hidden` | Hidden when printing |
| `screen-hidden` | Hidden on screen, visible in print |
| `print-p-0` | No padding in print |
| `print-m-0` | No margin in print |
| `print-mb-0` | No bottom margin in print |
| `print-text-sm` | Smaller text in print (9pt) |
| `print-break-inside-avoid` | Prevent page breaks inside element |
| `print-break-before-page` | Force page break before element |
| `print-break-after-avoid` | Avoid page break after element |
| `print-shadow-none` | Remove shadows in print |
| `print-bg-transparent` | Transparent background in print |

### Usage Pattern

```html
<!-- Hide controls when printing -->
<div class="cv-controls print-hidden">

<!-- Show only in print (e.g., full URLs) -->
<span class="screen-hidden">https://example.com</span>
```

### When NOT to Use Utilities

Utility classes work best for **boolean toggles** and **common resets**. Keep component-specific sizing adjustments (arbitrary font sizes, precise margins) in scoped component styles.

```css
/* Good: utility class */
.print-hidden { display: none; }

/* Keep in component: arbitrary sizing */
@media print {
  h1 { font-size: 22pt; }  /* Not 24pt, specific to this component */
}
```

### Screen Enhancements

The CV has subtle visual polish on screen that's removed for print:
- Page background: `var(--cv-bg-muted)` (slate-50)
- Document shadow and border-radius
- Extra padding around the document

## Print Checklist

- `@page { size: A4; margin: 0.4in 0.6in; }` (tight margins, browser adds chrome)
- `break-inside: avoid` on sections (with `page-break-inside` fallback)
- `-webkit-print-color-adjust: exact` for colors
- Use `print-hidden` utility for UI controls
- Test with Cmd+P print preview

### Browser Print Settings (Critical!)

**The date/URL/page numbers are browser headers/footers, not CSS.**

To get clean PDF output matching Google Docs:

**Chrome/Edge:**
1. Cmd+P (or Ctrl+P)
2. Click "More settings"
3. Uncheck "Headers and footers"
4. Set Margins to "Default" or "None"

**Safari:**
1. Cmd+P
2. Click "Show Details"
3. Uncheck "Print headers and footers"

**Firefox:**
1. Cmd+P
2. More settings → uncheck "Print headers and footers"

Without disabling browser headers/footers, you'll see:
- `localhost:4321/cv` (URL)
- `1/19/26, 3:33 PM` (date)
- `Kyle Snow Schwartz - CV` (page title)
- `1/3` (page numbers)

These consume ~0.4-0.5 inches per page, pushing content and causing extra pages.
