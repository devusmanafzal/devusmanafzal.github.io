# Zero2Grow — Company Website

A multi-page marketing site for **Zero2Grow**, built with plain HTML, CSS, and JavaScript — no build step, no dependencies. It shares the same brand design system and theme as the Career OS single-page site.

## Run it

Open `index.html` in a browser. For clean relative paths, serve the folder:

```bash
# from inside this folder
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Pages

| Page | File | What's on it |
|------|------|--------------|
| Home | `index.html` | Hero with animated stats, feature highlights, programs preview, CTA band |
| Programs | `programs.html` | **Z2G Career OS** (flagship, now enrolling) + Founder OS, Leadership OS, AI Studio (coming soon), plus an FAQ |
| Courses | `courses.html` | Six standalone short courses |
| About | `about.html` | Mission split, stats strip, team, and company timeline |
| Contact | `contact.html` | Contact details + a validated contact form |

## Folder structure

```
zero2grow-site/
├── index.html
├── programs.html
├── courses.html
├── about.html
├── contact.html
├── css/
│   └── styles.css        # Shared brand design system + responsive layout
├── js/
│   └── main.js           # Nav, scroll reveal, stat counters, contact form
├── assets/
│   └── favicon.svg       # Z²G monogram
└── README.md
```

## What's interactive

- Sticky nav that solidifies on scroll, with a mobile hamburger menu and per-page active link
- Scroll-reveal animations (IntersectionObserver)
- Animated hero stat counters on the home page
- Expandable FAQ accordion on the Programs page
- Client-side contact form with inline validation
- Back-to-top button

## Make it yours

- **Colors & fonts:** edit the `:root` tokens at the top of `css/styles.css`.
- **Copy & content:** edit directly in each `.html` page.
- **Programs:** Z2G Career OS is the live flagship; the other three are placeholders ready to fill in.
- **Form:** the contact form validates and confirms on the client. To collect real submissions, point the `<form>` at your endpoint (Formspree, a serverless function, etc.).

Contact: hello@zero2grow.io
