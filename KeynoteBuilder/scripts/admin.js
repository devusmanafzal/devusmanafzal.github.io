(function initializeAdmin() {
  "use strict";

  const elements = {
    activeSource: document.querySelector("#activeSource"),
    adminMain: document.querySelector("#adminMain"),
    controlsForm: document.querySelector("#controlsForm"),
    exportButton: document.querySelector("#exportButton"),
    generalForm: document.querySelector("#generalForm"),
    importButton: document.querySelector("#importButton"),
    importFile: document.querySelector("#importFile"),
    loadError: document.querySelector("#loadError"),
    loadErrorMessage: document.querySelector("#loadErrorMessage"),
    presentationTitle: document.querySelector("#presentationTitle"),
    resetButton: document.querySelector("#resetButton"),
    saveStatus: document.querySelector("#saveStatus"),
    sceneEditor: document.querySelector("#sceneEditor"),
    sceneFilter: document.querySelector("#sceneFilter"),
    sceneList: document.querySelector("#sceneList"),
    sceneNavCount: document.querySelector("#sceneNavCount"),
    sceneSearch: document.querySelector("#sceneSearch"),
    sceneSummary: document.querySelector("#sceneSummary"),
    validationBar: document.querySelector("#validationBar"),
    validationMessage: document.querySelector("#validationMessage"),
    videoList: document.querySelector("#videoList")
  };

  let draft = null;
  let defaults = null;
  let selectedSceneIndex = 0;
  let hasInvalidChanges = false;

  function makeElement(tagName, attributes = {}, text = "") {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") element.className = value;
      else if (key === "checked") element.checked = value;
      else if (key === "value") element.value = value ?? "";
      else element.setAttribute(key, value);
    });
    if (text) element.textContent = text;
    return element;
  }

  function field(labelText, path, value, options = {}) {
    const wrapper = makeElement("div", { className: `field${options.full ? " full" : ""}` });
    const id = `field-${path.join("-")}`;
    const label = makeElement("label", { for: id }, labelText);
    let input;
    if (options.type === "select") {
      input = makeElement("select", { id });
      options.choices.forEach(([choiceValue, choiceLabel]) => {
        const option = makeElement("option", { value: choiceValue }, choiceLabel);
        option.selected = choiceValue === value;
        input.append(option);
      });
    } else if (options.type === "textarea") {
      input = makeElement("textarea", { id });
      input.value = value ?? "";
    } else {
      input = makeElement("input", { id, type: options.type || "text", value });
      if (options.min !== undefined) input.min = options.min;
      if (options.step !== undefined) input.step = options.step;
    }
    input.dataset.path = JSON.stringify(path);
    if (options.valueType) input.dataset.valueType = options.valueType;
    wrapper.append(label, input);
    if (options.help) wrapper.append(makeElement("small", {}, options.help));
    return wrapper;
  }

  function switchControl(labelText, path, checked) {
    const label = makeElement("label", { className: "switch" });
    const input = makeElement("input", { type: "checkbox", checked });
    input.dataset.path = JSON.stringify(path);
    input.dataset.valueType = "boolean";
    label.append(input, document.createTextNode(labelText));
    return label;
  }

  function setAtPath(path, value) {
    let target = draft;
    path.slice(0, -1).forEach((key) => { target = target[key]; });
    target[path.at(-1)] = value;
  }

  function inputValue(input) {
    if (input.dataset.valueType === "boolean") return input.checked;
    if (input.dataset.valueType === "number") return input.value === "" ? Number.NaN : Number(input.value);
    return input.value;
  }

  function updateSaveState() {
    const result = window.PresentationStore.validate(draft);
    if (result.valid) {
      window.PresentationStore.save(draft);
      hasInvalidChanges = false;
      elements.saveStatus.dataset.state = "saved";
      elements.saveStatus.textContent = "Saved locally";
      elements.validationBar.hidden = true;
      elements.activeSource.textContent = "Browser override";
      elements.presentationTitle.textContent = draft.meta.title;
    } else {
      hasInvalidChanges = true;
      elements.saveStatus.dataset.state = "invalid";
      elements.saveStatus.textContent = "Not saved";
      elements.validationMessage.textContent = result.errors.slice(0, 3).join("\n");
      elements.validationBar.hidden = false;
    }
    return result;
  }

  function bindForm(form) {
    form.addEventListener("input", (event) => {
      const input = event.target.closest("[data-path]");
      if (!input) return;
      setAtPath(JSON.parse(input.dataset.path), inputValue(input));
      updateSaveState();
    });
  }

  function renderGeneral() {
    elements.generalForm.replaceChildren(
      field("Presentation title", ["meta", "title"], draft.meta.title),
      field("Language", ["meta", "language"], draft.meta.language, { help: "Use a language tag such as en or en-GB." }),
      field("Accessibility label", ["meta", "ariaLabel"], draft.meta.ariaLabel, { full: true }),
      field("Default palette", ["meta", "defaultPalette"], draft.meta.defaultPalette, { type: "select", choices: [["keynote", "Keynote"], ["workscape", "Workscape"]] }),
      field("Live reactions script", ["meta", "liveReactionsScript"], draft.meta.liveReactionsScript || "", { full: true, help: "Leave blank to disable the external reactions integration." })
    );
  }

  function renderControls() {
    elements.controlsForm.replaceChildren(
      field("Control hint", ["controls", "hint"], draft.controls.hint, { full: true }),
      field("Automatic build delay", ["controls", "autoBuildDelayMs"], draft.controls.autoBuildDelayMs, { type: "number", valueType: "number", min: "0", step: "100", help: "Milliseconds before an automatic scene build." }),
      field("Automatic advance delay", ["controls", "autoAdvanceDelayMs"], draft.controls.autoAdvanceDelayMs, { type: "number", valueType: "number", min: "0", step: "100", help: "Milliseconds before an automatic scene advance." }),
      field("Wheel lock", ["controls", "wheelLockMs"], draft.controls.wheelLockMs, { type: "number", valueType: "number", min: "0", step: "50" }),
      field("Swipe threshold", ["controls", "swipeThresholdPx"], draft.controls.swipeThresholdPx, { type: "number", valueType: "number", min: "0", step: "1" })
    );
  }

  function renderVideos() {
    const configurations = Object.entries(draft.videos).map(([key, video]) => {
      const article = makeElement("article", { className: "video-config" });
      const header = makeElement("header");
      header.append(makeElement("h2", {}, key), switchControl("Enabled", ["videos", key, "enabled"], video.enabled));
      const fields = makeElement("div", { className: "video-fields" });
      fields.append(
        field("Source", ["videos", key, "src"], video.src),
        field("Fit", ["videos", key, "fit"], video.fit, { type: "select", choices: [["contain", "Contain"], ["cover", "Cover"]] }),
        field("Caption", ["videos", key, "caption"], video.caption || "", { full: true })
      );
      const switches = makeElement("div", { className: "switch-row" });
      switches.append(
        switchControl("Start muted", ["videos", key, "muted"], video.muted),
        switchControl("Loop playback", ["videos", key, "loop"], video.loop)
      );
      article.append(header, fields, switches);
      return article;
    });
    elements.videoList.replaceChildren(...configurations);
  }

  function sceneContext(scene) {
    return [scene.section, scene.chapter].filter(Boolean).join(" · ") || scene.className;
  }

  function visibleSceneEntries() {
    const query = elements.sceneSearch.value.trim().toLowerCase();
    const filter = elements.sceneFilter.value;
    return draft.scenes.map((scene, index) => ({ scene, index })).filter(({ scene }) => {
      if (filter === "enabled" && !scene.enabled) return false;
      if (filter === "disabled" && scene.enabled) return false;
      const haystack = `${scene.id} ${scene.section || ""} ${scene.chapter || ""} ${scene.className}`.toLowerCase();
      return !query || haystack.includes(query);
    });
  }

  function renderSceneSummary() {
    const enabled = draft.scenes.filter((scene) => scene.enabled).length;
    elements.sceneSummary.replaceChildren(
      makeElement("strong", {}, String(enabled)),
      document.createTextNode(` enabled · ${draft.scenes.length} total`)
    );
    elements.sceneNavCount.textContent = String(draft.scenes.length);
  }

  function sceneAction(symbol, label, action, disabled = false) {
    const button = makeElement("button", { type: "button", title: label, "aria-label": label }, symbol);
    button.dataset.sceneAction = action;
    button.disabled = disabled;
    return button;
  }

  function renderSceneList() {
    const rows = visibleSceneEntries().map(({ scene, index }) => {
      const row = makeElement("div", { className: "scene-item", "data-selected": String(index === selectedSceneIndex) });
      row.dataset.sceneIndex = String(index);
      const number = makeElement("span", { className: "scene-index" }, String(index + 1).padStart(2, "0"));
      const toggle = makeElement("input", { className: "scene-item-toggle", type: "checkbox", checked: scene.enabled, "aria-label": `${scene.enabled ? "Disable" : "Enable"} ${scene.id}` });
      toggle.dataset.sceneAction = "toggle";
      const main = makeElement("button", { className: "scene-item-main", type: "button" });
      main.dataset.sceneAction = "select";
      main.append(makeElement("strong", {}, scene.id), makeElement("span", {}, sceneContext(scene)));
      const actions = makeElement("div", { className: "scene-item-actions" });
      actions.append(
        sceneAction("↑", "Move scene up", "up", index === 0),
        sceneAction("↓", "Move scene down", "down", index === draft.scenes.length - 1)
      );
      row.append(number, toggle, main, actions);
      return row;
    });
    elements.sceneList.replaceChildren(...rows);
    if (!rows.length) elements.sceneList.append(makeElement("div", { className: "empty-state" }, "No scenes match this view."));
    renderSceneSummary();
  }

  function uniqueCopyId(sourceId) {
    const ids = new Set(draft.scenes.map((scene) => scene.id));
    let candidate = `${sourceId}-copy`;
    let suffix = 2;
    while (ids.has(candidate)) candidate = `${sourceId}-copy-${suffix++}`;
    return candidate;
  }

  function refreshPreview() {
    const frame = elements.sceneEditor.querySelector("#scenePreview");
    if (!frame) return;
    const scene = draft.scenes[selectedSceneIndex];
    const template = document.createElement("template");
    template.innerHTML = scene.markup.trim();
    const root = template.content.firstElementChild;
    if (root) {
      root.dataset.state = "active";
      root.dataset.build = root.dataset.builds || "0";
      root.setAttribute("aria-hidden", "false");
    }
    const markup = root ? root.outerHTML : "";
    frame.srcdoc = `<!doctype html><html data-theme="dark" data-palette="${draft.meta.defaultPalette}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="styles/keynote.css"></head><body><main class="cinema"><div class="cinema-stage">${markup}</div></main></body></html>`;
  }

  function renderSceneEditor() {
    const scene = draft.scenes[selectedSceneIndex];
    if (!scene) {
      elements.sceneEditor.replaceChildren(makeElement("div", { className: "empty-state" }, "Select a scene to edit."));
      return;
    }
    const header = makeElement("header", { className: "scene-editor-head" });
    const heading = makeElement("div");
    heading.append(makeElement("h2", {}, scene.id), makeElement("p", {}, `Scene ${selectedSceneIndex + 1} of ${draft.scenes.length}`));
    const actions = makeElement("div", { className: "editor-actions" });
    const duplicateButton = makeElement("button", { className: "button secondary", type: "button" }, "Duplicate");
    duplicateButton.dataset.editorAction = "duplicate";
    actions.append(duplicateButton);
    header.append(heading, actions);

    const fields = makeElement("div", { className: "scene-fields" });
    fields.append(
      field("Scene ID", ["scenes", selectedSceneIndex, "id"], scene.id),
      field("CSS classes", ["scenes", selectedSceneIndex, "className"], scene.className),
      field("Section", ["scenes", selectedSceneIndex, "section"], scene.section || ""),
      field("Chapter", ["scenes", selectedSceneIndex, "chapter"], scene.chapter || ""),
      field("Scene markup", ["scenes", selectedSceneIndex, "markup"], scene.markup, { type: "textarea", full: true })
    );
    const enabledWrapper = makeElement("div", { className: "switch-row" });
    enabledWrapper.append(switchControl("Include this scene in the keynote", ["scenes", selectedSceneIndex, "enabled"], scene.enabled));
    fields.insertBefore(enabledWrapper, fields.lastElementChild);
    const preview = makeElement("div", { className: "preview-wrap" });
    const previewHead = makeElement("div", { className: "preview-head" });
    const refreshButton = makeElement("button", { className: "icon-button", id: "refreshPreview", type: "button", title: "Refresh preview", "aria-label": "Refresh preview" }, "↻");
    previewHead.append(makeElement("strong", {}, "Scene preview"), refreshButton);
    preview.append(previewHead, makeElement("iframe", { className: "scene-preview", id: "scenePreview", title: `Preview of ${scene.id}`, sandbox: "" }));
    fields.append(preview);
    elements.sceneEditor.replaceChildren(header, fields);
    refreshPreview();
  }

  function selectScene(index) {
    selectedSceneIndex = Math.max(0, Math.min(draft.scenes.length - 1, index));
    renderSceneList();
    renderSceneEditor();
  }

  function moveScene(index, offset) {
    const destination = index + offset;
    if (destination < 0 || destination >= draft.scenes.length) return;
    const [scene] = draft.scenes.splice(index, 1);
    draft.scenes.splice(destination, 0, scene);
    selectedSceneIndex = destination;
    updateSaveState();
    renderSceneList();
    renderSceneEditor();
  }

  function duplicateScene() {
    const source = draft.scenes[selectedSceneIndex];
    const duplicate = window.PresentationStore.clone(source);
    duplicate.id = uniqueCopyId(source.id);
    duplicate.enabled = false;
    draft.scenes.splice(selectedSceneIndex + 1, 0, duplicate);
    selectedSceneIndex += 1;
    updateSaveState();
    renderSceneList();
    renderSceneEditor();
  }

  function renderAll() {
    renderGeneral();
    renderControls();
    renderVideos();
    renderSceneList();
    renderSceneEditor();
    elements.presentationTitle.textContent = draft.meta.title;
  }

  function showPanel(panelName) {
    document.querySelectorAll("[data-panel-view]").forEach((panel) => { panel.hidden = panel.dataset.panelView !== panelName; });
    document.querySelectorAll("[data-panel]").forEach((button) => {
      if (button.dataset.panel === panelName) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  async function importPresentation(file) {
    try {
      const imported = JSON.parse(await file.text());
      const result = window.PresentationStore.validate(imported);
      if (!result.valid) throw new Error(result.errors.join("\n"));
      draft = window.PresentationStore.clone(imported);
      selectedSceneIndex = 0;
      updateSaveState();
      renderAll();
    } catch (error) {
      elements.validationMessage.textContent = error instanceof Error ? error.message : String(error);
      elements.validationBar.hidden = false;
    } finally {
      elements.importFile.value = "";
    }
  }

  function exportPresentation() {
    const result = window.PresentationStore.validate(draft);
    if (!result.valid) {
      updateSaveState();
      return;
    }
    const blob = new Blob([window.PresentationStore.exportText(draft)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = makeElement("a", { href: url, download: "masterstory.json" });
    link.click();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    bindForm(elements.generalForm);
    bindForm(elements.controlsForm);
    bindForm(elements.videoList);
    bindForm(elements.sceneEditor);
    document.querySelector(".admin-nav").addEventListener("click", (event) => {
      const button = event.target.closest("[data-panel]");
      if (button) showPanel(button.dataset.panel);
    });
    elements.sceneSearch.addEventListener("input", renderSceneList);
    elements.sceneFilter.addEventListener("change", renderSceneList);
    elements.sceneList.addEventListener("click", (event) => {
      const action = event.target.closest("[data-scene-action]");
      const row = event.target.closest("[data-scene-index]");
      if (!action || !row) return;
      const index = Number(row.dataset.sceneIndex);
      if (action.dataset.sceneAction === "select") selectScene(index);
      if (action.dataset.sceneAction === "up") moveScene(index, -1);
      if (action.dataset.sceneAction === "down") moveScene(index, 1);
    });
    elements.sceneList.addEventListener("change", (event) => {
      if (event.target.dataset.sceneAction !== "toggle") return;
      const index = Number(event.target.closest("[data-scene-index]").dataset.sceneIndex);
      draft.scenes[index].enabled = event.target.checked;
      updateSaveState();
      renderSceneSummary();
      if (selectedSceneIndex === index) renderSceneEditor();
    });
    elements.sceneEditor.addEventListener("input", (event) => {
      if (!event.target.matches("[data-path]")) return;
      const heading = elements.sceneEditor.querySelector("h2");
      if (heading) heading.textContent = draft.scenes[selectedSceneIndex].id || "Untitled scene";
    });
    elements.sceneEditor.addEventListener("click", (event) => {
      if (event.target.closest("[data-editor-action='duplicate']")) duplicateScene();
      if (event.target.closest("#refreshPreview")) refreshPreview();
    });
    elements.importButton.addEventListener("click", () => elements.importFile.click());
    elements.importFile.addEventListener("change", () => {
      const [file] = elements.importFile.files;
      if (file) importPresentation(file);
    });
    elements.exportButton.addEventListener("click", exportPresentation);
    elements.resetButton.addEventListener("click", () => {
      if (!window.confirm("Reset all browser changes and return to the checked-in presentation?")) return;
      window.PresentationStore.clear();
      draft = window.PresentationStore.clone(defaults);
      selectedSceneIndex = 0;
      hasInvalidChanges = false;
      elements.activeSource.textContent = "Checked-in JSON";
      elements.saveStatus.dataset.state = "saved";
      elements.saveStatus.textContent = "Defaults restored";
      elements.validationBar.hidden = true;
      renderAll();
    });
    window.addEventListener("beforeunload", (event) => {
      if (!hasInvalidChanges) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  async function start() {
    try {
      const loaded = await window.PresentationStore.load();
      draft = window.PresentationStore.clone(loaded.presentation);
      defaults = window.PresentationStore.clone(loaded.defaults);
      elements.activeSource.textContent = loaded.source === "local" ? "Browser override" : "Checked-in JSON";
      elements.saveStatus.dataset.state = "saved";
      elements.saveStatus.textContent = loaded.source === "local" ? "Saved locally" : "Defaults loaded";
      if (loaded.warning) {
        elements.validationMessage.textContent = `An invalid browser override was ignored. ${loaded.warning}`;
        elements.validationBar.hidden = false;
      }
      bindEvents();
      renderAll();
    } catch (error) {
      document.querySelectorAll("[data-panel-view]").forEach((panel) => { panel.hidden = true; });
      elements.loadErrorMessage.textContent = error instanceof Error ? error.message : String(error);
      elements.loadError.hidden = false;
      elements.saveStatus.dataset.state = "invalid";
      elements.saveStatus.textContent = "Load failed";
    }
  }

  start();
})();