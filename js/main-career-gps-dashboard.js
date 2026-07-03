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
  var positionCard = $(".gps-position-card");
  var positionIcon = $("#gpsPositionIcon");
  var positionBand = $("#gpsPositionBand");
  var positionDescription = $("#gpsPositionDescription");
  var positionFocus = $("#gpsPositionFocus");
  var miniRingProgress = $("#gpsMiniRingProgress");
  var miniRingValue = $("#gpsMiniRingValue");
  var miniInfoWrap = $("#gpsMiniInfoWrap");
  var miniInfoBtn = $("#gpsMiniInfoBtn");
  var miniInfoPanel = $("#gpsMiniInfoPanel");
  var miniInfoList = $("#gpsMiniScoreInfoList");
  var miniScoreValue = $("#gpsMiniScoreValue");
  var miniScoreStage = $("#gpsMiniScoreStage");
  var miniScoreProgressValue = $("#gpsMiniScoreProgressValue");
  var miniScoreBar = $("#gpsMiniScoreBar");
  var miniRecommendedFocus = $("#gpsMiniRecommendedFocus");
  var miniDimensionList = $("#gpsMiniDimensionList");
  var scoreBars = $("#gpsScoreBars");
  var strengthsList = $("#gpsStrengths");
  var focusList = $("#gpsFocus");
  var recommendation = $("#gpsRecommendation");
  var recommendationIcon = $("#gpsRecommendationIcon");
  var topName = $("#gpsTopName");
  var topDate = $("#gpsTopDate");
  var snapshotTitle = $("#gpsSnapshotTitle");
  var snapshotName = $("#gpsSnapshotName");
  var snapshotDate = $("#gpsSnapshotDate");
  var snapshotScore = $("#gpsSnapshotScore");
  var snapshotStage = $("#gpsSnapshotStage");
  var snapshotScores = $("#gpsSnapshotScores");
  var snapshotStrengths = $("#gpsSnapshotStrengths");
  var snapshotFocus = $("#gpsSnapshotFocus");
  var snapshotRecommendation = $("#gpsSnapshotRecommendation");

  function getStageVisual(label) {
    var visuals = {
      "Explorer": "🧭",
      "Builder": "🧱",
      "Momentum Builder": "🚀",
      "Amplifier": "📡",
      "Catalyst": "🌟"
    };
    return visuals[label] || "📍";
  }

  function getPrimaryFocus(stage) {
    if (stage && Array.isArray(stage.primaryFocus) && stage.primaryFocus.length) {
      return stage.primaryFocus;
    }

    var fallback = {
      "Explorer": ["Direction", "Consistency"],
      "Builder": ["Execution", "Visibility"],
      "Momentum Builder": ["Visibility", "AI leverage"],
      "Amplifier": ["Scaling influence", "Creating opportunities"],
      "Catalyst": ["Leadership", "Multiplying impact"]
    };
    return fallback[(stage && stage.label) || ""] || [];
  }

  function cleanStageDescription(message) {
    if (!message) return "";
    return message.replace(/\s*Primary focus:\s*.*/i, "").trim();
  }

  function clampScore(value) {
    var n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function renderMiniScore(results) {
    var score = clampScore(results && results.overall);
    var stageLabel = (results && results.stage && results.stage.label) || "Explorer";
    var radius = 52;
    var circumference = 2 * Math.PI * radius;
    var offset = circumference - ((score / 100) * circumference);

    if (miniRingProgress) {
      miniRingProgress.style.strokeDasharray = String(circumference);
      miniRingProgress.style.strokeDashoffset = String(offset);
    }
    if (miniRingValue) miniRingValue.textContent = String(score);
    if (miniScoreValue) miniScoreValue.textContent = score + " / 100";
    if (miniScoreStage) miniScoreStage.textContent = stageLabel;
    if (miniScoreProgressValue) miniScoreProgressValue.textContent = score + "%";
    if (miniScoreBar) miniScoreBar.style.width = score + "%";
  }

  function renderMiniBreakdown(scores) {
    if (!miniDimensionList || !Array.isArray(scores)) return;

    var icons = {
      direction: "🧭",
      visibility: "📣",
      capability: "⚙️",
      amplification: "🚀"
    };

    miniDimensionList.innerHTML = scores.map(function (item) {
      var icon = icons[item.id] || "•";
      return ''
        + '<div class="gps-mini-breakdown__row">'
        + '  <div class="gps-mini-breakdown__left">'
        + '    <span class="gps-mini-breakdown__icon" aria-hidden="true">' + icon + '</span>'
        + '    <span class="gps-mini-breakdown__label">' + item.title + '</span>'
        + '  </div>'
        + '  <strong class="gps-mini-breakdown__score">' + item.score + '</strong>'
        + '</div>';
    }).join("");
  }

  function renderMiniInfoBreakdown(scores) {
    if (!miniInfoList || !Array.isArray(scores)) return;

    var icons = {
      direction: "🧭",
      visibility: "📣",
      capability: "⚙️",
      amplification: "🚀"
    };

    miniInfoList.innerHTML = scores.map(function (item) {
      var icon = icons[item.id] || "•";
      return ''
        + '<div class="gps-mini-info__row">'
        + '  <div class="gps-mini-info__left">'
        + '    <span class="gps-mini-info__icon" aria-hidden="true">' + icon + '</span>'
        + '    <span class="gps-mini-info__label">' + item.title + '</span>'
        + '  </div>'
        + '  <strong class="gps-mini-info__score">' + item.score + '</strong>'
        + '</div>';
    }).join("");
  }

  function renderMiniFocus(items) {
    if (!miniRecommendedFocus || !Array.isArray(items)) return;
    miniRecommendedFocus.innerHTML = items.slice(0, 2).map(function (item) {
      return "<li>" + item.title + "</li>";
    }).join("");
  }

  function pickRecommendationIcon(text) {
    if (!text) return "🚀";
    var t = text.toLowerCase();
    if (t.indexOf("ai") !== -1 || t.indexOf("technology") !== -1) return "🤖";
    if (t.indexOf("profile") !== -1 || t.indexOf("visibility") !== -1 || t.indexOf("value") !== -1) return "📣";
    if (t.indexOf("system") !== -1 || t.indexOf("execution") !== -1 || t.indexOf("track") !== -1) return "⚙️";
    if (t.indexOf("direction") !== -1 || t.indexOf("12-month") !== -1 || t.indexOf("goals") !== -1) return "🧭";
    return "🚀";
  }

  function bindMiniInfoInteractions() {
    if (!miniInfoWrap || !miniInfoBtn) return;

    function setOpenState(open) {
      miniInfoWrap.classList.toggle("is-open", open);
      miniInfoBtn.setAttribute("aria-expanded", String(open));
      if (miniInfoPanel) {
        miniInfoPanel.setAttribute("aria-hidden", String(!open));
        miniInfoPanel.hidden = !open;
      }
    }

    // Start with the panel closed in a deterministic state.
    setOpenState(false);

    miniInfoBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpenState(!miniInfoWrap.classList.contains("is-open"));
    });

    document.addEventListener("click", function (event) {
      if (!miniInfoWrap.contains(event.target)) {
        setOpenState(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpenState(false);
      }
    });

    // Hover support for pointer devices while preserving tap behavior.
    miniInfoWrap.addEventListener("mouseenter", function () {
      setOpenState(true);
    });

    miniInfoWrap.addEventListener("mouseleave", function () {
      setOpenState(false);
    });
  }

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

    if (positionCard) {
      var stageLabel = (results.stage && results.stage.label) || "Explorer";
      var stageMessage = (results.stage && results.stage.message) || "";
      var focusAreas = getPrimaryFocus(results.stage);

      positionCard.setAttribute("data-band", stageLabel);
      if (positionIcon) positionIcon.textContent = getStageVisual(stageLabel);
      if (positionBand) positionBand.textContent = stageLabel;
      if (positionDescription) positionDescription.textContent = cleanStageDescription(stageMessage);
      if (positionFocus) {
        positionFocus.innerHTML = focusAreas.map(function (item) {
          return '<span class="gps-position-card__focus-chip">' + item + '</span>';
        }).join("");
      }
    }

    if (overallScore) overallScore.textContent = results.overall + " / 100";
    if (overallStage) overallStage.textContent = results.stage.label;
    if (overallMessage) overallMessage.textContent = results.stage.message;
    renderMiniScore(results);
    renderMiniBreakdown(results.scores);
    renderMiniInfoBreakdown(results.scores);
    renderMiniFocus(results.focus);
    renderBarList(scoreBars, results.scores);
    renderNameList(strengthsList, results.strengths);
    renderNameList(focusList, results.focus);
    if (recommendation) recommendation.textContent = results.recommendation;
    if (recommendationIcon) recommendationIcon.textContent = pickRecommendationIcon(results.recommendation);

    if (snapshotTitle) snapshotTitle.textContent = results.title;
    if (snapshotName) snapshotName.textContent = results.name || "Optional";
    if (topName) topName.textContent = results.name || "Optional";

    var parsedDate = new Date(results.date);
    var safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    var formattedDate = safeDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    if (snapshotDate) snapshotDate.textContent = formattedDate;
    if (topDate) topDate.textContent = formattedDate;

    if (snapshotScore) snapshotScore.textContent = results.overall + " / 100";
    if (snapshotStage) snapshotStage.textContent = results.stage.label;
    renderBarList(snapshotScores, results.scores);
    renderNameList(snapshotStrengths, results.strengths);
    renderNameList(snapshotFocus, results.focus);
    if (snapshotRecommendation) snapshotRecommendation.textContent = results.recommendation;
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
  bindMiniInfoInteractions();
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
