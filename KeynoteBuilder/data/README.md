# Presentation Data

## Trelleborg workforce question

In `trelleborg.json`, the `workforce-2030-question` scene is headed
"What Will Your Workforce Look Like in 2030". The Human Workforce and Digital
Workforce blocks reveal together three seconds after scene activation, fading
and rising into view. Returning to the scene restarts the delay. Reduced-motion
mode keeps the three-second delay but shows the blocks without movement or fading.
The timing is scoped to `trelleborg.html` in `../styles/agentstory.css`.

## Saab Digital Agency: opening directly

Double-click `../saab-agency.html` to open it without a local web server.
Keep the `data`, `scripts`, `styles`, and `assets` folders alongside the HTML
file. Local files load the generated `saabagency.js` through a classic script
instead of fetching JSON, which browsers block on `file://` URLs.
HTTP/HTTPS continues to load `saabagency.json` directly.

`saabagency.json` remains the content source. After editing it, regenerate the
local-file copy from the project root:

```sh
node scripts/build-saab-local-data.cjs
node scripts/build-saab-local-data.cjs --check
```

The check exits with an error if the local-file copy is missing or stale.
Other JSON-backed presentations still require HTTP unless they configure a
local script copy as well. External integrations still need internet access.

## Why AI. Why now.

Open `../why-ai-why-now.html` over HTTP. Its separate scene data is
`why-ai-why-now.json`. The 24 scenes cover all 22 source slides; source slides 9
and 14 each receive an additional scene for the 10/20/70 heuristic and the
three operating modes. Every scene records `sourceSlide`, commentary and a
leadership takeaway.

`../scripts/why-ai-why-now.js` validates and renders the deck-specific `visual`
objects. `../styles/why-ai-why-now.css` provides the visual treatments, on top
of the existing Clawpilot theme. An opt-in `window.KEYNOTE_DECK` configuration
selects the data URL, scene types, validator and renderer before loading
`../scripts/ai-curve.js`; the original AI Curve defaults remain unchanged.

Visuals include milestone columns, cost compression, adoption lanes, forecast
columns, indexed comparisons, an allocation ribbon, study evidence, rings,
human-directed agent flows, respondent dot fields, paired outcomes, an agent
constellation, before/after lanes, a jobs waterfall and a proportional agenda.
All factual values, labels, source links, caveats and commentary live in JSON.
Each case-study lane has its own baseline; Ecolab's range and upper bound are
preserved. The jobs projection covers all macrotrends, not AI alone.

The same desktop controls and reduced-motion behavior described below apply.
The six-act map and agenda support direct scene jumps. Hover or keyboard-focus
visual data for context. Deep links use `why-ai-why-now.html?scene=3`.
References are split across two readable scenes. Figures and source URLs are
transcribed from the supplied deck, not independently reverified; source-deck
legal timing is not presented as compliance guidance.

## The AI Curve

Open `../ai-curve.html` over HTTP. Its content is in `ai-curve.json`; rendering and
desktop controls are isolated in `../scripts/ai-curve.js` and `../styles/ai-curve.css`.
The existing presentations and admin defaults are unchanged.

`ai-curve.json` uses the same canonical structure as `masterstory.json`:
`meta`, `controls`, `videos`, `commentary`, and `scenes`. Each scene has `id`,
`enabled`, `className`, `videoConfig`, `builds`, `markup`, `section`, and `chapter`.
Presenter commentary is keyed by a unique scene CSS class, with `label`, `title`,
`paragraphs`, and `takeaway`. It can be imported directly into Keynote Admin.
Importing changes that admin's local draft, just like importing any other deck.

The standalone HTML loads and validates the file through `PresentationStore`.
It deliberately uses the checked-in JSON, not the main keynote's browser-local
override, so importing a different deck into the admin cannot replace this page.
Enabled scenes alone determine navigation and numbering.

Scene `markup` is the content source. The chapter map and references are now
ordinary scene markup, not separate top-level collections. Chart containers
retain their responsive plotting definition in an HTML-escaped `data-chart`
attribute, alongside the SVG used by static previews; change both when editing
chart data for both runtime and static-preview use. `data-curve-type` selects
the existing chart treatment. Scoped `../styles/ai-curve-scenes.css` is shared
with the standalone page and linked from the scene markup, so imported scenes
also render inside the existing keynote and admin preview without restyling
unrelated scenes.

The 20 scenes cover all 17 source slides. Source slide 7's two demand charts and
slide 15's three platform panels each get individual scenes. `data-source-slide`
on each root section records the mapping; chapter-map buttons link by scene ID.
Each chart declares its own domains, tick labels, series, source, and caveat. Series points are
`[x, y, optionalTooltip]`; points must increase in x and stay inside their domains.
Do not fill missing observations with zero. Logarithmic charts use `log: true`.
`forecastFrom` marks the final actual point; subsequent segments are dashed.
`breakConnection` suppresses a connecting line across a definition change.

Figures are transcribed from the supplied deck, not independently verified.
Intermediate observations recovered from source geometry are rounded. Smooth
curves guide the eye; they do not represent additional observations or forecasts.
The source's survey-definition changes, different populations, overlapping usage
groups, and guidance are explicitly distinguished in the scenes and commentary.

Desktop controls: arrows / Space / Page Up / Page Down to navigate, Home / End,
**R** to replay, **C** for commentary, **O** for the scene index, **T** for
light/dark, **F** for fullscreen, and Escape to dismiss overlays. The mouse wheel
also navigates. Hover or keyboard-focus chart points for values. Reduced-motion
preferences are respected. Deep links use `ai-curve.html?scene=3`; theme overrides
use `&scoutTheme=dark` or `&scoutTheme=light`.

`masterstory.json` is the content and configuration source for `../keynote.html` and the admin defaults.

## Common edits

- Change the browser title, language, default palette, or reactions integration under `meta`.
- Change navigation timing and thresholds under `controls`.
- Change video sources and playback behavior under `videos`.
- Change presenter notes under `commentary`.
- Reorder scene objects in `scenes` to reorder the deck.
- Set a scene's `enabled` value to `false` to remove it from navigation and numbering.
- Edit a scene's `markup` value to change its visible content or media.

The runtime assigns scene numbers from the enabled scene order. Do not store or manually update scene numbers in the data. The current data contains 64 scenes: 20 enabled and 44 disabled.

The final 15 disabled scenes form the staged `agent` chapter. Their markup, content, enabled state, and commentary now live directly in `masterstory.json`. Agent-specific markup is styled by `../styles/agentstory.css`, while `keynote.js` remains the only presentation runtime.

Open `keynote.html?agentPreview=1&scene=21` to review the staged chapter without enabling or persisting it. In preview mode, the 15 agent scenes follow the normal 20-scene keynote sequence.

Scene asset URLs are relative to `../keynote.html`, so keynote-local assets begin with `assets/`.

Except for the Saab page's generated local-file copy described above, serve the repository over HTTP because browsers do not allow `fetch()` to load JSON reliably from a `file://` URL.

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/keynotes/keynote.html`.

## Keynote Admin

### Palettes

Available palettes are `keynote` (pink), `workscape` (olive/lime in dark mode), and `blue` (blue accents with navy dark-mode backgrounds and cool light-mode surfaces). Existing presentation defaults are unchanged.

Choose **Blue** in the admin's **Default palette** selector, or set `"defaultPalette": "blue"` under `meta` in the relevant presentation JSON. Use `keynote.html?palette=blue` for a temporary override; add `&scoutTheme=light` to see its light variant. During the keynote, **T** cycles Keynote, Workscape, Blue, then back to Keynote. Palette selection carries through navigation to `agency.html` and back.

Blue uses the existing moving particle renderer and its existing reduced-motion preference behavior; it does not replace the background with a static image. Colors are defined in `../styles/keynote.css` and mirrored in the standalone `../agency.html` styles. Adding a future palette also requires updating the admin choices, keynote cycling list, and agency's accepted palette list.

### Editing

Open `admin.html` from the same local HTTP server to manage presentation settings, videos, and scenes. Use the navigation toggle to collapse the compact sidebar to icons.

The admin supports scene enable/disable, ordering, duplication, deletion, guided metadata editing, raw scene markup editing, and an isolated scene preview. Drag a scene by its grip onto the top or bottom half of another row to place it before or after that scene, including in filtered search results. The move-up/down buttons remain available for keyboard and touch use. Deletion requires confirmation and cannot remove the last enabled scene.

Scene markup is collapsed by default; expand **Scene markup** to edit it. Previews scale a 1600 × 900 desktop canvas to fit the editor, load both keynote and agent-scene styles, and show the final animation/build state. Preview markup runs without scripts; live runtime-only interactions are available in the keynote itself. Use **Refresh preview** to reload media and styles.

Valid changes save automatically in this browser. The keynote gives that browser-local override precedence over `masterstory.json`; if the override becomes invalid or corrupted, the keynote ignores it and falls back to the checked-in JSON. Invalid edits in the admin remain visible for correction but never replace the last valid saved presentation.

Use **Export** to download the effective configuration as `masterstory.json`. Replace `data/masterstory.json` with that exported file when the changes should become source-controlled deployment defaults or apply in other browsers. Use **Import** to validate and load a JSON configuration, or the reset control to remove the browser override and return to the checked-in defaults.

Browser-local changes are not authenticated, synchronized across devices, or published to a server. Run the admin only in a trusted editing environment.

An older browser-local override can predate newly merged source scenes. Reset the admin override before reviewing a fresh `masterstory.json`, then enable the staged agent scenes only in the local draft when testing them.