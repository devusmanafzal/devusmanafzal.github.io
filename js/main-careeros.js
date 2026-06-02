/* ============================================================
   Career OS by Zero2Grow — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 8-week journey data ---------- */
  var WEEKS = [
    {
      n: 1, color: "var(--brand)", theme: "Clarity & Direction",
      desc: "Map your strengths, values, and priorities so every later decision has a reference point. No more guessing where to start.",
      output: "North Star Document",
      quote: "I understand myself and my path forward."
    },
    {
      n: 2, color: "var(--cyan)", theme: "Personal Brand",
      desc: "Define what you want to be known for and turn it into a story that lands in seconds — on a page, in a room, online.",
      output: "Personal Brand One-Pager",
      quote: "I can clearly explain what I bring."
    },
    {
      n: 3, color: "var(--coral)", theme: "Professional Communication",
      desc: "Structure ideas and messages so they're clear and confident. Templates you reuse for emails, updates, and tough conversations.",
      output: "Executive Communication Kit",
      quote: "I communicate clearly and confidently."
    },
    {
      n: 4, color: "var(--lime-deep)", theme: "AI Foundations",
      desc: "Learn real prompting and verification — then apply AI to actual work, not toy examples. Build your own working library.",
      output: "Personal Prompt Playbook",
      quote: "I can use AI effectively in real work."
    },
    {
      n: 5, color: "var(--amber)", theme: "Productivity & Workflows",
      desc: "Turn repetitive tasks into repeatable systems. Wire AI into workflows you'll actually keep using after the program ends.",
      output: "2–5 AI Workflows",
      quote: "I work smarter, not harder."
    },
    {
      n: 6, color: "var(--brand)", theme: "Leadership & Influence",
      desc: "Practice feedback, hard conversations, and high-stakes moments in a safe space — so you're ready when they happen for real.",
      output: "Leadership Scenario Pack",
      quote: "I handle situations with confidence."
    },
    {
      n: 7, color: "var(--cyan)", theme: "Opportunities & Visibility",
      desc: "Build a concrete plan to create opportunities, raise your visibility, and put yourself in the path of the right projects.",
      output: "Opportunity Plan",
      quote: "I know how to create opportunities."
    },
    {
      n: 8, color: "var(--coral)", theme: "Capstone",
      desc: "Bring it all together into one real project that proves what you can do — your portfolio centerpiece and the spine of your system.",
      output: "Capstone Project",
      quote: "I can show what I'm capable of."
    }
  ];

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav state + mobile toggle ---------- */
  var nav = $("#nav");
  var navToggle = $("#navToggle");
  var navLinks = $("#navLinks");

  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
    toggleBackToTop();
  }, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    // close menu when a link is tapped
    $all("a", navLinks).forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $all(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var statsWrap = $("#stats");
  if (statsWrap) {
    var counted = false;
    var startCounters = function () {
      if (counted) return;
      counted = true;
      $all("[data-count]", statsWrap).forEach(animateCount);
    };
    if ("IntersectionObserver" in window) {
      var sObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { startCounters(); sObs.disconnect(); }
        });
      }, { threshold: 0.4 });
      sObs.observe(statsWrap);
    } else {
      startCounters();
    }
  }

  /* ---------- Journey tabs ---------- */
  var panel = $("#journeyPanel");
  var tabs = $all(".wtab");

  function renderWeek(i) {
    var w = WEEKS[i];
    if (!w || !panel) return;
    panel.innerHTML =
      '<div class="jp" style="--jp-c:' + w.color + '">' +
        '<div class="jp__badge" style="background:' + w.color + '">' +
          '<small>WEEK</small><b>' + w.n + '</b>' +
        '</div>' +
        '<div class="jp__body">' +
          '<h3 class="jp__theme">' + w.theme + '</h3>' +
          '<p class="jp__desc">' + w.desc + '</p>' +
          '<div class="jp__out"><span>Output</span><strong>' + w.output + '</strong></div>' +
          '<p class="jp__quote">&ldquo;' + w.quote + '&rdquo;</p>' +
        '</div>' +
      '</div>';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderWeek(parseInt(tab.getAttribute("data-week"), 10));
    });
  });
  // initial panel
  if (tabs.length) renderWeek(0);

  /* ---------- Back to top ---------- */
  var toTop = $("#toTop");
  function toggleBackToTop() {
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 600);
  }
  if (toTop) {
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Form validation ---------- */
  var form = $("#applyForm");
  var note = $("#formNote");

  function setError(name, msg) {
    var field = $('[name="' + name + '"]', form);
    if (!field) return;
    var wrap = field.closest(".field");
    var err = $('.field__err[data-for="' + name + '"]', form);
    if (wrap) wrap.classList.toggle("is-invalid", !!msg);
    if (err) err.textContent = msg || "";
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (note) { note.textContent = ""; note.className = "form__note"; }

      var name = $("#name").value.trim();
      var email = $("#email").value.trim();
      var ok = true;

      if (!name) { setError("name", "Please enter your name."); ok = false; }
      else setError("name", "");

      if (!email) { setError("email", "Please enter your email."); ok = false; }
      else if (!isEmail(email)) { setError("email", "That doesn't look like a valid email."); ok = false; }
      else setError("email", "");

      if (!ok) {
        if (note) { note.textContent = "Please fix the highlighted fields."; note.className = "form__note is-err"; }
        return;
      }

      if (note) {
        note.textContent = "Thanks, " + name.split(" ")[0] + "! Your application is in — we'll be in touch about the next cohort.";
        note.className = "form__note is-ok";
      }
      form.reset();
    });

    // clear errors as the user types
    $all("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () {
        var wrap = el.closest(".field");
        if (wrap) wrap.classList.remove("is-invalid");
        var err = $('.field__err[data-for="' + el.name + '"]', form);
        if (err) err.textContent = "";
      });
    });
  }
})();
