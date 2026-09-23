# Presentation Data

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

Serve the repository over HTTP because browsers do not allow `fetch()` to load JSON reliably from a `file://` URL.

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/keynotes/keynote.html`.

## Keynote Admin

Open `admin.html` from the same local HTTP server to manage presentation settings, videos, and scenes. The admin supports scene enable/disable, ordering, duplication, guided metadata editing, raw scene markup editing, and an isolated scene preview.

Valid changes save automatically in this browser. The keynote gives that browser-local override precedence over `masterstory.json`; if the override becomes invalid or corrupted, the keynote ignores it and falls back to the checked-in JSON. Invalid edits in the admin remain visible for correction but never replace the last valid saved presentation.

Use **Export** to download the effective configuration as `masterstory.json`. Replace `data/masterstory.json` with that exported file when the changes should become source-controlled deployment defaults or apply in other browsers. Use **Import** to validate and load a JSON configuration, or the reset control to remove the browser override and return to the checked-in defaults.

Browser-local changes are not authenticated, synchronized across devices, or published to a server. Run the admin only in a trusted editing environment.

An older browser-local override can predate newly merged source scenes. Reset the admin override before reviewing a fresh `masterstory.json`, then enable the staged agent scenes only in the local draft when testing them.