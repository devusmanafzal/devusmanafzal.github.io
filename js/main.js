/* ============================================================
   Zero2Grow — shared site interactions
   Used across Home, Programs, Courses, About, Contact
   ============================================================ */
(function () {
  "use strict";

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

  /* ---------- Contact form validation ---------- */
  var form = $("#contactForm");
  var note = $("#formNote");

  function setError(name, msg) {
    if (!form) return;
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
      var topic = $("#topic") ? $("#topic").value.trim() : "";
      var message = $("#message") ? $("#message").value.trim() : "x";
      var ok = true;

      if (!name) { setError("name", "Please enter your name."); ok = false; }
      else setError("name", "");

      if (!email) { setError("email", "Please enter your email."); ok = false; }
      else if (!isEmail(email)) { setError("email", "That doesn't look like a valid email."); ok = false; }
      else setError("email", "");

      if (!message) { setError("message", "Please add a short message."); ok = false; }
      else setError("message", "");

      if (!ok) {
        if (note) { note.textContent = "Please fix the highlighted fields."; note.className = "form__note is-err"; }
        return;
      }

      var subject = topic ? "Contact form: " + topic : "Contact form inquiry";
      var body = [
        "Name: " + name,
        "Email: " + email,
        "",
        "Message:",
        message
      ].join("\n");
      var mailto = "mailto:usman.afzal.ms@live.com"
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);

      if (note) {
        note.textContent = "Opening your email app with your message draft...";
        note.className = "form__note is-ok";
      }

      window.location.href = mailto;
      form.reset();
    });

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
