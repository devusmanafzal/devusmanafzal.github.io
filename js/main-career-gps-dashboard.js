/* ============================================================
   Career GPS Dashboard — results renderer
   ============================================================ */
(function () {
  "use strict";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function getAppSettings() {
    if (typeof window === "undefined" || !window.CAREER_GPS_SETTINGS || typeof window.CAREER_GPS_SETTINGS !== "object") {
      return {
        dataMode: "live",
        useLiveApi: false,
        showDebug: false,
        showModeBadge: false
      };
    }

    return {
      dataMode: window.CAREER_GPS_SETTINGS.dataMode === "sample" ? "sample" : "live",
      useLiveApi: window.CAREER_GPS_SETTINGS.useLiveApi === true,
      showDebug: window.CAREER_GPS_SETTINGS.showDebug === true,
      showModeBadge: window.CAREER_GPS_SETTINGS.showModeBadge === true
    };
  }
  var pageQuery = new URLSearchParams(window.location.search);
  var appSettings = getAppSettings();

  var resultStorageKey = "careerGpsLatestResults";
  var dataModeStorageKey = "careerGpsDataMode";
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
  var aiGuidanceStatus = $("#gpsAiGuidanceStatus");
  var inlineTip = $("#gpsInlineTip");
  var inlineTipText = $("#gpsInlineTipText");
  var inlineTipSource = $("#gpsInlineTipSource");
  var inlineTipSecondary = $("#gpsInlineTipSecondary");
  var inlineTipSecondaryText = $("#gpsInlineTipSecondaryText");
  var inlineTipSecondarySource = $("#gpsInlineTipSecondarySource");
  var aiPrioritiesCard = $("#gpsAiPrioritiesCard");
  var aiPlanCard = $("#gpsAiPlanCard");
  var aiCoursesCard = $("#gpsAiCoursesCard");
  var aiCautionsCard = $("#gpsAiCautionsCard");
  var aiPriorities = $("#gpsAiPriorities");
  var aiPlanCarousel = $("#gpsAiPlanCarousel");
  var aiPlanTrack = $("#gpsAiPlanTrack");
  var aiPlanPrev = $("#gpsAiPlanPrev");
  var aiPlanNext = $("#gpsAiPlanNext");
  var aiPlanDots = $("#gpsAiPlanDots");
  var aiCourses = $("#gpsAiCourses");
  var aiCautions = $("#gpsAiCautions");
  var aiDebugWrap = $("#gpsAiDebugWrap");
  var aiDebugPanel = $("#gpsAiDebugPanel");
  var aiDebugContent = $("#gpsAiDebugContent");
  var topName = $("#gpsTopName");
  var topDate = $("#gpsTopDate");
  var modeBadge = $("#gpsModeBadge");
  var snapshotTitle = $("#gpsSnapshotTitle");
  var snapshotName = $("#gpsSnapshotName");
  var snapshotDate = $("#gpsSnapshotDate");
  var snapshotScore = $("#gpsSnapshotScore");
  var snapshotStage = $("#gpsSnapshotStage");
  var snapshotScores = $("#gpsSnapshotScores");
  var snapshotStrengths = $("#gpsSnapshotStrengths");
  var snapshotFocus = $("#gpsSnapshotFocus");
  var snapshotRecommendation = $("#gpsSnapshotRecommendation");
  var planSlideIndex = 0;
  var planSlideCount = 0;
  var planCarouselBound = false;

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

  function setStatusMessage(message) {
    if (!aiGuidanceStatus) return;

    if (!message) {
      aiGuidanceStatus.hidden = true;
      aiGuidanceStatus.textContent = "";
      return;
    }

    aiGuidanceStatus.hidden = false;
    aiGuidanceStatus.textContent = message;
  }

  function clearList(target) {
    if (!target) return;
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }
  }

  function renderTextList(target, items, ordered) {
    if (!target) return;
    clearList(target);

    (items || []).forEach(function (text) {
      var item = document.createElement("li");
      item.textContent = text;
      target.appendChild(item);
    });

    if (ordered) {
      target.setAttribute("start", "1");
    }
  }

  function renderPriorities(target, items) {
    if (!target) return;
    clearList(target);

    var icons = ["🌟", "🚀", "🎯"];

    (items || []).forEach(function (text, index) {
      var item = document.createElement("li");
      item.className = "gps-priority-item";

      var icon = document.createElement("span");
      icon.className = "gps-priority-item__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = icons[index % icons.length];

      var copy = document.createElement("span");
      copy.className = "gps-priority-item__text";
      copy.textContent = text;

      item.appendChild(icon);
      item.appendChild(copy);
      target.appendChild(item);
    });
  }

  function renderCourses(target, items) {
    if (!target) return;
    clearList(target);

    (items || []).forEach(function (text) {
      var item = document.createElement("li");
      item.className = "gps-priority-item";

      var icon = document.createElement("span");
      icon.className = "gps-priority-item__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "📘";

      var copy = document.createElement("span");
      copy.className = "gps-priority-item__text";
      copy.textContent = text;

      item.appendChild(icon);
      item.appendChild(copy);
      target.appendChild(item);
    });
  }

  function renderCautions(target, items) {
    if (!target) return;
    clearList(target);

    (items || []).forEach(function (text) {
      var item = document.createElement("li");
      item.className = "gps-priority-item";

      var icon = document.createElement("span");
      icon.className = "gps-priority-item__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "⚠️";

      var copy = document.createElement("span");
      copy.className = "gps-priority-item__text";
      copy.textContent = text;

      item.appendChild(icon);
      item.appendChild(copy);
      target.appendChild(item);
    });
  }

  function renderInlineTip(items) {
    if (!inlineTip || !inlineTipText) return;
    var firstTip = Array.isArray(items) && items.length ? items[0] : "";

    if (!firstTip) {
      inlineTip.hidden = true;
      inlineTipText.textContent = "";
      return;
    }

    inlineTip.hidden = false;
    inlineTipText.textContent = firstTip;
    if (inlineTipSource) inlineTipSource.textContent = "CareerGPS Coach";
  }

  function renderInlineTipSecondary(items) {
    if (!inlineTipSecondary || !inlineTipSecondaryText) return;
    var secondTip = Array.isArray(items) && items.length > 1 ? items[1] : "";

    if (!secondTip) {
      inlineTipSecondary.hidden = true;
      inlineTipSecondaryText.textContent = "";
      return;
    }

    inlineTipSecondary.hidden = false;
    inlineTipSecondaryText.textContent = secondTip;
    if (inlineTipSecondarySource) inlineTipSecondarySource.textContent = "CareerGPS Coach";
  }

  function normalizeTextList(items, maxItems, maxLen) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, maxItems).map(function (item) {
      var text = String(item == null ? "" : item).trim();
      if (!text) return "";
      return text.slice(0, maxLen);
    }).filter(Boolean);
  }

  function normalizePlan(items) {
    if (!Array.isArray(items)) return [];

    return items.slice(0, 4).map(function (item, index) {
      if (!item || typeof item !== "object") return null;

      var weekLabel = String(item.week || ("Week " + (index + 1))).trim().slice(0, 36);
      var actions = normalizeTextList(item.actions, 4, 170);
      if (!actions.length && item.action) {
        actions = normalizeTextList([item.action], 1, 170);
      }

      if (!actions.length) return null;
      return {
        week: weekLabel,
        actions: actions
      };
    }).filter(Boolean);
  }

  function normalizeGuidance(guidance) {
    if (!guidance || typeof guidance !== "object") return null;

    var normalized = {
      priorities: normalizeTextList(guidance.priorities, 3, 160),
      plan30Days: normalizePlan(guidance.plan30Days),
      recommendedCourses: normalizeTextList(guidance.recommendedCourses, 5, 130),
      motivationTips: normalizeTextList(guidance.motivationTips, 4, 170),
      cautionFlags: normalizeTextList(guidance.cautionFlags, 3, 170)
    };

    if (!normalized.priorities.length && !normalized.plan30Days.length && !normalized.recommendedCourses.length && !normalized.motivationTips.length) {
      return null;
    }

    return normalized;
  }

  function renderPlan(target, plan) {
    if (!target) return;

    var actionIcons = ["🚀", "✨", "🎯", "✅"];

    target.innerHTML = plan.map(function (item) {
      var actions = (item.actions || []).map(function (action, actionIndex) {
        var icon = actionIcons[actionIndex % actionIcons.length];
        return ''
          + '<li class="gps-plan-week__action">'
          + '  <span class="gps-plan-week__icon" aria-hidden="true">' + icon + '</span>'
          + '  <span>' + action + '</span>'
          + '</li>';
      }).join("");

      return ''
        + '<li class="gps-plan-carousel__slide">'
        + '  <article class="gps-plan-week">'
        + '    <h4>' + item.week + '</h4>'
        + '    <ul>' + actions + '</ul>'
        + '  </article>'
        + '</li>';
    }).join("");

    planSlideCount = plan.length;
    planSlideIndex = 0;
    renderPlanDots(plan.length);
    updatePlanCarouselPosition();
  }

  function renderPlanDots(count) {
    if (!aiPlanDots) return;

    aiPlanDots.innerHTML = "";
    for (var index = 0; index < count; index += 1) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gps-plan-carousel__dot" + (index === planSlideIndex ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to " + ("Week " + (index + 1)));
      dot.setAttribute("data-plan-index", String(index));
      aiPlanDots.appendChild(dot);
    }
  }

  function setPlanSlide(index) {
    if (!planSlideCount) return;
    planSlideIndex = Math.max(0, Math.min(planSlideCount - 1, index));
    updatePlanCarouselPosition();
  }

  function updatePlanCarouselPosition() {
    if (!aiPlanTrack) return;

    aiPlanTrack.style.transform = "translateX(" + (-planSlideIndex * 100) + "%)";

    if (aiPlanPrev) aiPlanPrev.disabled = planSlideIndex <= 0;
    if (aiPlanNext) aiPlanNext.disabled = planSlideIndex >= planSlideCount - 1;

    if (aiPlanDots) {
      aiPlanDots.querySelectorAll(".gps-plan-carousel__dot").forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === planSlideIndex);
      });
    }
  }

  function bindPlanCarouselControls() {
    if (planCarouselBound) return;
    planCarouselBound = true;

    if (aiPlanPrev) {
      aiPlanPrev.addEventListener("click", function () {
        setPlanSlide(planSlideIndex - 1);
      });
    }

    if (aiPlanNext) {
      aiPlanNext.addEventListener("click", function () {
        setPlanSlide(planSlideIndex + 1);
      });
    }

    if (aiPlanDots) {
      aiPlanDots.addEventListener("click", function (event) {
        var target = event.target;
        if (!target || !target.getAttribute) return;
        var indexValue = target.getAttribute("data-plan-index");
        if (indexValue == null) return;
        setPlanSlide(parseInt(indexValue, 10));
      });
    }
  }

  function renderAiGuidance(results) {
    if (!aiPrioritiesCard || !aiPlanCard || !aiCoursesCard || !aiCautionsCard) return;

    var normalized = normalizeGuidance(results && results.aiGuidance);
    if (!normalized) {
      aiPrioritiesCard.hidden = true;
      aiPlanCard.hidden = true;
      aiCoursesCard.hidden = true;
      aiCautionsCard.hidden = true;
      if (inlineTip) inlineTip.hidden = true;
      if (inlineTipSecondary) inlineTipSecondary.hidden = true;
      if (aiPlanCarousel) aiPlanCarousel.hidden = true;
      clearList(aiPriorities);
      if (aiPlanTrack) aiPlanTrack.innerHTML = "";
      clearList(aiCourses);
      if (inlineTipText) inlineTipText.textContent = "";
      if (inlineTipSecondaryText) inlineTipSecondaryText.textContent = "";
      clearList(aiCautions);

      if (results && results.aiGuidanceStatus === "error") {
        setStatusMessage("Personalized AI guidance is unavailable right now, but your core recommendation is ready.");
      } else {
        setStatusMessage("");
      }
      return;
    }

    setStatusMessage("");
    aiPrioritiesCard.hidden = !normalized.priorities.length;
    aiPlanCard.hidden = !normalized.plan30Days.length;
    aiCoursesCard.hidden = !normalized.recommendedCourses.length;
    aiCautionsCard.hidden = !normalized.cautionFlags.length;
    if (aiPlanCarousel) aiPlanCarousel.hidden = !normalized.plan30Days.length;

    renderPriorities(aiPriorities, normalized.priorities);
    renderPlan(aiPlanTrack, normalized.plan30Days);
    renderCourses(aiCourses, normalized.recommendedCourses);
    renderInlineTip(normalized.motivationTips);
    renderInlineTipSecondary(normalized.motivationTips);
    renderCautions(aiCautions, normalized.cautionFlags);
    bindPlanCarouselControls();
  }

  function renderAiDebug(results) {
    if (!aiDebugWrap || !aiDebugPanel || !aiDebugContent) return;

    if (!appSettings.showDebug) {
      aiDebugWrap.hidden = true;
      aiDebugPanel.hidden = true;
      aiDebugContent.textContent = "";
      return;
    }

    var debugData = results && results.aiGuidanceDebug;
    var status = results && results.aiGuidanceStatus;
    var errorText = results && (results.aiGuidanceError || results.aiGuidanceReason);

    if (!debugData && !status) {
      aiDebugWrap.hidden = false;
      aiDebugPanel.hidden = false;
      aiDebugPanel.open = true;
      aiDebugContent.textContent = [
        "Debug mode is ON.",
        "No debug payload found in the current snapshot.",
        "Retake and submit the assessment again to capture a fresh API request/response payload."
      ].join("\n");
      return;
    }

    aiDebugWrap.hidden = false;
    aiDebugPanel.hidden = false;

    if (!debugData) {
      aiDebugContent.textContent = "No request debug payload was captured.\nStatus: " + (status || "unknown") + (errorText ? ("\nMessage: " + errorText) : "");
      return;
    }

    try {
      aiDebugContent.textContent = JSON.stringify(debugData, null, 2);
    } catch (err) {
      aiDebugContent.textContent = "Could not render debug payload.";
    }
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
    var recommendationText = results.recommendation || "Pick one area to improve this month, then turn it into a small weekly habit.";
    if (recommendation) recommendation.textContent = recommendationText;
    if (recommendationIcon) recommendationIcon.textContent = pickRecommendationIcon(recommendationText);
    renderAiGuidance(results);
    renderAiDebug(results);

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
    if (snapshotRecommendation) snapshotRecommendation.textContent = recommendationText;
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

  function shouldUseSampleResults() {
    return appSettings.dataMode === "sample";
  }

  function loadSampleResults() {
    return fetch("assets/data/career-gps-sample-results.json", {
      cache: "no-store"
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Sample data could not be loaded");
      }
      return response.json();
    });
  }

  function resolveResults() {
    var sessionResults = loadResults();
    if (sessionResults) {
      return Promise.resolve(sessionResults);
    }

    if (shouldUseSampleResults()) {
      return loadSampleResults().catch(function () {
        return null;
      });
    }

    return Promise.resolve(null);
  }

  function renderModeBadge() {
    var topMeta = $(".gps-top-meta");
    var effectiveModeBadge = modeBadge;
    var modeItem = effectiveModeBadge ? effectiveModeBadge.closest(".gps-top-meta__item") : null;

    if (!effectiveModeBadge && topMeta) {
      var item = document.createElement("p");
      item.className = "gps-top-meta__item gps-top-meta__item--mode";
      item.hidden = true;
      item.innerHTML = '<span>Mode</span><strong id="gpsModeBadge">Live API</strong>';
      topMeta.appendChild(item);
      effectiveModeBadge = $("#gpsModeBadge", item);
      modeItem = item;
    }

    if (!appSettings.showModeBadge) {
      if (modeItem) {
        modeItem.hidden = true;
        modeItem.setAttribute("hidden", "");
      }
      return;
    }

    if (!effectiveModeBadge) return;

    var sampleMode = appSettings.dataMode === "sample";

    if (modeItem) {
      modeItem.hidden = false;
      modeItem.removeAttribute("hidden");
    }

    effectiveModeBadge.textContent = sampleMode
      ? "Sample (No API)"
      : (appSettings.useLiveApi ? "Live API" : "Live Logic (No API)");
  }

  bindMiniInfoInteractions();
  renderModeBadge();
  resolveResults().then(function (results) {
    if (!results) {
      showNoResult();
    } else {
      renderResults(results);
    }
  }).catch(function () {
    showNoResult();
  });

  document.querySelectorAll("[data-print-snapshot]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });
})();
