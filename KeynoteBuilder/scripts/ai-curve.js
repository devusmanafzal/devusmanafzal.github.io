(() => {
  "use strict";

  const deck = window.KEYNOTE_DECK || {};
  const dataUrl = deck.dataUrl || window.PRESENTATION_SOURCE?.dataUrl || "data/ai-curve.json";
  const stage = document.querySelector("#stage");
  const tooltip = document.querySelector("#chart-tooltip");
  const overview = document.querySelector("#overview");
  const notes = document.querySelector("#notes");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const number = (value) => Number(value.toFixed(2));
  const pad = (value) => String(value).padStart(2, "0");
  let presentation;
  let current = 0;
  let returnFocus;
  let wheelTotal = 0;
  let wheelTime = 0;
  let wheelLockUntil = 0;

  function bindCanonical(data) {
    const scenes = data.scenes.filter((scene) => scene.enabled).map((scene) => {
      const template = document.createElement("template");
      template.innerHTML = scene.markup.trim();
      const root = template.content.firstElementChild;
      root.className = scene.className;
      root.dataset.state = "active";
      root.setAttribute("aria-hidden", "false");
      const commentary = Object.entries(data.commentary)
        .find(([className]) => root.classList.contains(className))?.[1];
      if (!commentary || !Array.isArray(commentary.paragraphs) ||
          !commentary.paragraphs.every((paragraph) => typeof paragraph === "string")) {
        throw new Error(`Scene ${scene.id} has no valid presenter commentary.`);
      }
      const heading = root.querySelector("h1")?.cloneNode(true);
      heading?.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      const sourceNote = root.querySelector(".scene-source p")?.cloneNode(true);
      sourceNote?.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      const chartData = root.querySelector(".chart-wrap")?.dataset.chart;
      return {
        ...scene,
        type: root.dataset.curveType,
        title: heading?.textContent.trim() || commentary.title,
        chapter: scene.chapter || "",
        chart: chartData ? JSON.parse(chartData) : undefined,
        notes: commentary.paragraphs,
        takeaway: commentary.takeaway,
        source: sourceNote?.textContent || data.meta.dataNote,
        caveat: root.querySelector(".scene-source .caveat")?.textContent,
        markup: root.outerHTML
      };
    });
    if (!scenes.length) throw new Error("At least one scene must be enabled.");
    return { ...data, scenes, chapters: [], references: [] };
  }

  function validate(data) {
    const types = ["hero", "map", "line", "comparison", "bars", "race", "slope", "platform", "close", "references", ...(deck.sceneTypes || [])];
    if (!data?.meta?.title || !Array.isArray(data.scenes) || !data.scenes.length ||
        !Array.isArray(data.chapters) || !Array.isArray(data.references)) {
      throw new Error("The presentation JSON is missing its metadata, scenes, chapters or references.");
    }
    const ids = new Set();
    for (const scene of data.scenes) {
      if (!scene.id || ids.has(scene.id) || !types.includes(scene.type) ||
          !scene.title || !Array.isArray(scene.notes)) {
        throw new Error(`Invalid or duplicate scene: ${scene.id || "(no ID)"}.`);
      }
      ids.add(scene.id);
      if (deck.sceneTypes?.includes(scene.type)) {
        deck.validateScene(scene, data);
        continue;
      }
      if (["hero", "map", "close", "references"].includes(scene.type)) continue;
      const chart = scene.chart;
      if (!chart || !Array.isArray(chart.series) || !chart.series.length) {
        throw new Error(`Scene ${scene.id} has no chart series.`);
      }
      for (const key of ["xDomain", "yDomain"]) {
        const domain = chart[key];
        if (!Array.isArray(domain) || domain.length !== 2 ||
            !domain.every(Number.isFinite) || domain[0] >= domain[1]) {
          throw new Error(`Scene ${scene.id} has an invalid ${key}.`);
        }
      }
      if (chart.log && chart.yDomain[0] <= 0) throw new Error(`Scene ${scene.id} has a nonpositive log domain.`);
      for (const series of chart.series) {
        if (!["accent", "soft", "muted", "text", "faint"].includes(series.style) || !series.points?.length) {
          throw new Error(`Scene ${scene.id} has an invalid series.`);
        }
        series.points.forEach((point, index) => {
          if (!Number.isFinite(point[0]) || !Number.isFinite(point[1]) ||
              (index > 0 && point[0] <= series.points[index - 1][0]) ||
              point[0] < chart.xDomain[0] || point[0] > chart.xDomain[1] ||
              point[1] < chart.yDomain[0] || point[1] > chart.yDomain[1]) {
            throw new Error(`Scene ${scene.id}, ${series.name}: invalid or out-of-domain point ${index + 1}.`);
          }
        });
      }
    }
    for (const chapter of data.chapters) {
      if (!chapter.sceneIds?.every((id) => ids.has(id))) throw new Error("A chapter links to an unknown scene.");
    }
    for (const reference of data.references) {
      if (new URL(reference.url).protocol !== "https:") throw new Error("References must use HTTPS.");
    }
  }

  // Monotone Hermite tangents prevent smoothed curves from inventing peaks between observations.
  function curvePath(points, straight = false) {
    if (!points.length) return "";
    const start = `M${number(points[0][0])},${number(points[0][1])}`;
    if (points.length === 1) return start;
    if (straight || points.length === 2) {
      return start + points.slice(1).map(([x, y]) => `L${number(x)},${number(y)}`).join("");
    }
    const slopes = points.slice(1).map((point, index) =>
      (point[1] - points[index][1]) / (point[0] - points[index][0]));
    const tangents = points.map((point, index) => {
      if (index === 0) return slopes[0];
      if (index === points.length - 1) return slopes[slopes.length - 1];
      if (slopes[index - 1] * slopes[index] <= 0) return 0;
      const before = point[0] - points[index - 1][0];
      const after = points[index + 1][0] - point[0];
      const w1 = 2 * after + before;
      const w2 = after + 2 * before;
      return (w1 + w2) / (w1 / slopes[index - 1] + w2 / slopes[index]);
    });
    slopes.forEach((slope, index) => {
      if (slope === 0) {
        tangents[index] = 0;
        tangents[index + 1] = 0;
      } else {
        const a = tangents[index] / slope;
        const b = tangents[index + 1] / slope;
        const length = Math.hypot(a, b);
        if (length > 3) {
          tangents[index] = 3 * a * slope / length;
          tangents[index + 1] = 3 * b * slope / length;
        }
      }
    });
    return start + points.slice(1).map(([x, y], index) => {
      const [px, py] = points[index];
      const third = (x - px) / 3;
      return `C${number(px + third)},${number(py + third * tangents[index])} ${number(x - third)},${number(y - third * tangents[index + 1])} ${number(x)},${number(y)}`;
    }).join("");
  }

  function text(x, y, value, className = "", anchor = "start") {
    return `<text x="${number(x)}" y="${number(y)}" class="${className}" text-anchor="${anchor}">${escape(value)}</text>`;
  }

  function chartMarkup(scene, height = 390) {
    const chart = scene.chart;
    const bounds = { left: 72, right: scene.type === "race" ? 570 : 760, top: 24, bottom: height - 58 };
    const { left, right, top, bottom } = bounds;
    const x = (value) => left + (value - chart.xDomain[0]) / (chart.xDomain[1] - chart.xDomain[0]) * (right - left);
    const y = (value) => {
      const transform = chart.log ? Math.log10 : (entry) => entry;
      return bottom - (transform(value) - transform(chart.yDomain[0])) /
        (transform(chart.yDomain[1]) - transform(chart.yDomain[0])) * (bottom - top);
    };
    let markup = `<svg class="chart" viewBox="0 0 1000 ${height}" role="img" aria-labelledby="${scene.id}-chart-title ${scene.id}-chart-desc"><title id="${scene.id}-chart-title">${escape(chart.title)}</title><desc id="${scene.id}-chart-desc">${escape(chart.subtitle)}. ${escape(scene.caveat)} Focus plotted points for values.</desc>`;
    chart.yTicks.forEach(([value, label]) => {
      markup += `<line class="grid-line" x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}"/>`;
      markup += text(left - 14, y(value) + 4, label, "axis-label", "end");
    });
    markup += `<line class="axis-line" x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}"/>`;
    chart.xTicks.forEach(([value, label], index) => {
      const closeToPrevious = index > 0 && x(value) - x(chart.xTicks[index - 1][0]) < 88;
      markup += text(x(value), bottom + (closeToPrevious ? 44 : 26), label, "axis-label", "middle");
    });
    if (chart.breakAt !== undefined) {
      markup += `<line class="guide" x1="${x(chart.breakAt)}" y1="${top}" x2="${x(chart.breakAt)}" y2="${bottom}"/>`;
      markup += text(x(chart.breakAt) - 12, top + 8, chart.breakLabel, "guide-label", "end");
    }

    const endpoints = [];
    chart.series.forEach((series, seriesIndex) => {
      const points = series.points.map(([px, py]) => [x(px), y(py)]);
      const straight = ["comparison", "slope"].includes(scene.type);
      const path = curvePath(points, straight);
      const style = `series-${series.style}`;
      const delay = `${seriesIndex * .16}s`;
      const forecastIndex = series.forecastFrom;
      const actualPoints = forecastIndex === undefined ? points : points.slice(0, forecastIndex + 1);
      const actualPath = curvePath(actualPoints, straight);
      if (chart.area && seriesIndex === 0) {
        markup += `<path class="area" d="${path}L${points.at(-1)[0]},${bottom}L${points[0][0]},${bottom}Z"/>`;
      }
      if (scene.type === "bars") {
        const barWidth = Math.min(72, (right - left) / (series.points.length * 1.7));
        points.forEach(([px, py], index) => {
          const guided = forecastIndex !== undefined && index > forecastIndex;
          markup += `<rect class="chart-bar${guided ? " guided-bar" : ""}" x="${px - barWidth / 2}" y="${py}" width="${barWidth}" height="${bottom - py}" rx="5" style="--delay:${index * .09}s"/>`;
          markup += text(px, py - 15, series.points[index][1] + (scene.id === "annual-capex" ? "B" : "M"), "endpoint data-label", "middle");
        });
      }
      if (!series.breakConnection) {
        markup += `<path class="curve ${style}${series.dashed ? " series-dashed" : ""}" pathLength="1" d="${actualPath}" style="--delay:${delay}"/>`;
      }
      if (forecastIndex !== undefined) {
        markup += `<path class="curve forecast ${style}" d="${curvePath(points.slice(forecastIndex), straight)}"/>`;
      }
      points.forEach(([px, py], pointIndex) => {
        const point = series.points[pointIndex];
        const xLabel = chart.xTicks.find(([value]) => value === point[0])?.[1] ||
          (scene.type === "comparison" ? `Year ${point[0]}` : "");
        const value = `${chart.valuePrefix || ""}${point[1]}${chart.unit ?? (chart.log ? "" : "%")}`;
        const detail = point[2] || `${xLabel ? `${xLabel} · ` : ""}${value}`;
        const tip = `${series.name}|${detail}`;
        markup += `<circle class="point ${style}" cx="${px}" cy="${py}" r="${seriesIndex === 0 ? 4.5 : 3.5}" style="--delay:${.3 + pointIndex * .08 + seriesIndex * .12}s"/>`;
        markup += `<circle class="hit-point" cx="${px}" cy="${py}" r="13" tabindex="0" role="img" aria-label="${escape(`${series.name}: ${detail}`)}" data-tooltip="${escape(tip)}"><title>${escape(`${series.name}: ${detail}`)}</title></circle>`;
      });
      if (scene.type !== "race" && scene.type !== "bars") {
        endpoints.push({ x: points.at(-1)[0], y: points.at(-1)[1], label: series.endLabel, style });
      }
      if (seriesIndex === 0 && !motion.matches && !series.breakConnection && scene.type !== "bars") {
        markup += `<circle class="flow-dot" r="3"><animateMotion dur="7s" begin="0s" repeatCount="indefinite" path="${escape(actualPath)}"/></circle>`;
      }
    });

    endpoints.sort((a, b) => a.y - b.y);
    endpoints.forEach((endpoint, index) => {
      endpoint.labelY = Math.max(top + 8, Math.min(bottom, endpoint.y));
      endpoint.labelWidth = (endpoint.label || "").length * 8.5;
      endpoints.slice(0, index).forEach((previous) => {
        const horizontalOverlap = endpoint.x < previous.x + previous.labelWidth + 12 &&
          previous.x < endpoint.x + endpoint.labelWidth + 12;
        if (horizontalOverlap && endpoint.labelY - previous.labelY < 25) endpoint.labelY = previous.labelY + 25;
      });
    });
    for (let index = endpoints.length - 1; index >= 0; index -= 1) {
      const endpoint = endpoints[index];
      endpoint.labelY = Math.min(bottom, endpoint.labelY);
      endpoints.slice(index + 1).forEach((next) => {
        const horizontalOverlap = endpoint.x < next.x + next.labelWidth + 12 &&
          next.x < endpoint.x + endpoint.labelWidth + 12;
        if (horizontalOverlap && next.labelY - endpoint.labelY < 25) endpoint.labelY = next.labelY - 25;
      });
    }
    endpoints.forEach((endpoint) => {
      if (!endpoint.label) return;
      if (Math.abs(endpoint.labelY - endpoint.y) > 5) {
        markup += `<path class="label-connector ${endpoint.style}" d="M${endpoint.x + 7},${endpoint.y}L${endpoint.x + 18},${endpoint.labelY}" fill="none" stroke-width="1"/>`;
      }
      if (scene.type === "comparison") {
        markup += `<rect class="label-backdrop" x="${endpoint.x + 18}" y="${endpoint.labelY - 14}" width="${endpoint.labelWidth + 8}" height="25" rx="3"/>`;
      }
      markup += text(endpoint.x + 22, endpoint.labelY + 5, endpoint.label, "endpoint data-label");
    });
    if (scene.type === "race") {
      markup += text(654, 14, "2025 / THE ADOPTION LEAD", "guide-label");
      chart.series.forEach((series, index) => {
        const value = series.points.at(-1)[1];
        const py = 42 + index * (height - 84) / 3;
        markup += text(654, py, series.name, "endpoint");
        markup += text(976, py, `${value.toFixed(1)}%`, "endpoint", "end");
        markup += `<rect x="654" y="${py + 13}" width="322" height="8" rx="4" fill="var(--cp-border)"/>`;
        markup += `<rect class="rank-bar series-${series.style}" x="654" y="${py + 13}" width="${322 * value / 50}" height="8" rx="4" style="--delay:${index * .2}s"/>`;
      });
    }
    markup += "</svg>";
    const legend = chart.series.length > 1
      ? `<div class="legend">${chart.series.map((series) => `<span><i class="${series.style}${series.dashed ? " dashed" : ""}"></i>${escape(series.name)}</span>`).join("")}</div>` : "";
    return `<div class="chart-wrap"><p class="chart-title">${escape(chart.title)}</p><p class="chart-subtitle">${escape(chart.subtitle)}</p>${markup}${legend}</div>`;
  }

  function fitChart() {
    const svg = stage.querySelector(".chart-wrap > svg");
    if (!svg || !presentation) return;
    const box = svg.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return;
    const height = Math.max(230, Math.round(1000 * box.height / box.width));
    const template = document.createElement("template");
    template.innerHTML = chartMarkup(presentation.scenes[current], height);
    svg.replaceWith(template.content.querySelector("svg"));
  }

  function heroCurve(className = "") {
    return `<svg class="chart ${className}" viewBox="0 0 700 480" aria-hidden="true"><path class="area" d="M0,460C170,460 210,444 305,365S470,235 510,175S605,100 700,15L700,480L0,480Z"/><path class="curve series-muted" pathLength="1" d="M0,470C190,465 270,439 350,385S530,245 700,145"/><path class="curve series-soft" pathLength="1" style="--delay:.15s" d="M0,465C180,464 230,453 315,389S482,260 535,194S627,126 700,85"/><path class="curve series-accent" pathLength="1" style="--delay:.3s" d="M0,460C170,460 210,444 305,365S470,235 510,175S605,100 700,15"/></svg>`;
  }

  function heading(scene) {
    const parts = scene.title.split("|");
    const separator = scene.variant === "wide" ? " " : "<br>";
    return `<p class="eyebrow">${escape(scene.eyebrow)}</p><h1>${escape(parts[0])}${parts[1] ? `${separator}<em>${escape(parts[1])}</em>` : ""}</h1>`;
  }

  function renderScene(scene) {
    if (scene.markup) return scene.markup;
    if (deck.sceneTypes?.includes(scene.type)) return deck.renderScene(scene, presentation);
    if (scene.type === "hero") {
      return `<section class="scene hero" aria-label="The AI Curve">${heroCurve("hero-svg")}<p class="eyebrow">${escape(scene.eyebrow)}</p><h1>The AI<br><em>curve.</em></h1><p class="hero-copy">${escape(scene.description).replace("\n", "<br>")}</p><p class="byline">${escape(presentation.meta.presenter)} / ${escape(presentation.meta.role)}</p><button class="begin" data-next>Follow the curve <span aria-hidden="true">&#8594;</span></button><span class="edition">13 IDEAS / FOUR CHAPTERS</span></section>`;
    }
    if (scene.type === "map") {
      const paths = ["M0,60C80,60 100,60 150,5", "M0,60C50,60 90,40 150,5", "M0,60C50,20 80,65 150,5", "M0,60C50,60 50,5 150,5"];
      return `<section class="scene">${heading(scene)}<p class="deck">${escape(scene.description)}</p><div class="chapter-grid">${presentation.chapters.map((chapter, index) =>
        `<article class="chapter-card" style="--delay:${index * .12}s"><span class="chapter-number">${chapter.number} / ${escape(chapter.subtitle)}</span><h2>${escape(chapter.title)}</h2><svg viewBox="0 0 150 70" aria-hidden="true"><path class="mini-curve" d="${paths[index]}"/></svg>${chapter.sceneIds.map((id) => {
          const item = presentation.scenes.find((entry) => entry.id === id);
          return `<button type="button" data-scene="${escape(id)}"><span>${pad(presentation.scenes.indexOf(item) + 1)}</span>${escape(item.eyebrow.replace(/^IDEA \d+ \/ /, ""))}</button>`;
        }).join("")}</article>`).join("")}</div></section>`;
    }
    if (scene.type === "close") {
      const paths = ["M5,90C90,90 120,80 200,5", "M5,5C90,80 120,88 200,90", "M5,90C60,90 90,30 200,5"];
      return `<section class="scene closing">${heading(scene)}<p class="deck">${escape(scene.description).replace("\n", "<br>")}</p><div class="closing-curves">${["CAPABILITY UP", "COST DOWN", "ADOPTION UP"].map((label, index) => `<div><svg class="chart" viewBox="0 0 210 100" aria-hidden="true"><path class="curve series-accent" pathLength="1" d="${paths[index]}" style="--delay:${index * .25}s"/></svg><p>${label}</p></div>`).join("")}</div><p class="eyebrow">START WITH ONE OUTCOME. BUILD FOR THE CURVE.</p></section>`;
    }
    if (scene.type === "references") {
      return `<section class="scene references">${heading(scene)}<p class="deck">${escape(scene.description)}</p><div class="reference-list">${presentation.references.map((reference) => `<a href="${escape(reference.url)}" target="_blank" rel="noopener noreferrer"><span>${escape(reference.label)} <span aria-hidden="true">&#8599;</span></span><small>${escape(reference.detail)}</small></a>`).join("")}</div><div class="scene-source"><p>${escape(presentation.meta.dataNote)}</p><p>Source slide ${scene.sourceSlide}</p></div></section>`;
    }
    return `<section class="scene scene-${scene.variant || "standard"} scene-type-${scene.type}" aria-label="${escape(scene.title.replace("|", " "))}">${heading(scene)}<p class="deck">${escape(scene.description)}</p><div class="scene-body">${chartMarkup(scene)}<aside class="insight"><strong class="metric">${escape(scene.metric)}</strong><p class="metric-label">${escape(scene.metricLabel)}</p><h2>${escape(scene.insightTitle)}</h2><p>${escape(scene.insight)}</p></aside></div><div class="scene-source"><p>${escape(scene.source)}<br>Source slide ${scene.sourceSlide} / Hover or focus points to explore.</p><p class="caveat">${escape(scene.caveat)}</p></div></section>`;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function showTooltip(target) {
    const [name, detail] = target.dataset.tooltip.split("|");
    tooltip.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = name;
    tooltip.append(strong, document.createTextNode(detail));
    tooltip.hidden = false;
    const bounds = target.getBoundingClientRect();
    const tip = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(12, Math.min(window.innerWidth - tip.width - 12, bounds.x + 18))}px`;
    tooltip.style.top = `${Math.max(12, Math.min(window.innerHeight - tip.height - 12, bounds.y - tip.height - 12))}px`;
  }

  function closeOverlays(restoreFocus = true) {
    overview.hidden = true;
    notes.hidden = true;
    stage.inert = false;
    document.querySelector(".masthead").inert = false;
    document.querySelector(".transport").inert = false;
    document.querySelector("#overview-toggle").setAttribute("aria-expanded", "false");
    document.querySelector("#notes-toggle").setAttribute("aria-expanded", "false");
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
  }

  function openOverlay(overlay, trigger) {
    if (!overlay.hidden) {
      closeOverlays();
      return;
    }
    closeOverlays(false);
    hideTooltip();
    returnFocus = trigger;
    overlay.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    stage.inert = true;
    document.querySelector(".masthead").inert = true;
    document.querySelector(".transport").inert = true;
    overlay.querySelector("button").focus();
  }

  function showScene(index, updateHistory = true) {
    current = Math.max(0, Math.min(presentation.scenes.length - 1, index));
    closeOverlays(false);
    hideTooltip();
    const focusWasInStage = stage.contains(document.activeElement);
    const scene = presentation.scenes[current];
    stage.innerHTML = renderScene(scene);
    stage.dataset.sceneId = scene.id;
    stage.querySelectorAll(".chapter-card [data-scene]").forEach((button) => {
      const index = presentation.scenes.findIndex((entry) => entry.id === button.dataset.scene);
      button.disabled = index < 0;
      if (index >= 0) button.querySelector("span").textContent = pad(index + 1);
    });
    fitChart();
    if (focusWasInStage) stage.focus({ preventScroll: true });
    document.querySelector("#current-number").textContent = pad(current + 1);
    document.querySelector("#chapter-name").textContent = scene.chapter;
    document.querySelector("#progress").style.width = `${(current + 1) / presentation.scenes.length * 100}%`;
    document.querySelector("#previous").disabled = current === 0;
    document.querySelector("#next").disabled = current === presentation.scenes.length - 1;
    document.querySelector("#announcement").textContent = `Scene ${current + 1} of ${presentation.scenes.length}. ${scene.title.replace("|", " ")}`;
    document.querySelectorAll("#scene-index button").forEach((button, buttonIndex) => {
      if (buttonIndex === current) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    document.querySelector("#notes-content").innerHTML = `<h2 id="notes-title">${escape(scene.title.replace("|", " "))}</h2>${scene.notes.map((paragraph) => `<p>${escape(paragraph)}</p>`).join("")}<p class="takeaway">${escape(scene.takeaway)}</p><small>${escape(scene.source || presentation.meta.dataNote)}</small>${scene.caveat ? `<small>${escape(scene.caveat)}</small>` : ""}`;
    if (updateHistory) {
      const url = new URL(location.href);
      url.searchParams.set("scene", String(current + 1));
      history.replaceState(null, "", url);
    }
  }

  function step(direction) {
    const index = Math.max(0, Math.min(presentation.scenes.length - 1, current + direction));
    if (index !== current) showScene(index);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else throw new Error("Fullscreen is unavailable in this browser.");
    } catch (error) {
      console.error("Could not change fullscreen mode.", error);
      document.querySelector("#announcement").textContent = `Fullscreen could not start: ${error.message}`;
    }
  }

  function setTheme() {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    const url = new URL(location.href);
    url.searchParams.set("scoutTheme", theme);
    history.replaceState(null, "", url);
    drawAtmosphere();
  }

  const canvas = document.querySelector("#atmosphere");
  const context = canvas.getContext("2d");
  let particles = [];
  let frame;
  let canvasWidth = 0;
  let canvasHeight = 0;

  function drawAtmosphere() {
    cancelAnimationFrame(frame);
    if (!context) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (canvasWidth !== width || canvasHeight !== height) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: 42 }, () => ({ x: Math.random() * width, y: Math.random() * height, speed: .1 + Math.random() * .2 }));
      canvasWidth = width;
      canvasHeight = height;
    }
    const palette = getComputedStyle(document.documentElement);
    const accent = palette.getPropertyValue("--cp-accent").trim();
    const muted = palette.getPropertyValue("--cp-border-strong").trim();
    const render = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        if (!motion.matches) particle.y = particle.y < 0 ? height : particle.y - particle.speed;
        context.fillStyle = index % 7 === 0 ? accent : muted;
        context.globalAlpha = index % 7 === 0 ? .25 : .16;
        context.beginPath();
        context.arc(particle.x, particle.y, index % 7 === 0 ? 1.8 : 1, 0, 2 * Math.PI);
        context.fill();
      });
      context.globalAlpha = 1;
      if (!motion.matches && !document.hidden) frame = requestAnimationFrame(render);
    };
    render();
  }

  function attachControls() {
    document.querySelector("#previous").addEventListener("click", () => step(-1));
    document.querySelector("#next").addEventListener("click", () => step(1));
    document.querySelector("#replay").addEventListener("click", () => showScene(current));
    document.querySelector("#fullscreen").addEventListener("click", toggleFullscreen);
    document.querySelector("#theme-toggle").addEventListener("click", setTheme);
    document.querySelector("#overview-toggle").addEventListener("click", (event) => openOverlay(overview, event.currentTarget));
    document.querySelector("#notes-toggle").addEventListener("click", (event) => openOverlay(notes, event.currentTarget));
    document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeOverlays()));
    document.addEventListener("click", (event) => {
      const next = event.target.closest("[data-next]");
      if (next) step(1);
      const target = event.target.closest("[data-scene]");
      if (target) {
        showScene(presentation.scenes.findIndex((scene) => scene.id === target.dataset.scene));
        stage.focus({ preventScroll: true });
      }
    });
    stage.addEventListener("pointerover", (event) => {
      const target = event.target.closest("[data-tooltip]");
      if (target) showTooltip(target);
    });
    stage.addEventListener("pointerout", (event) => {
      if (event.target.closest("[data-tooltip]")) hideTooltip();
    });
    stage.addEventListener("focusin", (event) => {
      if (event.target.matches("[data-tooltip]")) showTooltip(event.target);
    });
    stage.addEventListener("focusout", hideTooltip);
    document.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const overlay = !overview.hidden ? overview : !notes.hidden ? notes : null;
      if (overlay) {
        if (event.key === "Escape" || (overlay === notes && event.key.toLowerCase() === "c")) {
          event.preventDefault();
          closeOverlays();
        } else if (event.key === "Tab") {
          const focusables = [...overlay.querySelectorAll("button, a[href]")];
          const first = focusables[0];
          const last = focusables.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if (event.target.closest("input,textarea,select") || event.repeat) return;
      if (event.key === " " && event.target.closest("button,a")) return;
      const key = event.key.toLowerCase();
      if (["arrowright", "arrowdown", "pagedown", " "].includes(key)) { event.preventDefault(); step(1); }
      else if (["arrowleft", "arrowup", "pageup"].includes(key)) { event.preventDefault(); step(-1); }
      else if (key === "home") { event.preventDefault(); showScene(0); }
      else if (key === "end") { event.preventDefault(); showScene(presentation.scenes.length - 1); }
      else if (key === "r") showScene(current);
      else if (key === "t") setTheme();
      else if (key === "f") toggleFullscreen();
      else if (key === "c") openOverlay(notes, document.querySelector("#notes-toggle"));
      else if (key === "o") openOverlay(overview, document.querySelector("#overview-toggle"));
      else if (key === "escape") hideTooltip();
    });
    document.addEventListener("wheel", (event) => {
      if (!overview.hidden || !notes.hidden || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      if (now < wheelLockUntil) return;
      if (now - wheelTime > 200 || Math.sign(wheelTotal) !== Math.sign(event.deltaY)) wheelTotal = 0;
      wheelTime = now;
      wheelTotal += event.deltaY;
      if (Math.abs(wheelTotal) >= 70) {
        step(Math.sign(wheelTotal));
        wheelTotal = 0;
        wheelLockUntil = now + (presentation.controls?.wheelLockMs ?? 1100);
      }
    }, { passive: false });
    window.addEventListener("resize", () => { hideTooltip(); fitChart(); drawAtmosphere(); });
    document.addEventListener("visibilitychange", drawAtmosphere);
    motion.addEventListener("change", () => { showScene(current); drawAtmosphere(); });
    window.addEventListener("popstate", () => showScene(requestedScene(), false));
  }

  function requestedScene() {
    const value = Number(new URLSearchParams(location.search).get("scene") || 1);
    return Number.isInteger(value) ? value - 1 : 0;
  }

  async function initialize() {
    try {
      if (window.PresentationStore) {
        const loaded = await window.PresentationStore.load();
        if (loaded.warning) console.warn(`Ignoring invalid local presentation: ${loaded.warning}`);
        presentation = bindCanonical(loaded.presentation);
      } else {
        const response = await fetch(dataUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`Scene data request failed (${response.status}).`);
        presentation = await response.json();
      }
      validate(presentation);
      document.title = presentation.meta.title;
      if (presentation.meta.language) document.documentElement.lang = presentation.meta.language;
      if (presentation.meta.ariaLabel) stage.setAttribute("aria-label", presentation.meta.ariaLabel);
      document.querySelector("#total-number").textContent = pad(presentation.scenes.length);
      document.querySelector("#scene-index").innerHTML = presentation.scenes.map((scene, index) =>
        `<button type="button" data-scene="${escape(scene.id)}"><small>${pad(index + 1)} / ${escape(scene.chapter)}</small>${escape(scene.title.replace("|", " "))}</button>`).join("");
      attachControls();
      showScene(requestedScene());
      drawAtmosphere();
      document.documentElement.dataset.ready = "true";
    } catch (error) {
      console.error("The keynote failed to initialize.", error);
      document.querySelector("#load-error p").textContent = `${error.message} Serve this folder over HTTP so the browser can load ${dataUrl}.`;
      document.querySelector("#load-error").hidden = false;
      document.documentElement.dataset.ready = "error";
    }
  }

  initialize();
})();
