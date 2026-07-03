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
      description: "Can I make intentional decisions about my future?",
      questions: [
        "I have written down goals for the next 12 months.",
        "I know which skills will have the biggest impact on my future goals.",
        "I regularly review my goals and priorities.",
        "I can clearly explain what I am currently working toward and why it matters."
      ]
    },
    {
      id: "visibility",
      title: "Visibility",
      short: "Visibility",
      description: "Can others understand and recognize my value?",
      questions: [
        "I can explain the value I bring in one minute or less.",
        "My online profile reflects my strengths, interests, and aspirations.",
        "People often recognize me for specific strengths or expertise.",
        "I actively share my work, learning, or ideas with others."
      ]
    },
    {
      id: "capability",
      title: "Capability",
      short: "Capability",
      description: "Can I consistently turn effort into results?",
      questions: [
        "I plan my week before it starts.",
        "I have a reliable system for tracking priorities and commitments.",
        "I consistently complete important tasks and follow through on commitments.",
        "I use routines, templates, or workflows to reduce repeated effort."
      ]
    },
    {
      id: "amplification",
      title: "Amplification",
      short: "Amplification",
      description: "Can I use AI and technology to multiply my impact?",
      questions: [
        "I use AI tools regularly to support my work, studies, or learning.",
        "I know how to improve an AI response when the first answer is not useful.",
        "I verify important AI-generated information before using it.",
        "I have at least one AI-assisted workflow that saves me meaningful time."
      ]
    }
  ];

  var STAGES = [
    {
      min: 0,
      max: 49,
      label: "Explorer",
      message: "You are exploring possibilities and building clarity about your future.",
      primaryFocus: ["Direction", "Consistency"]
    },
    {
      min: 50,
      max: 64,
      label: "Builder",
      message: "You have begun taking intentional action and are building foundations for growth.",
      primaryFocus: ["Execution", "Visibility"]
    },
    {
      min: 65,
      max: 79,
      label: "Momentum Builder",
      message: "You have direction and momentum. The next step is making your strengths more visible and amplifying your impact.",
      primaryFocus: ["Visibility", "AI leverage"]
    },
    {
      min: 80,
      max: 89,
      label: "Amplifier",
      message: "You are intentionally using your strengths, systems, and AI to increase your impact.",
      primaryFocus: ["Scaling influence", "Creating opportunities"]
    },
    {
      min: 90,
      max: 100,
      label: "Catalyst",
      message: "You consistently create opportunities, execute effectively, and help others grow.",
      primaryFocus: ["Leadership", "Multiplying impact"]
    }
  ];

  var RECOMMENDATIONS = {
    direction: "Write down one clear 12-month direction and name the three capabilities that would move you toward it fastest.",
    visibility: "Sharpen how you communicate your value. Create a one-line value statement and update one public profile this week.",
    capability: "Pick one weekly system that improves execution, then track your progress for the next 30 days.",
    amplification: "Use AI and technology intentionally for one recurring workflow, and document a repeatable process you can improve over time."
  };

  var MAX_QUESTION_SCORE = 5;

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
    lastQuestionConfirm: {},
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
  var stageHint = $("#gpsStageHint");
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
      1: "No",
      2: "Rarely",
      3: "Sometimes",
      4: "Often",
      5: "Consistently"
    };
    return labels[value] || "Sometimes";
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

  function currentStepKey() {
    return SECTIONS[state.step].id;
  }

  function hasLastQuestionConfirm() {
    return Boolean(state.lastQuestionConfirm[currentStepKey()]);
  }

  function setLastQuestionConfirm(value) {
    state.lastQuestionConfirm[currentStepKey()] = Boolean(value);
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
    if (!Object.prototype.hasOwnProperty.call(state.answers, qid)) {
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
        '<div class="gps-scale-labels"><span>' + scoreLabel(1) + '</span><span class="gps-scale-current" id="' + qid + '-label">' + scoreLabel(selected) + '</span><span>' + scoreLabel(5) + '</span></div>' +
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

  function emphasizeStepNext() {
    if (!stepNextBtn || stepNextBtn.disabled) return;
    stepNextBtn.classList.add("is-stage-attention");
    window.setTimeout(function () {
      if (stepNextBtn) stepNextBtn.classList.remove("is-stage-attention");
    }, 1250);
  }

  function averageToPercent(averageScore) {
    return Math.round((averageScore / MAX_QUESTION_SCORE) * 100);
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

    if (state.question < section.questions.length - 1) {
      setLastQuestionConfirm(false);
    }

    renderStepper();
    if (currentKicker) {
      currentKicker.textContent = "Stage " + (state.step + 1) + " of " + SECTIONS.length;
    }
    if (stepTitle) stepTitle.textContent = section.title;
    if (stepDesc) stepDesc.textContent = section.description;
    if (progressFill) progressFill.style.width = (((state.step + 1) / SECTIONS.length) * 100) + "%";

    questionDeck.innerHTML = '<div class="gps-question-grid">' + renderQuestion(section, section.questions[state.question], state.question) + '</div>';

    bindQuestionInputs();
    syncControls();
  }

  function syncControls() {
    var section = SECTIONS[state.step];
    var onFirstQuestion = state.step === 0 && state.question === 0;
    var onLastQuestionInStep = state.question === section.questions.length - 1;
    var stageAdvanceConfirmed = hasLastQuestionConfirm();
    var complete = stepComplete(state.step);
    var questionReadyMode = state.question >= section.questions.length - 2 ? "is-cta-ready" : "is-cta-pulse";
    var stageReadyMode = state.step >= SECTIONS.length - 2 ? "is-cta-ready" : "is-cta-pulse";

    if (questionBackBtn) {
      questionBackBtn.disabled = onFirstQuestion;
    }
    if (questionNextBtn) {
      var questionCanAdvance = currentQuestionComplete() && (!onLastQuestionInStep || !stageAdvanceConfirmed);
      questionNextBtn.disabled = !questionCanAdvance;
      setCtaState(questionNextBtn, questionNextBtn.disabled ? "" : (onLastQuestionInStep ? "is-cta-pulse" : questionReadyMode));
    }
    if (stageHint) {
      if (onLastQuestionInStep && stageAdvanceConfirmed) {
        stageHint.textContent = "All done here — click Next Stage below to continue.";
        stageHint.classList.add("is-visible");
      } else {
        stageHint.textContent = "";
        stageHint.classList.remove("is-visible");
      }
    }
    if (stepBackBtn) {
      stepBackBtn.disabled = state.step === 0 || !complete;
    }
    if (stepNextBtn) {
      stepNextBtn.disabled = !complete || (onLastQuestionInStep && !stageAdvanceConfirmed);
      stepNextBtn.textContent = state.step === SECTIONS.length - 1 ? "Submit" : "Next Stage";
      setCtaState(stepNextBtn, stepNextBtn.disabled ? "" : stageReadyMode);
    }
  }

  function computeCategoryScore(section) {
    var total = section.questions.reduce(function (sum, _, questionIndex) {
      return sum + getAnswer(section.id + "-" + questionIndex);
    }, 0);
    var average = total / section.questions.length;
    return averageToPercent(average);
  }

  function getStage(score) {
    return STAGES.find(function (stage) {
      return score >= stage.min && score <= stage.max;
    }) || STAGES[0];
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

      if (isLastQuestionInStep) {
        if (!hasLastQuestionConfirm()) {
          setLastQuestionConfirm(true);
          syncControls();
          emphasizeStepNext();
        }
        return;
      }

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
