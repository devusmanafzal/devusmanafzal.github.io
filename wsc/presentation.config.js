window.PRESENTATION_CONFIG = {
  // Use "workscape" for the organizer palette or "keynote" for the original rose palette.
  palette: "workscape",

  // Optional full-screen Scout intro inserted immediately after presentation scene 2.
  scoutIntroAfterScene2: {
    enabled: true,
    src: "assets/videos/scout-intro.mp4",
    fit: "contain",
    muted: false,
    loop: false,
    caption: ""
  },

  // Recorded agency demonstration inserted immediately after the organization scene.
  agencyDemoAfterScene11: {
    enabled: true,
    src: "assets/videos/agency-demo-web.mp4",
    fit: "contain",
    muted: true,
    loop: false,
    caption: ""
  },

  // Optional full-screen video inserted immediately before presentation scene 13.
  videoBeforeScene13: {
    enabled: true,
    src: "assets/videos/open-the-door-web.mp4",
    fit: "contain",
    muted: false,
    loop: false,
    caption: ""
  }
};
