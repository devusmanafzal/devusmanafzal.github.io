# Keynote Structure

## Runtime files

| Path | Responsibility |
| --- | --- |
| `../keynote.html` | Minimal accessible application shell |
| `../data/masterstory.json` | Presentation content, scene order, enabled state, notes, videos, and timings |
| `../styles/keynote.css` | Visual system, layouts, motion, and responsive behavior |
| `../scripts/keynote.js` | JSON loading, rendering, navigation, builds, video playback, and commentary |

## Data flow

1. The HTML entry point applies the preferred theme and loads the stylesheet and deferred runtime.
2. `keynote.js` loads `masterstory.json` through `presentation-store.js`.
3. Enabled scene markup is rendered in JSON order.
4. Navigation, builds, commentary, videos, and progress bind to the rendered scenes.

`keynote.html` uses the data-driven runtime, with browser-local admin overrides layered over `masterstory.json` when valid.