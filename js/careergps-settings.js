/* ============================================================
   Career GPS runtime settings (developer-controlled)
   ------------------------------------------------------------
   Edit defaults below or set localStorage key `careerGpsSettings`.
   Example localStorage JSON:
   {"dataMode":"sample","showDebug":true,"showModeBadge":true}
   ============================================================ */
(function () {
  "use strict";

  var defaults = {
    dataMode: "sample",     // "live" or "sample"
    showDebug: false,      // true shows debug panels and debug payloads
    showModeBadge: true   // true shows "Mode" badge on dashboard
  };

  function normalizeDataMode(value) {
    var raw = String(value == null ? "" : value).toLowerCase().trim();
    if (raw === "sample" || raw === "smaple") return "sample";
    return "live";
  }

  function toBool(value, fallback) {
    if (value === true || value === "true" || value === 1 || value === "1") return true;
    if (value === false || value === "false" || value === 0 || value === "0") return false;
    return fallback;
  }

  function sanitize(input) {
    var safe = Object.assign({}, defaults, input || {});
    safe.dataMode = normalizeDataMode(safe.dataMode);
    safe.showDebug = toBool(safe.showDebug, defaults.showDebug);
    safe.showModeBadge = toBool(safe.showModeBadge, defaults.showModeBadge);
    return safe;
  }

  var merged = Object.assign({}, defaults);

  if (typeof window.CAREER_GPS_SETTINGS === "object" && window.CAREER_GPS_SETTINGS) {
    merged = Object.assign(merged, window.CAREER_GPS_SETTINGS);
  }

  try {
    var raw = window.localStorage.getItem("careerGpsSettings");
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        // Keep file defaults authoritative to avoid stale browser storage masking edits.
        merged = Object.assign({}, parsed, merged);
      }
    }
  } catch (err) {
    /* Ignore storage/parsing issues and keep safe defaults. */
  }

  window.CAREER_GPS_SETTINGS = sanitize(merged);
})();
