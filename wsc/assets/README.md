# Presentation Assets

`images/executive-collaboration.jpg` is a 2400 x 1600 JPEG used by the cinematic Promptathon scene.

Source: [fauxels on Pexels](https://www.pexels.com/photo/people-sitting-at-the-table-with-laptop-3184291/) under the [Pexels License](https://www.pexels.com/license/).

To replace it, keep the same filename or update the image path in `index.html`. Use an image at least 2400 px wide with the main subject near the center-right; the scene applies a full-bleed 16:9 crop and a slow zoom-out.

## Video playback

`videos/open-the-door.mp4` is used as a full-bleed scene. Large local videos should be presented through an offline localhost server rather than by double-clicking `index.html`:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. This needs no internet connection and allows reliable streaming and seeking. The video starts when its scene becomes active, pauses and resets when leaving, and can be muted or unmuted with `M`.

## Presentation palette

Set the reusable default palette in `../presentation.config.js`:

- `palette: "workscape"` uses the organizer's sage, forest, and lime colors.
- `palette: "keynote"` uses the original rose accent.

For temporary testing, open `http://localhost:4173/?palette=workscape` or `http://localhost:4173/?palette=keynote`. Press `T` while presenting to compare both palettes live.

## Ending scenes

- `images/welcome-usman.png` is the transparent presenter portrait used on the thank-you scene.
- `images/workcircle-ending-scene.jpg` is the full-bleed event-owned final hold scene.

## Technology evolution timeline

Scene 5 build 3 uses six local historical images under `images/evolution/`. They are optimized for full-screen projection and animate rapidly from 1950 to 2020 before the sequence decelerates into abstract 2022-2026 milestones.

Sources and licenses:

- IBM 705 mainframe: Wolfgang Stief, CC0, Wikimedia Commons.
- IBM PC: Rama and Musee Bolo, CC BY-SA 2.0 FR, Wikimedia Commons.
- First Web Server: Coolcaesar, CC BY-SA 3.0, Wikimedia Commons.
- Nokia 3310: Michael Brandtner, public domain, Wikimedia Commons.
- Data center server racks: Carl Lender, CC BY 2.0, Wikimedia Commons.
- Office 360 digital workplace: Bill Smith, CC BY 2.0, Wikimedia Commons.

Full source URLs and license links are recorded in `credits.json`.
