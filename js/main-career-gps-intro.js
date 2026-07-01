/* ============================================================
   Career GPS Intro Flow — optional profile capture
   ============================================================ */
(function () {
  "use strict";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  var form = $("#gpsIntroForm");
  var nameInput = $("#introName");
  var emailInput = $("#introEmail");
  var storageKey = "careerGpsProfile";

  try {
    var saved = sessionStorage.getItem(storageKey);
    if (saved) {
      var profile = JSON.parse(saved);
      if (nameInput && profile.name) nameInput.value = profile.name;
      if (emailInput && profile.email) emailInput.value = profile.email;
    }
  } catch (err) {
    /* Ignore storage read issues and continue without prefill. */
  }

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var profile = {
      name: nameInput ? nameInput.value.trim() : "",
      email: emailInput ? emailInput.value.trim() : ""
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(profile));
    } catch (err) {
      /* Ignore storage write issues and continue with navigation. */
    }

    window.location.href = "careergps.html?view=questions";
  });
})();