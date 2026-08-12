Overlays, popups, dropdowns, and other interactive features for images or media should follow the HERO_POPUPS approach eg

HTML: Single empty container (line 767)
<div class="popup-overlay" id="popup-overlay"></div>

To add a popup anywhere, just add data attributes to any element:
<span data-popup-src="images/photo.jpg" data-popup-title="caption">Click me</span>

For heroes, add entries to HERO_POPUPS (line 837-839):
const HERO_POPUPS = {
  'Gary': { src: 'images/Gary-Claude-Van-Damme.jpg', title: 'gary.jpg' },
  'Kyle': { src: 'images/some-other.jpg', title: 'kyle.jpg' }  // just add more
};

---

Yahoo's nicknames are mapped to display names in the `identities` list in
`src/data/wce-corrections.json`. Each entry names the person, the Yahoo nickname, and
optionally the teams that scope it, which is how two managers sharing one nickname are
told apart. `src/data/wce-seasons.generated.ts` is derived from the extracts plus that
file and is never edited by hand — change the corrections and run `npm run wce:data`.
