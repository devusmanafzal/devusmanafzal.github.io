(function initializePresentationStore(global) {
  "use strict";

  const sourceConfig = global.PRESENTATION_SOURCE || {};
  const STORAGE_KEY = sourceConfig.storageKey || "keynoteBuilder.presentation.v1";
  const SCHEMA_VERSION = 1;
  const DATA_URL = sourceConfig.dataUrl || "data/masterstory.json";
  const USE_OVERRIDE = sourceConfig.useOverride !== false;

  function clone(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function migrateAgencyName(value) {
    if (typeof value === "string") {
      return value
        .replaceAll("scout-decision-desk.html", "agency.html")
        .replaceAll("Decision Desk", "Agency");
    }
    if (Array.isArray(value)) return value.map(migrateAgencyName);
    if (!isRecord(value)) return value;
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, migrateAgencyName(entry)]));
  }

  function validateMarkup(markup, sceneId) {
    if (typeof markup !== "string" || !markup.trim()) {
      return `Scene "${sceneId}" must contain markup.`;
    }

    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    const elements = [...template.content.children];
    const hasTextOutsideRoot = [...template.content.childNodes]
      .some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (elements.length !== 1 || elements[0].tagName !== "SECTION" || hasTextOutsideRoot) {
      return `Scene "${sceneId}" markup must contain exactly one root <section>.`;
    }
    return null;
  }

  function validate(presentation) {
    const errors = [];
    if (!isRecord(presentation)) return { valid: false, errors: ["Presentation data must be an object."] };

    ["meta", "controls", "videos", "commentary"].forEach((key) => {
      if (!isRecord(presentation[key])) errors.push(`"${key}" must be an object.`);
    });
    if (!Array.isArray(presentation.scenes)) errors.push('"scenes" must be an array.');
    if (errors.length) return { valid: false, errors };

    const metaStrings = ["title", "language", "ariaLabel", "defaultPalette"];
    metaStrings.forEach((key) => {
      if (typeof presentation.meta[key] !== "string" || !presentation.meta[key].trim()) {
        errors.push(`meta.${key} must be a non-empty string.`);
      }
    });

    ["autoBuildDelayMs", "autoAdvanceDelayMs", "wheelLockMs", "swipeThresholdPx"].forEach((key) => {
      const value = presentation.controls[key];
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        errors.push(`controls.${key} must be a non-negative number.`);
      }
    });
    if (typeof presentation.controls.hint !== "string") errors.push("controls.hint must be a string.");

    Object.entries(presentation.videos).forEach(([key, video]) => {
      if (!isRecord(video)) {
        errors.push(`Video "${key}" must be an object.`);
        return;
      }
      ["enabled", "muted", "loop"].forEach((property) => {
        if (typeof video[property] !== "boolean") errors.push(`videos.${key}.${property} must be true or false.`);
      });
      if (!['contain', 'cover'].includes(video.fit)) errors.push(`videos.${key}.fit must be "contain" or "cover".`);
      if (typeof video.src !== "string") errors.push(`videos.${key}.src must be a string.`);
      if (typeof video.caption !== "string") errors.push(`videos.${key}.caption must be a string.`);
    });

    const sceneIds = new Set();
    let enabledCount = 0;
    presentation.scenes.forEach((scene, index) => {
      if (!isRecord(scene)) {
        errors.push(`Scene ${index + 1} must be an object.`);
        return;
      }
      const sceneId = typeof scene.id === "string" ? scene.id.trim() : "";
      if (!sceneId) errors.push(`Scene ${index + 1} must have a non-empty ID.`);
      else if (sceneIds.has(sceneId)) errors.push(`Scene ID "${sceneId}" must be unique.`);
      else sceneIds.add(sceneId);
      if (typeof scene.enabled !== "boolean") errors.push(`Scene "${sceneId || index + 1}" enabled must be true or false.`);
      if (scene.enabled === true) enabledCount += 1;
      if (typeof scene.className !== "string" || !scene.className.trim()) errors.push(`Scene "${sceneId || index + 1}" must have class names.`);
      const markupError = validateMarkup(scene.markup, sceneId || index + 1);
      if (markupError) errors.push(markupError);
    });
    if (!enabledCount) errors.push("At least one scene must be enabled.");

    return { valid: errors.length === 0, errors };
  }

  function readOverride() {
    if (!USE_OVERRIDE) return { presentation: null, error: null };
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { presentation: null, error: null };
    try {
      const envelope = JSON.parse(stored);
      if (envelope.schemaVersion !== SCHEMA_VERSION || !envelope.presentation) {
        throw new Error("The saved presentation uses an unsupported format.");
      }
      const presentation = migrateAgencyName(envelope.presentation);
      const result = validate(presentation);
      if (!result.valid) throw new Error(result.errors.join("\n"));
      if (JSON.stringify(presentation) !== JSON.stringify(envelope.presentation)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...envelope, presentation }));
      }
      return { presentation: clone(presentation), error: null };
    } catch (error) {
      return { presentation: null, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async function load() {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load presentation data: ${response.status}`);
    const defaults = await response.json();
    const defaultValidation = validate(defaults);
    if (!defaultValidation.valid) throw new Error(defaultValidation.errors.join("\n"));

    const override = readOverride();
    return {
      presentation: override.presentation || clone(defaults),
      defaults: clone(defaults),
      source: override.presentation ? "local" : "default",
      warning: override.error
    };
  }

  function save(presentation) {
    const result = validate(presentation);
    if (!result.valid) return result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      presentation: clone(presentation)
    }));
    return result;
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  global.PresentationStore = Object.freeze({
    STORAGE_KEY,
    clear,
    clone,
    exportText: (presentation) => `${JSON.stringify(presentation, null, 2)}\n`,
    load,
    save,
    validate
  });
})(window);