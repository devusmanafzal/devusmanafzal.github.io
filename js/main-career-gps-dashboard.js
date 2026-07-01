/* ============================================================
   Career GPS Dashboard — results renderer
   ============================================================ */
(function () {
  "use strict";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  var resultStorageKey = "careerGpsLatestResults";
  var resultsSection = $("#results");
  var noResultSection = $("#gpsNoResult");

  var overallScore = $("#gpsOverallScore");
  var overallStage = $("#gpsOverallStage");
  var overallMessage = $("#gpsOverallMessage");
  var scoreBars = $("#gpsScoreBars");
  var strengthsList = $("#gpsStrengths");
  var focusList = $("#gpsFocus");
  var recommendation = $("#gpsRecommendation");
  var snapshotTitle = $("#gpsSnapshotTitle");
  var snapshotName = $("#gpsSnapshotName");
  var snapshotDate = $("#gpsSnapshotDate");
  var snapshotScore = $("#gpsSnapshotScore");
  var snapshotStage = $("#gpsSnapshotStage");
  var snapshotScores = $("#gpsSnapshotScores");
  var snapshotStrengths = $("#gpsSnapshotStrengths");
  var snapshotFocus = $("#gpsSnapshotFocus");
  var snapshotRecommendation = $("#gpsSnapshotRecommendation");

  function renderBarList(target, items) {
    if (!target || !Array.isArray(items)) return;
    target.innerHTML = items.map(function (item) {
      return ""
        + '<div class="gps-bar">'
        + '  <div class="gps-bar__top"><span>' + item.short + '</span><strong>' + item.score + '/100</strong></div>'
        + '  <div class="gps-bar__track"><div class="gps-bar__fill" style="width:' + item.score + '%"></div></div>'
        + "</div>";
    }).join("");
  }

  function renderNameList(target, items) {
    if (!target || !Array.isArray(items)) return;
    target.innerHTML = items.map(function (item) {
      return "<li>" + item.title + "</li>";
    }).join("");
  }

  function showNoResult() {
    if (resultsSection) resultsSection.hidden = true;
    if (noResultSection) noResultSection.hidden = false;
  }

  function renderResults(results) {
    if (!resultsSection) return;

    resultsSection.hidden = false;
    if (noResultSection) noResultSection.hidden = true;

    overallScore.textContent = results.overall + " / 100";
    overallStage.textContent = results.stage.label;
    overallMessage.textContent = results.stage.message;
    renderBarList(scoreBars, results.scores);
    renderNameList(strengthsList, results.strengths);
    renderNameList(focusList, results.focus);
    recommendation.textContent = results.recommendation;

    snapshotTitle.textContent = results.title;
    snapshotName.textContent = results.name || "Optional";

    var parsedDate = new Date(results.date);
    var safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    snapshotDate.textContent = safeDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    snapshotScore.textContent = results.overall + " / 100";
    snapshotStage.textContent = results.stage.label;
    renderBarList(snapshotScores, results.scores);
    renderNameList(snapshotStrengths, results.strengths);
    renderNameList(snapshotFocus, results.focus);
    snapshotRecommendation.textContent = results.recommendation;
  }

  function loadResults() {
    try {
      var raw = sessionStorage.getItem(resultStorageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  var results = loadResults();
  if (!results) {
    showNoResult();
  } else {
    renderResults(results);
  }

  document.querySelectorAll("[data-print-snapshot]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });
})();
