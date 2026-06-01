# Career OS by Zero2Grow — Promotional Website

A self-contained, interactive single-page site to promote the **Career OS** program. Built with plain HTML, CSS, and JavaScript — no build step, no dependencies. Open it anywhere.

## Run it

Just open `index.html` in a browser. For the cleanest experience (and so relative paths resolve everywhere), serve the folder:

```bash
# from inside this folder
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Folder structure

```
zero2grow-website/
├── index.html            # All page markup
├── css/
│   └── styles.css        # Brand design system + responsive layout
├── js/
│   └── main.js           # Nav, scroll reveal, counters, week tabs, form
├── assets/
│   └── favicon.svg       # Z²G monogram
└── README.md
```

## What's interactive

- Sticky nav that solidifies on scroll, with a mobile hamburger menu
- Scroll-reveal animations (IntersectionObserver)
- Animated hero stat counters
- Clickable 8-week journey explorer (tabs swap the detail panel)
- Expandable FAQ accordion
- Client-side application form with inline validation
- Back-to-top button

## Make it yours

- **Colors & fonts:** edit the `:root` tokens at the top of `css/styles.css`.
- **Curriculum content:** edit the `WEEKS` array in `js/main.js`.
- **Copy:** edit directly in `index.html`.
- **Form:** currently validates and confirms on the client. To collect real submissions, point the `<form>` at your endpoint (Formspree, a serverless function, etc.) in `index.html` / `js/main.js`.

Contact: hello@zero2grow.io · Cohort lead: Usman Afzal
