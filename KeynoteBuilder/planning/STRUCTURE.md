# Keynote Structure

## Runtime files

| Path | Responsibility |
| --- | --- |
| `../keynotes/keynote.html` | Minimal accessible application shell |
| `../keynotes/` | Keynote entry points, including audience-specific and reference subfolders |
| `../admin/admin.html` | Browser-local presentation editor |
| `../data/masterstory.json` | Presentation content, scene order, enabled state, notes, videos, and timings |
| `../styles/keynote.css` | Visual system, layouts, motion, and responsive behavior |
| `../scripts/keynote.js` | JSON loading, rendering, navigation, builds, video playback, and commentary |

## Data flow

1. The HTML entry point applies the preferred theme and loads the stylesheet and deferred runtime.
2. `keynote.js` loads `masterstory.json` through `presentation-store.js`.
3. Enabled scene markup is rendered in JSON order.
4. Navigation, builds, commentary, videos, and progress bind to the rendered scenes.

HTML entry points reference shared scripts, styles, and shell images relative to
their own folder. The shared runtime resolves presentation data and embedded
`assets/` and `styles/` URLs against the project root, derived from the runtime
script's URL. Keep content URLs in JSON project-root-relative; moving an HTML
entry point does not require rewriting its scene content. Fragment-only SVG
references remain local to the document.

Serve the project root over HTTP for JSON-backed keynotes. Only the Saab keynote
also supports opening directly via `file://`, using its generated local data.

`keynote.html` uses the data-driven runtime, with browser-local admin overrides layered over `masterstory.json` when valid.