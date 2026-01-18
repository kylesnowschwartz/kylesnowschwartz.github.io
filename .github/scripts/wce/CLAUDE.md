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

Ensure you maintain the MANAGER_DISPLAY_NAMES pattern in @data.js which maps API data to display data.
