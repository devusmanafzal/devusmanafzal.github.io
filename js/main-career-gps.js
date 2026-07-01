/* ============================================================
   Career GPS Dashboard — interactions
   ============================================================ */
(function () {
  "use strict";

  var SECTIONS = [
    {
      id: "direction",
      title: "Direction",
      short: "Direction",
      description: "Clarity of goals and the path you are choosing next.",
      questions: [
        "I have a clear idea of what I want to work toward in the next 12 months.",
        "I know which skills or capabilities I need to develop.",
        "I can describe what success looks like for me right now."
      ]
    },
    {
      id: "confidence",
      title: "Confidence",
      short: "Confidence",
      description: "Self-belief, momentum, and the ability to act without perfect certainty.",
      questions: [
        "I feel confident talking about my strengths.",
        "I take action even when I do not have everything figured out.",
        "I can handle uncertainty without getting completely stuck."
      ]
    },
    {
      id: "visibility",
      title: "Personal Brand & Visibility",
      short: "Visibility",
      description: "How clearly you communicate your value to other people.",
      questions: [
        "I can clearly explain what I am good at.",
        "My online or professional profile reflects my strengths.",
        "People around me understand the value I bring."
      ]
    },
    {
      id: "communication",
      title: "Professional Communication",
      short: "Communication",
      description: "Clarity and confidence in writing, speaking, and presenting ideas.",
      questions: [
        "I can explain my ideas clearly.",
        "I can write professional messages with confidence.",
        "I can structure my thoughts when presenting or speaking."
      ]
    },
    {
      id: "aiReadiness",
      title: "AI Readiness",
      short: "AI Readiness",
      description: "Confidence using AI practically for learning, planning, writing, and work.",
      questions: [
        "I already use AI tools for learning, writing, planning, or work.",
        "I know how to write useful prompts.",
        "I know how to review and improve AI-generated outputs."
      ]
    },
    {
      id: "productivity",
      title: "Productivity & Consistency",
      short: "Productivity",
      description: "Habits, systems, and execution that help you follow through.",
      questions: [
        "I have a system for planning my work or studies.",
        "I follow through consistently on important tasks.",
        "I manage my time and energy intentionally."
      ]
    }
  ];

  var STAGES = [
    { min: 0, max: 40, label: "Early Exploration", message: "You are still shaping direction. Your next gain will come from narrowing choices and naming what matters most." },
    { min: 41, max: 60, label: "Building Foundation", message: "You have some momentum. The most useful next move is to make your habits and communication more deliberate." },
    { min: 61, max: 80, label: "Growth Ready", message: "You already have a strong base to build on. Focus on visibility, consistency, and practical AI use to unlock the next level." },
    { min: 81, max: 100, label: "Momentum Builder", message: "You are operating with strong readiness. Keep refining the system and turning your strengths into visible opportunities." }
  ];

  var RECOMMENDATIONS = {
    visibility: "Focus on making your value more visible. Start by writing a one-sentence personal brand statement and updating your profile summary.",
    aiReadiness: "Start using AI for one practical task every week, such as planning, writing, summarizing, or learning.",
    productivity: "Build a simple weekly planning routine and turn repeated tasks into reusable workflows.",
    direction: "Write down one clear 12-month direction and name the three capabilities that would move you toward it fastest.",
    confidence: "Pick one strength story and practice saying it out loud, then take one small action before you feel fully ready.",
    communication: "Use one repeatable communication structure for emails, updates, and speaking: context, point, ask."
  };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var params = new URLSearchParams(window.location.search);
  var questionView = params.get("view") === "questions";
  var profileStorageKey = "careerGpsProfile";
  var resultStorageKey = "careerGpsLatestResults";

  var state = {
    step: 0,
    question: 0,
    answers: {},
    resultDate: null,
    results: null
  };

  var stepper = $("#gpsStepper");
  var stepperMobile = $("#gpsStepperMobile");
  var questionDeck = $("#gpsQuestionDeck");
  var progressFill = $("#gpsProgressFill");
  var stepTitle = $("#gpsStepTitle");
  var currentKicker = $("#gpsCurrentKicker");
  var stepDesc = $("#gpsStepDescription");
  var stepCount = $("#gpsStepCount");
  var questionBackBtn = $("#gpsQuestionBack");
  var questionNextBtn = $("#gpsQuestionNext");
  var stepBackBtn = $("#gpsStepBack");
  var stepNextBtn = $("#gpsStepNext");
  var profileName = "";
  var submitDialogState = {
    root: null,
    panel: null,
    cancelBtn: null,
    proceedBtn: null,
    resolver: null,
    handleEsc: null
  };

  if (questionView) {
    document.body.classList.add("gps-page--questions");
  }

  try {
    var savedProfile = sessionStorage.getItem(profileStorageKey);
    if (savedProfile) {
      var parsedProfile = JSON.parse(savedProfile);
      if (parsedProfile.name) profileName = parsedProfile.name;
    }
  } catch (err) {
    /* Ignore storage read issues and keep working without prefill. */
  }

  function scoreLabel(value) {
    var labels = {
      1: "Strongly disagree",
      2: "Disagree",
      3: "Neutral",
      4: "Agree",
      5: "Strongly agree"
    };
    return labels[value] || "Neutral";
  }

  function getAnswer(qid) {
    return state.answers[qid] || 3;
  }

  function stepComplete(stepIndex) {
    return SECTIONS[stepIndex].questions.every(function (_, qIndex) {
      return Object.prototype.hasOwnProperty.call(state.answers, SECTIONS[stepIndex].id + "-" + qIndex);
    });
  }

  function currentQuestionComplete() {
    var section = SECTIONS[state.step];
    var qid = section.id + "-" + state.question;
    return Object.prototype.hasOwnProperty.call(state.answers, qid);
  }

  function getStageNudge(remainingQuestions) {
    if (remainingQuestions <= 0) return "Stage complete. Keep the streak going.";
    if (remainingQuestions === 1) return "Final push. 1 more to unlock next stage.";
    return "Great start. " + remainingQuestions + " to reach the next stage.";
  }

  function renderStepper() {
    if (!stepper) return;
    stepper.innerHTML = SECTIONS.map(function (section, index) {
      var classes = ["gps-step"];
      if (index === state.step) classes.push("is-active");
      if (index < state.step || stepComplete(index)) classes.push("is-complete");
      return '' +
        '<button type="button" class="' + classes.join(" ") + '" data-step="' + index + '" role="tab" aria-selected="' + String(index === state.step) + '">' +
          '<span class="gps-step__index">Step ' + (index + 1) + '</span>' +
          '<span class="gps-step__label">' + section.short + '</span>' +
        '</button>';
    }).join("");

    $all("[data-step]", stepper).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = parseInt(btn.getAttribute("data-step"), 10);
        if (target > state.step + 1) return;
        if (target > state.step && !stepComplete(state.step)) return;
        state.step = target;
        state.question = 0;
        renderStep();
      });
    });

    if (stepperMobile) {
      stepperMobile.innerHTML = SECTIONS.map(function (_, index) {
        var classes = ["gps-step-dot"];
        if (index === state.step) classes.push("is-active");
        if (index < state.step || stepComplete(index)) classes.push("is-complete");
        return '<span class="' + classes.join(" ") + '" aria-hidden="true"></span>';
      }).join("");
    }
  }

  function renderQuestion(section, questionText, questionIndex) {
    var qid = section.id + "-" + questionIndex;
    var selected = getAnswer(qid);
    if (!state.answers[qid]) {
      state.answers[qid] = selected;
    }

    return '' +
      '<article class="gps-question">' +
        '<div class="gps-question__head">' +
          '<div>' +
            '<div class="gps-question__num">Question ' + (questionIndex + 1) + '</div>' +
            '<p class="gps-question__text">' + questionText + '</p>' +
          '</div>' +
          '<div class="gps-slider__badge" id="' + qid + '-value">' + selected + '</div>' +
        '</div>' +
        '<div class="gps-slider">' +
          '<input type="range" class="gps-slider__input" id="' + qid + '-slider" name="' + qid + '" min="1" max="5" step="1" value="' + selected + '" />' +
          '<div class="gps-slider__ticks" id="' + qid + '-ticks" aria-hidden="true">' +
            '<span class="gps-slider__tick" data-value="1">1</span>' +
            '<span class="gps-slider__tick" data-value="2">2</span>' +
            '<span class="gps-slider__tick" data-value="3">3</span>' +
            '<span class="gps-slider__tick" data-value="4">4</span>' +
            '<span class="gps-slider__tick" data-value="5">5</span>' +
          '</div>' +
        '</div>' +
        '<div class="gps-scale-labels"><span>Lower</span><span class="gps-scale-current" id="' + qid + '-label">' + scoreLabel(selected) + '</span><span>Higher</span></div>' +
      '</article>';
  }

  function updateTickState(qid, value) {
    var ticksWrap = $("#" + qid + "-ticks", questionDeck);
    if (!ticksWrap) return;

    $all(".gps-slider__tick", ticksWrap).forEach(function (tick) {
      var tickValue = parseInt(tick.getAttribute("data-value"), 10);
      tick.classList.toggle("is-active", tickValue <= value);
      tick.classList.toggle("is-current", tickValue === value);
    });
  }

  function getValuePalette(value) {
    var ratio = (value - 1) / 4;
    var hue = Math.round(8 + (128 * ratio));
    return {
      strong: "hsl(" + hue + ", 70%, 42%)",
      soft: "hsl(" + hue + ", 88%, 95%)",
      border: "hsla(" + hue + ", 70%, 42%, .42)",
      glow: "hsla(" + hue + ", 70%, 42%, .36)"
    };
  }

  function applySliderVisuals(input, value) {
    if (!input) return;

    var palette = getValuePalette(value);
    var pct = ((value - 1) / 4) * 100;

    input.style.setProperty("--slider-color", palette.strong);
    input.style.setProperty("--slider-glow", palette.glow);
    input.style.background = "linear-gradient(90deg, " + palette.strong + " 0%, " + palette.strong + " " + pct + "%, #dbe7ef " + pct + "%, #dbe7ef 100%)";

    var valueEl = $("#" + input.name + "-value", questionDeck);
    if (valueEl) {
      valueEl.style.background = palette.soft;
      valueEl.style.borderColor = palette.border;
      valueEl.style.color = palette.strong;
      valueEl.style.boxShadow = "0 8px 16px -14px " + palette.glow;
    }
  }

  function setCtaState(button, mode) {
    if (!button) return;
    button.classList.remove("is-cta-pulse", "is-cta-ready");
    if (mode) button.classList.add(mode);
  }

  function bindQuestionInputs() {
    $all('input[type="range"]', questionDeck).forEach(function (input) {
      var updateValue = function () {
        var selectedValue = parseInt(input.value, 10);
        state.answers[input.name] = selectedValue;
        var valueEl = $("#" + input.name + "-value", questionDeck);
        var labelEl = $("#" + input.name + "-label", questionDeck);
        if (valueEl) valueEl.textContent = input.value;
        if (labelEl) labelEl.textContent = scoreLabel(selectedValue);
        applySliderVisuals(input, selectedValue);
        updateTickState(input.name, selectedValue);
        syncControls();
      };
      input.addEventListener("input", updateValue);
      input.addEventListener("change", updateValue);
      applySliderVisuals(input, parseInt(input.value, 10));
      updateTickState(input.name, parseInt(input.value, 10));
    });
  }

  function renderStep() {
    var section = SECTIONS[state.step];
    if (!section || !questionDeck) return;

    if (state.question < 0) state.question = 0;
    if (state.question >= section.questions.length) state.question = section.questions.length - 1;

    renderStepper();
    if (currentKicker) {
      currentKicker.textContent = "Stage " + (state.step + 1) + " of " + SECTIONS.length;
    }
    if (stepTitle) stepTitle.textContent = section.title;
    if (stepDesc) stepDesc.textContent = section.description;
    var remainingQuestions = section.questions.length - (state.question + 1);
    if (stepCount) stepCount.textContent = getStageNudge(remainingQuestions);
    if (progressFill) progressFill.style.width = (((state.step + 1) / SECTIONS.length) * 100) + "%";

    questionDeck.innerHTML = '<div class="gps-question-grid">' + renderQuestion(section, section.questions[state.question], state.question) + '</div>';

    bindQuestionInputs();
    syncControls();
  }

  function syncControls() {
    var section = SECTIONS[state.step];
    var onFirstQuestion = state.step === 0 && state.question === 0;
    var onLastQuestionInStep = state.question === section.questions.length - 1;
    var complete = stepComplete(state.step);
    var questionReadyMode = state.question >= section.questions.length - 2 ? "is-cta-ready" : "is-cta-pulse";
    var stageReadyMode = state.step >= SECTIONS.length - 2 ? "is-cta-ready" : "is-cta-pulse";

    if (questionBackBtn) {
      questionBackBtn.disabled = onFirstQuestion;
    }
    if (questionNextBtn) {
      questionNextBtn.disabled = !currentQuestionComplete() || onLastQuestionInStep;
      setCtaState(questionNextBtn, questionNextBtn.disabled ? "" : questionReadyMode);
    }
    if (stepBackBtn) {
      stepBackBtn.disabled = state.step === 0 || !complete;
    }
    if (stepNextBtn) {
      stepNextBtn.disabled = !complete;
      stepNextBtn.textContent = state.step === SECTIONS.length - 1 ? "Submit" : "Next Stage";
      setCtaState(stepNextBtn, stepNextBtn.disabled ? "" : stageReadyMode);
    }
  }

  function computeCategoryScore(section) {
    var total = section.questions.reduce(function (sum, _, questionIndex) {
      return sum + getAnswer(section.id + "-" + questionIndex);
    }, 0);
    var average = total / section.questions.length;
    return Math.round((average / 5) * 100);
  }

  function getStage(score) {
    return STAGES.find(function (stage) {
      return score >= stage.min && score <= stage.max;
    }) || STAGES[1];
  }

  function computeResults() {
    var scores = SECTIONS.map(function (section) {
      return {
        id: section.id,
        title: section.title,
        short: section.short,
        score: computeCategoryScore(section)
      };
    });

    var overall = Math.round(scores.reduce(function (sum, item) {
      return sum + item.score;
    }, 0) / scores.length);

    var ranked = scores.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return SECTIONS.findIndex(function (section) { return section.id === a.id; }) - SECTIONS.findIndex(function (section) { return section.id === b.id; });
    });

    var stage = getStage(overall);
    var nameValue = profileName;
    var dateValue = state.resultDate || new Date();
    var lowest = ranked[ranked.length - 1];

    return {
      name: nameValue,
      date: dateValue,
      overall: overall,
      stage: stage,
      scores: scores,
      strengths: ranked.slice(0, 2),
      focus: ranked.slice(-2).reverse(),
      recommendation: RECOMMENDATIONS[lowest.id] || "Pick one area to improve this month, then turn it into a small weekly habit.",
      title: nameValue ? nameValue + "'s Career GPS Snapshot" : "Career GPS Snapshot"
    };
  }

  function serializeResults(results) {
    return {
      name: results.name,
      date: results.date.toISOString(),
      overall: results.overall,
      stage: results.stage,
      scores: results.scores,
      strengths: results.strengths,
      focus: results.focus,
      recommendation: results.recommendation,
      title: results.title
    };
  }

  function finishAssessment() {
    if (!stepComplete(state.step)) return;
    openSubmitDialog(function (confirmed) {
      if (!confirmed) return;

      state.resultDate = new Date();
      state.results = computeResults();

      try {
        sessionStorage.setItem(resultStorageKey, JSON.stringify(serializeResults(state.results)));
      } catch (err) {
        window.alert("We could not save your snapshot locally. Please allow browser storage and try again.");
        return;
      }

      window.location.href = "careergps-dashboard.html";
    });
  }

  function ensureSubmitDialog() {
    if (submitDialogState.root) return;

    var root = document.createElement("div");
    root.className = "gps-submit-confirm";
    root.setAttribute("hidden", "");
    root.innerHTML = '' +
      '<div class="gps-submit-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby="gpsSubmitConfirmTitle" aria-describedby="gpsSubmitConfirmBody">' +
        '<p class="gps-submit-confirm__eyebrow">Final step</p>' +
        '<h3 id="gpsSubmitConfirmTitle">Submit assessment and open your dashboard?</h3>' +
        '<p id="gpsSubmitConfirmBody">Your answers will be saved in this browser session, then your Career GPS Dashboard will open.</p>' +
        '<div class="gps-submit-confirm__actions">' +
          '<button type="button" class="btn btn--ghost gps-submit-confirm__cancel">Not yet</button>' +
          '<button type="button" class="btn btn--lime gps-submit-confirm__proceed">Continue</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    submitDialogState.root = root;
    submitDialogState.panel = $(".gps-submit-confirm__dialog", root);
    submitDialogState.cancelBtn = $(".gps-submit-confirm__cancel", root);
    submitDialogState.proceedBtn = $(".gps-submit-confirm__proceed", root);

    var resolveDialog = function (decision) {
      if (!submitDialogState.resolver) return;

      var callback = submitDialogState.resolver;
      submitDialogState.resolver = null;

      root.classList.remove("is-visible");
      window.setTimeout(function () {
        root.setAttribute("hidden", "");
        document.removeEventListener("keydown", submitDialogState.handleEsc);
        callback(decision);
      }, 220);
    };

    submitDialogState.cancelBtn.addEventListener("click", function () {
      resolveDialog(false);
    });

    submitDialogState.proceedBtn.addEventListener("click", function () {
      resolveDialog(true);
    });

    root.addEventListener("click", function (event) {
      if (event.target === root) {
        resolveDialog(false);
      }
    });

    submitDialogState.handleEsc = function (event) {
      if (event.key === "Escape") {
        resolveDialog(false);
      }
    };
  }

  function openSubmitDialog(onDecision) {
    ensureSubmitDialog();
    submitDialogState.resolver = onDecision;
    submitDialogState.root.removeAttribute("hidden");

    window.requestAnimationFrame(function () {
      submitDialogState.root.classList.add("is-visible");
      submitDialogState.proceedBtn.focus();
    });

    document.addEventListener("keydown", submitDialogState.handleEsc);
  }

  if (questionBackBtn) {
    questionBackBtn.addEventListener("click", function () {
      if (state.step === 0 && state.question === 0) return;

      if (state.question > 0) {
        state.question -= 1;
      } else {
        state.step -= 1;
        state.question = SECTIONS[state.step].questions.length - 1;
      }
      renderStep();
    });
  }

  if (questionNextBtn) {
    questionNextBtn.addEventListener("click", function () {
      if (!currentQuestionComplete()) return;

      var isLastQuestionInStep = state.question === SECTIONS[state.step].questions.length - 1;

      if (isLastQuestionInStep) return;

      state.question += 1;
      renderStep();
    });
  }

  if (stepBackBtn) {
    stepBackBtn.addEventListener("click", function () {
      if (!stepComplete(state.step) || state.step === 0) return;

      state.step -= 1;
      state.question = 0;
      renderStep();
    });
  }

  if (stepNextBtn) {
    stepNextBtn.addEventListener("click", function () {
      if (!stepComplete(state.step)) return;

      var isLastStep = state.step === SECTIONS.length - 1;

      if (isLastStep) {
        finishAssessment();
        return;
      }

      state.step += 1;
      state.question = 0;
      renderStep();
    });
  }

  $all("[data-print-snapshot]").forEach(function (button) {
    button.addEventListener("click", function () {
      var savedResults = null;
      try {
        savedResults = sessionStorage.getItem(resultStorageKey);
      } catch (err) {
        savedResults = null;
      }

      if (!savedResults) {
        window.alert("Complete and submit the assessment first to view your dashboard snapshot.");
        return;
      }

      window.location.href = "careergps-dashboard.html";
    });
  });

  renderStep();
})();
