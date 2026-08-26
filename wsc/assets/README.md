# Presentation Assets

`images/executive-collaboration.jpg` is a 2400 x 1600 JPEG used by the cinematic Promptathon scene.

Source: [fauxels on Pexels](https://www.pexels.com/photo/people-sitting-at-the-table-with-laptop-3184291/) under the [Pexels License](https://www.pexels.com/license/).

To replace it, keep the same filename or update the image path in `index.html`. Use an image at least 2400 px wide with the main subject near the center-right; the scene applies a full-bleed 16:9 crop and a slow zoom-out.

## Video playback

`videos/open-the-door-X.mp4` is configured as the full-bleed physical scene 16 while the Microsoft AI Stack scene is hidden. Large local videos should be presented through an offline localhost server rather than by double-clicking `index.html`:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. This needs no internet connection and allows reliable streaming and seeking. The video starts when its scene becomes active, pauses and resets when leaving, and can be muted or unmuted with `M`.

VS Code's integrated browser may block autoplay with sound. When that happens, use the centered play control. Clicking directly on a video also toggles play and pause.

Set `videoBeforeScene13.enabled` in `../presentation.config.js` to control whether the scene renders. The same object controls source path, `cover`/`contain` fit, initial mute, looping, and caption text.

`videos/scout-intro.mp4` uses the same renderer at physical scene 4. Configure it independently through `scoutIntroAfterScene2` in `../presentation.config.js`.

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

## Microsoft AI Approach

`images/ms-approach-ai.png` is the presenter-supplied lower product image used in the Microsoft AI Approach scene. The upper Assistants, Delegates, and Autopilots framework is rendered natively in the keynote for projection clarity and responsive motion.

`logos-and-icons/copilot-studio.svg` is the official Copilot Studio product mark downloaded from the Microsoft Learn Copilot Studio documentation hub.

`logos-and-icons/github-copilot-color.svg` uses the official GitHub Copilot silhouette as the local mask for the blue-purple product mark shown in the architecture scene.

Scene 13 uses presenter-supplied product marks from `fabric.svg`, `foundry.svg`, `agent365.svg`, and `azure.png`.

## Multimodal capability icons

Scene 9 uses local SVG icons from [Lucide](https://lucide.dev/icons/) for text, images, voice, video, screens, and data. Lucide is distributed under the ISC License; attribution details are recorded in `credits.json`.

The Copilot strategy scene also uses local Lucide SVGs for Multi-Model, Multi-Harness, Platform, and Secure AI section marks.

## Live audience guide

- `images/live-reactions-phone.png` is a local audience-facing capture of the presenter-owned Live Reactions app at `https://usman-live.lovable.app`.
- `images/live-reactions-qr.png` encodes `https://usman-live.lovable.app` for the audience guide scene.
- `images/workscape-site-qr.png` encodes `https://aka.ms/workscape` for the experimental thank-you scene.
- `images/usman-linkedin-qr.png` encodes `https://aka.ms/usman` for the experimental thank-you scene.

## Model-provider icons

The multi-model scene uses local SVG marks from [Simple Icons](https://simpleicons.org/) for the ten providers represented around the orchestration orbit. The icon package is distributed under CC0 1.0; individual names and marks remain trademarks of their respective owners.
