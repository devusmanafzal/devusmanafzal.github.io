async function initializePresentation() {
    const { presentation, warning } = await window.PresentationStore.load();
    if (warning) console.warn(`Ignoring invalid local presentation: ${warning}`);
  const sceneIds = presentation.scenes.map((scene) => scene.id);
  if (new Set(sceneIds).size !== sceneIds.length) throw new Error("Presentation scene IDs must be unique.");
  const previewAgentScenes = new URLSearchParams(window.location.search).get("agentPreview") === "1";
  const enabledScenes = presentation.scenes.filter((scene) => scene.enabled || (previewAgentScenes && scene.section === "agent"));
  if (!enabledScenes.length) throw new Error("Presentation must have at least one enabled scene.");
    window.PRESENTATION_CONFIG = { palette: presentation.meta.defaultPalette, ...presentation.videos };
    document.title = presentation.meta.title;
    document.documentElement.lang = presentation.meta.language;
    document.querySelector(".cinema").setAttribute("aria-label", presentation.meta.ariaLabel);
    document.querySelector(".control-hint").textContent = presentation.controls.hint;
    document.querySelector(".cinema-stage").innerHTML = enabledScenes
      .map((scene) => scene.markup.replace("<section ", `<section data-scene-id="${scene.id}" data-section="${scene.section || "enterprise"}" data-chapter="${scene.chapter || ""}" `))
      .join("\n");
    document.querySelectorAll(".story-agent .tedtalk-reveal").forEach((reveal) => {
      const button = reveal.querySelector(".tedtalk-reveal-button");
      const setOpen = (open) => {
        reveal.dataset.open = String(open);
        button.setAttribute("aria-expanded", String(open));
      };
      button.addEventListener("mouseenter", () => setOpen(true));
      button.addEventListener("mouseleave", () => setOpen(false));
      button.addEventListener("focus", () => setOpen(true));
      button.addEventListener("blur", () => setOpen(false));
      button.addEventListener("click", () => setOpen(reveal.dataset.open !== "true"));
    });
    const paletteOverride = new URLSearchParams(window.location.search).get("palette");
    document.documentElement.dataset.palette = paletteOverride || presentation.meta.defaultPalette || "keynote";
    if (presentation.meta.liveReactionsScript) {
      const reactionsScript = document.createElement("script");
      reactionsScript.src = presentation.meta.liveReactionsScript;
      reactionsScript.dataset.position = "spread";
      reactionsScript.dataset.size = "48";
      document.head.append(reactionsScript);
    }

    document.querySelectorAll("[data-video-config]").forEach((scene) => {
      const configKey = scene.dataset.videoConfig;
      const settings = window.PRESENTATION_CONFIG?.[configKey];
      if (settings?.enabled === false) {
        scene.remove();
        return;
      }
      const video = scene.querySelector("video");
      const caption = scene.querySelector(".video-caption");
      const fallbackSource = configKey === "scoutIntroAfterScene2"
        ? "assets/videos/scout-intro.mp4"
        : "assets/videos/open-the-door-web.mp4";
      video.src = settings?.src || fallbackSource;
      video.style.objectFit = settings?.fit === "contain" ? "contain" : "cover";
      const startsMuted = Boolean(settings?.muted);
      video.muted = startsMuted;
      video.defaultMuted = startsMuted;
      video.toggleAttribute("muted", startsMuted);
      video.loop = Boolean(settings?.loop);
      caption.textContent = settings?.caption || "";
      const playControl = scene.querySelector(".video-play-control");
      const playVideo = () => {
        video.play()
          .then(() => { scene.dataset.needsPlay = "false"; })
          .catch(() => { scene.dataset.needsPlay = "true"; });
      };
      playControl.addEventListener("click", (event) => {
        event.stopPropagation();
        playVideo();
      });
      video.addEventListener("click", () => {
        if (video.paused) playVideo();
        else video.pause();
      });
      video.addEventListener("play", () => { scene.dataset.needsPlay = "false"; });
      video.addEventListener("pause", () => {
        if (scene.dataset.state === "active" && !video.ended) scene.dataset.needsPlay = "true";
      });
    });

    const homeOrgBackdrop = document.querySelector(".home-org-backdrop");
    const orgChart = document.querySelector(".scene-org .keynote-org-tree");
    if (homeOrgBackdrop && orgChart) homeOrgBackdrop.append(orgChart.cloneNode(true));

    const scenes = [...document.querySelectorAll('.scene:not([data-disabled="true"])')];
    const cinema = document.querySelector(".cinema");
    const storyChapter = document.querySelector(".story-chapter");
    const sceneCount = document.querySelector(".scene-count");
    const progressFill = document.querySelector(".progress-fill");
    const controlHint = document.querySelector(".control-hint");
    const scrollCue = document.querySelector(".scroll-cue");
    const requestedScene = Number.parseInt(new URLSearchParams(window.location.search).get("scene") || "1", 10) - 1;
    const evolutionScene = scenes.find((scene) => scene.classList.contains("scene-three"));
    const autoBuildScenes = new Set([
      evolutionScene,
      ...scenes.filter((scene) => scene.classList.contains("scene-ms-approach"))
    ]);
    const autoAdvanceScene = scenes.find((scene) => scene.classList.contains("scene-event"));
    const commentaryShell = document.querySelector(".commentary-shell");
    const commentaryLauncher = commentaryShell.querySelector(".commentary-launcher");
    const commentaryBlade = commentaryShell.querySelector(".commentary-blade");
    const commentaryBackdrop = commentaryShell.querySelector(".commentary-backdrop");
    const commentaryClose = commentaryShell.querySelector(".commentary-close");
    const commentaryLabel = commentaryShell.querySelector(".commentary-scene-label");
    const commentaryTitle = commentaryShell.querySelector(".commentary-title");
    const commentaryBody = commentaryShell.querySelector(".commentary-body");
    const commentaryTakeaway = commentaryShell.querySelector(".commentary-takeaway");
    let developerSceneIndicatorVisible = sessionStorage.getItem("developerSceneIndicatorVisible") === "true";
    sceneCount.dataset.visible = String(developerSceneIndicatorVisible);
    sceneCount.setAttribute("aria-hidden", String(!developerSceneIndicatorVisible));
    const commentaryByClass = presentation.commentary;
    let currentScene = -1;
    let autoBuildTimer = 0;
    let autoAdvanceTimer = 0;
    let commentaryDisabled = sessionStorage.getItem("keynoteCommentaryDisabled") === "true";

    function commentaryForScene(scene) {
      if (!scene || scene.classList.contains("scene-video") || scene.classList.contains("scene-event") || scene.classList.contains("scene-audience-guide") || scene === scenes[scenes.length - 1]) return null;
      if (scene.classList.contains("scene-ai-architecture")) return commentaryByClass["scene-ai-architecture"];
      return Object.entries(commentaryByClass).find(([className]) => scene.classList.contains(className))?.[1] || null;
    }

    function setCommentaryOpen(open) {
      const shouldOpen = Boolean(open && commentaryShell.dataset.available === "true" && !commentaryDisabled);
      commentaryShell.dataset.open = String(shouldOpen);
      commentaryLauncher.setAttribute("aria-expanded", String(shouldOpen));
      commentaryBlade.setAttribute("aria-hidden", String(!shouldOpen));
    }

    function updateCommentary(scene) {
      const commentary = commentaryForScene(scene);
      commentaryShell.dataset.available = String(Boolean(commentary));
      commentaryShell.dataset.disabled = String(commentaryDisabled);
      if (!commentary) {
        setCommentaryOpen(false);
        return;
      }
      commentaryLabel.textContent = commentary.label;
      commentaryTitle.textContent = commentary.title;
      commentaryBody.replaceChildren(...commentary.paragraphs.map((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
      }));
      commentaryTakeaway.textContent = commentary.takeaway;
    }

    function toggleCommentaryAvailability() {
      commentaryDisabled = !commentaryDisabled;
      sessionStorage.setItem("keynoteCommentaryDisabled", String(commentaryDisabled));
      commentaryShell.dataset.disabled = String(commentaryDisabled);
      if (commentaryDisabled) setCommentaryOpen(false);
      else updateCommentary(scenes[currentScene]);
    }

    commentaryLauncher.addEventListener("click", () => setCommentaryOpen(commentaryShell.dataset.open !== "true"));
    commentaryClose.addEventListener("click", () => setCommentaryOpen(false));
    commentaryBackdrop.addEventListener("click", () => setCommentaryOpen(false));

    function buildCount(scene) {
      return Number.parseInt(scene?.dataset.builds || "0", 10);
    }

    function setBuild(scene, build) {
      const nextBuild = Math.max(0, Math.min(buildCount(scene), build));
      const currentBuild = Number.parseInt(scene.dataset.build || "0", 10);
      const title = scene === evolutionScene
        ? scene.querySelector(".journey-title")
        : scene.classList.contains("scene-ms-approach")
          ? scene.querySelector(".ms-approach-heading h2")
          : null;
      const shouldAnimateTitle = title && currentBuild === 0 && nextBuild === 1 && scene.dataset.state === "active" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldResetTitle = title && currentBuild === 1 && nextBuild === 0;
      const startBox = shouldAnimateTitle ? title.getBoundingClientRect() : null;

      if (shouldAnimateTitle || shouldResetTitle) title.classList.add("flip-moving");
      scene.dataset.build = String(nextBuild);

      if (shouldResetTitle) {
        window.requestAnimationFrame(() => title.classList.remove("flip-moving"));
        return;
      }
      if (!shouldAnimateTitle) return;
      const endBox = title.getBoundingClientRect();
      const scaleX = startBox.width / endBox.width;
      const scaleY = startBox.height / endBox.height;
      const animation = title.animate([
        {
          transform: `translate3d(${startBox.left - endBox.left}px, ${startBox.top - endBox.top}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left"
        },
        { transform: "translate3d(0, 0, 0) scale(1)", transformOrigin: "top left" }
      ], { duration: 1400, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "none" });
      animation.finished.finally(() => title.classList.remove("flip-moving"));
    }

    function clearAutoBuild() {
      window.clearTimeout(autoBuildTimer);
      autoBuildTimer = 0;
    }

    function clearAutoAdvance() {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = 0;
    }

    function scheduleAutoAdvance(scene) {
      clearAutoAdvance();
      if (scene !== autoAdvanceScene) return;
      autoAdvanceTimer = window.setTimeout(() => {
        if (scenes[currentScene] === scene) showScene(currentScene + 1);
        autoAdvanceTimer = 0;
      }, presentation.controls.autoAdvanceDelayMs);
    }

    function scheduleAutoBuild(scene) {
      clearAutoBuild();
      if (!autoBuildScenes.has(scene) || scene.dataset.build !== "0") return;
      autoBuildTimer = window.setTimeout(() => {
        if (scenes[currentScene] === scene && scene.dataset.build === "0") setBuild(scene, 1);
        autoBuildTimer = 0;
      }, presentation.controls.autoBuildDelayMs);
    }

    function showScene(nextScene) {
      clearAutoBuild();
      clearAutoAdvance();
      const boundedScene = Math.max(0, Math.min(scenes.length - 1, nextScene));
      if (boundedScene === currentScene) return;
      const previousScene = currentScene;
      const outgoingScene = scenes[previousScene];
      const incomingScene = scenes[boundedScene];
      const founderMorph = outgoingScene?.dataset.sceneId === "organization" && incomingScene?.dataset.sceneId === "personal-opening";
      const founderSource = founderMorph ? outgoingScene.querySelector(".keynote-person.you .keynote-portrait") : null;
      const founderStart = founderSource?.getBoundingClientRect();
      const approachPair = outgoingScene && incomingScene &&
        outgoingScene.classList.contains("scene-ms-approach") &&
        incomingScene.classList.contains("scene-ms-approach") &&
        outgoingScene.classList.contains("scene-ai-architecture") !== incomingScene.classList.contains("scene-ai-architecture");
      const outgoingTitle = approachPair ? outgoingScene.querySelector(".ms-approach-heading h2") : null;
      const sharedTitleStart = outgoingTitle?.getBoundingClientRect();
      const animateSharedTitle = Boolean(sharedTitleStart && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      if (animateSharedTitle) {
        outgoingTitle.style.opacity = "0";
        incomingScene.style.transition = "none";
      }
      currentScene = boundedScene;
      scenes.forEach((scene, index) => {
        const state = index < currentScene ? "past" : index === currentScene ? "active" : "future";
        scene.dataset.state = state;
        scene.setAttribute("aria-hidden", String(index !== currentScene));
      });
      setBuild(scenes[currentScene], previousScene >= 0 && currentScene < previousScene ? buildCount(scenes[currentScene]) : 0);
      if (founderStart && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const founderTarget = incomingScene.querySelector(".personal-founder-backdrop");
        const founderEnd = founderTarget?.getBoundingClientRect();
        if (founderEnd) {
          founderTarget.style.opacity = "0";
          const founderClone = founderSource.cloneNode(true);
          founderClone.classList.add("founder-morph-clone");
          Object.assign(founderClone.style, {
            left: `${founderStart.left}px`,
            top: `${founderStart.top}px`,
            width: `${founderStart.width}px`,
            height: `${founderStart.height}px`
          });
          document.body.append(founderClone);
          const founderAnimation = founderClone.animate([
            {
              left: `${founderStart.left}px`,
              top: `${founderStart.top}px`,
              width: `${founderStart.width}px`,
              height: `${founderStart.height}px`,
              opacity: 1
            },
            {
              left: `${founderEnd.left}px`,
              top: `${founderEnd.top}px`,
              width: `${founderEnd.width}px`,
              height: `${founderEnd.height}px`,
              opacity: .3
            }
          ], { duration: 1400, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" });
          founderAnimation.finished.finally(() => {
            founderTarget.style.removeProperty("opacity");
            founderClone.remove();
          });
        }
      }
      if (animateSharedTitle) {
        const incomingTitle = incomingScene.querySelector(".ms-approach-heading h2");
        const incomingSuffix = incomingScene.classList.contains("scene-ai-architecture") ? null : incomingTitle.querySelector(".approach-with");
        const sharedTitleEnd = incomingTitle.getBoundingClientRect();
        incomingTitle.classList.add("flip-moving");
        Object.assign(incomingTitle.style, {
          position: "fixed",
          left: `${sharedTitleEnd.left}px`,
          top: `${sharedTitleEnd.top}px`,
          width: `${sharedTitleEnd.width}px`,
          maxWidth: "none",
          margin: "0",
          transform: "none",
          transformOrigin: "top left",
          zIndex: "80"
        });
        const sharedTitleAnimation = incomingTitle.animate([
          {
            transform: `translate3d(${sharedTitleStart.left - sharedTitleEnd.left}px, ${sharedTitleStart.top - sharedTitleEnd.top}px, 0) scale(${sharedTitleStart.width / sharedTitleEnd.width}, ${sharedTitleStart.height / sharedTitleEnd.height})`,
            transformOrigin: "top left"
          },
          { transform: "translate3d(0, 0, 0) scale(1)", transformOrigin: "top left" }
        ], { duration: 1500, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "none" });
        if (incomingSuffix) {
          incomingSuffix.style.opacity = "0";
          const suffixAnimation = incomingSuffix.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 750, delay: 450, easing: "ease", fill: "forwards" }
          );
          suffixAnimation.finished.finally(() => {
            incomingSuffix.style.removeProperty("opacity");
            suffixAnimation.cancel();
          });
        }
        sharedTitleAnimation.finished.finally(() => {
          incomingTitle.classList.remove("flip-moving");
          ["position", "left", "top", "width", "max-width", "margin", "transform", "transform-origin", "z-index"].forEach((property) => incomingTitle.style.removeProperty(property));
          outgoingTitle.style.removeProperty("opacity");
        });
        window.requestAnimationFrame(() => incomingScene.style.removeProperty("transition"));
      }
      scheduleAutoBuild(scenes[currentScene]);
      scheduleAutoAdvance(scenes[currentScene]);
      updateCommentary(scenes[currentScene]);
      cinema.dataset.section = incomingScene.dataset.section;
      const chapter = incomingScene.dataset.section === "agent" ? "" : incomingScene.dataset.chapter;
      storyChapter.textContent = chapter;
      storyChapter.dataset.visible = String(Boolean(chapter));
      storyChapter.setAttribute("aria-hidden", String(!chapter));
      sceneCount.textContent = `${String(currentScene + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
      progressFill.style.width = `${((currentScene + 1) / scenes.length) * 100}%`;
      controlHint.dataset.hidden = "true";
      const isFinalScene = currentScene === scenes.length - 1;
      const usesDedicatedNavigation = scenes[currentScene].classList.contains("scene-home");
      scrollCue.dataset.hidden = String(isFinalScene || usesDedicatedNavigation);
      scrollCue.disabled = isFinalScene || usesDedicatedNavigation;
      scrollCue.setAttribute("aria-hidden", String(isFinalScene || usesDedicatedNavigation));
      scenes.forEach((scene, index) => {
        const video = scene.querySelector("video");
        if (!video) return;
        if (index === currentScene) {
          video.play()
            .then(() => { scene.dataset.needsPlay = "false"; })
            .catch(() => { scene.dataset.needsPlay = "true"; });
        } else {
          video.pause();
          video.currentTime = 0;
          scene.dataset.needsPlay = "false";
        }
      });
    }

    function stepForward() {
      clearAutoBuild();
      clearAutoAdvance();
      const scene = scenes[currentScene];
      const currentBuild = Number.parseInt(scene.dataset.build || "0", 10);
      if (currentBuild < buildCount(scene)) {
        setBuild(scene, currentBuild + 1);
        return;
      }
      showScene(currentScene + 1);
    }

    function stepBackward() {
      clearAutoBuild();
      clearAutoAdvance();
      const scene = scenes[currentScene];
      const currentBuild = Number.parseInt(scene.dataset.build || "0", 10);
      if (currentBuild > 0) {
        setBuild(scene, currentBuild - 1);
        return;
      }
      showScene(currentScene - 1);
    }

    function requestFullscreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }

    const interactiveSelector = "a, button, input, select, textarea, video, [role='button'], [role='dialog']";
    scrollCue.addEventListener("click", stepForward);
    document.querySelectorAll(".home-begin").forEach((button) => button.addEventListener("click", stepForward));
    document.querySelector(".cinema-stage").addEventListener("click", (event) => {
      if (!event.target.closest(interactiveSelector)) stepForward();
    });

    let wheelLocked = false;
    document.addEventListener("wheel", (event) => {
      if (event.target.closest(".commentary-blade") || Math.abs(event.deltaY) < 20 || wheelLocked) return;
      event.preventDefault();
      wheelLocked = true;
      (event.deltaY > 0 ? stepForward : stepBackward)();
      window.setTimeout(() => { wheelLocked = false; }, presentation.controls.wheelLockMs);
    }, { passive: false });

    document.addEventListener("keydown", (event) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        stepForward();
      }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        stepBackward();
      }
      if (event.key === "Home") showScene(0);
      if (event.key === "End") showScene(scenes.length - 1);
      if (event.key.toLowerCase() === "f") requestFullscreen();
      if (event.key.toLowerCase() === "t") {
        const currentPalette = document.documentElement.dataset.palette;
        document.documentElement.dataset.palette = currentPalette === "workscape" ? "keynote" : "workscape";
      }
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        toggleCommentaryAvailability();
      }
      if (event.key.toLowerCase() === "d") {
        event.preventDefault();
        developerSceneIndicatorVisible = !developerSceneIndicatorVisible;
        sessionStorage.setItem("developerSceneIndicatorVisible", String(developerSceneIndicatorVisible));
        sceneCount.dataset.visible = String(developerSceneIndicatorVisible);
        sceneCount.setAttribute("aria-hidden", String(!developerSceneIndicatorVisible));
      }
      if (event.key === "Escape") setCommentaryOpen(false);
      if (event.key.toLowerCase() === "m") {
        const video = scenes[currentScene].querySelector("video");
        if (video) video.muted = !video.muted;
      }
    });

    let touchStartX = 0;
    document.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    document.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > presentation.controls.swipeThresholdPx) (distance < 0 ? stepForward : stepBackward)();
    }, { passive: true });

    const canvas = document.querySelector(".cinema-canvas");
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles = [];

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 18)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.8 + 1.15,
        speed: Math.random() * .48 + .18,
        drift: Math.random() * .28 - .14,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function drawField() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const textColor = getComputedStyle(document.documentElement).getPropertyValue("--cp-text-muted").trim();
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--cp-accent").trim();
      particles.forEach((particle, index) => {
        const neighbor = particles[index + 1];
        if (!neighbor) return;
        const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
        if (distance < 155) {
          context.beginPath();
          context.strokeStyle = index % 9 === 0 ? accentColor : textColor;
          context.globalAlpha = (1 - distance / 155) * .24;
          context.moveTo(particle.x, particle.y);
          context.lineTo(neighbor.x, neighbor.y);
          context.stroke();
        }
      });
      particles.forEach((particle, index) => {
        particle.y -= reducedMotion ? 0 : particle.speed;
        particle.phase += reducedMotion ? 0 : .008;
        particle.x += reducedMotion ? 0 : particle.drift + Math.sin(particle.phase) * .12;
        if (particle.y < -5) particle.y = window.innerHeight + 5;
        if (particle.x < -5) particle.x = window.innerWidth + 5;
        if (particle.x > window.innerWidth + 5) particle.x = -5;
        context.beginPath();
        context.fillStyle = index % 13 === 0 ? accentColor : textColor;
        context.globalAlpha = index % 9 === 0 ? .9 : .52;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      if (!reducedMotion) requestAnimationFrame(drawField);
    }

    resizeCanvas();
    drawField();
    window.addEventListener("resize", resizeCanvas);
    showScene(Number.isNaN(requestedScene) ? 0 : requestedScene);

    const lightbox = document.querySelector(".lightbox");
    const lightboxStage = document.querySelector(".lightbox-stage");
    const frameButtons = document.querySelectorAll(".frame-button");

    function closeLightbox() {
      lightbox.dataset.open = "false";
      lightboxStage.replaceChildren();
    }

    frameButtons.forEach((button) => {
      button.addEventListener("click", () => {
        lightboxStage.append(button.querySelector(".frame").cloneNode(true));
        lightbox.dataset.open = "true";
      });
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });

    const pageMorph = document.querySelector(".page-morph");
    const deskLaunch = document.querySelector(".desk-launch");
    function morphOrigin(element) {
      const rect = element.getBoundingClientRect();
      return { x: ((rect.left + rect.width / 2) / window.innerWidth) * 100, y: ((rect.top + rect.height / 2) / window.innerHeight) * 100 };
    }
    function setMorphOrigin(origin) {
      pageMorph.style.setProperty("--morph-x", `${origin.x}%`);
      pageMorph.style.setProperty("--morph-y", `${origin.y}%`);
    }
    const incomingMorph = sessionStorage.getItem("keynoteMorphIncoming");
    if (incomingMorph === "keynote") {
      const origin = JSON.parse(sessionStorage.getItem("keynoteMorphOrigin") || '{"x":75,"y":75}');
      setMorphOrigin(origin);
      pageMorph.classList.add("reveal");
      sessionStorage.removeItem("keynoteMorphIncoming");
      setTimeout(() => pageMorph.classList.remove("reveal"), 800);
    }
    deskLaunch?.addEventListener("click", () => {
      const origin = morphOrigin(deskLaunch);
      setMorphOrigin(origin);
      sessionStorage.setItem("keynoteMorphIncoming", "desk");
      sessionStorage.setItem("keynoteMorphOrigin", JSON.stringify(origin));
      pageMorph.classList.add("cover");
      const theme = document.documentElement.dataset.theme || "dark";
      const palette = document.documentElement.dataset.palette || "keynote";
      window.setTimeout(() => { window.location.href = `agency.html?scoutTheme=${theme}&palette=${palette}`; }, 700);
    });
}

initializePresentation().catch((error) => {
  console.error(error);
  document.body.dataset.loadError = "true";
  const errorPanel = document.querySelector(".presentation-load-error");
  errorPanel.querySelector(".presentation-load-error-message").textContent = error.message;
  errorPanel.hidden = false;
});
