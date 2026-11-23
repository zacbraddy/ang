import fs from "node:fs";
import { CONFIG_FILE, LOCAL_FILE, SCRIPT } from "../paths.mjs";
import { read, rel } from "../util.mjs";
import { FEATURES, featureConfig, onFeatures } from "../features.mjs";

const CONFIG_DEFAULTS = Object.fromEntries(
  FEATURES.map((f) => [f.key, featureConfig(f).default]),
);

function keyError(key, value) {
  const feature = FEATURES.find((f) => f.key === key);

  if (!feature) {
    return `is not a known key (${Object.keys(CONFIG_DEFAULTS).join(", ")})`;
  }

  return featureConfig(feature).check(value);
}

export const LOCAL_KEYS = ["host", "pilot"];

const isObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);

function pickValidKeys(raw, fileLabel, errors) {
  if (raw === undefined) {
    return {};
  }

  if (!isObject(raw)) {
    errors.push(`${fileLabel}: must be a JSON object`);

    return {};
  }

  const valid = {};

  for (const [key, value] of Object.entries(raw)) {
    const error = keyError(key, value);

    if (error) {
      errors.push(`${fileLabel}: ${key} ${error}`);
    } else {
      valid[key] = value;
    }
  }

  return valid;
}

// Defaults, then ang.json, then only the LOCAL_KEYS of ang.local.json. A missing file (undefined) changes nothing.
export function mergeConfig(shared, local) {
  const errors = [];
  const warnings = [];
  const config = {
    ...CONFIG_DEFAULTS,
    ...pickValidKeys(shared, rel(CONFIG_FILE), errors),
  };
  const localValues = pickValidKeys(local, rel(LOCAL_FILE), errors);

  for (const [key, value] of Object.entries(localValues)) {
    if (LOCAL_KEYS.includes(key)) {
      config[key] = value;
    } else {
      warnings.push(
        `${rel(LOCAL_FILE)}: ${key} ignored, it's project-wide; set it in ${rel(CONFIG_FILE)}`,
      );
    }
  }

  return { config, errors, warnings };
}

function readJson(file, errors) {
  if (!fs.existsSync(file)) {
    return undefined;
  }

  try {
    return JSON.parse(read(file));
  } catch {
    errors.push(`${rel(file)}: invalid JSON`);

    return undefined;
  }
}

// Config is the committed ang.json plus the gitignored ang.local.json; neither file existing means every default.
export function loadConfig() {
  const parseErrors = [];
  const shared = readJson(CONFIG_FILE, parseErrors);
  const local = readJson(LOCAL_FILE, parseErrors);
  const { config, errors, warnings } = mergeConfig(shared, local);

  return { config, errors: [...parseErrors, ...errors], warnings };
}

// A feature's banner note is a nicety; one that throws (e.g. git missing) still leaves its key named.
function featureBanner(feature, config) {
  try {
    const note = feature.banner?.(config[feature.key]);

    return note ? `${feature.key} (${note})` : feature.key;
  } catch {
    return feature.key;
  }
}

// Off means invisible: only what is on gets named.
export function bannerLine() {
  const { config, errors } = loadConfig();
  const featureNotes = onFeatures(config).map((f) => featureBanner(f, config));
  const summary = featureNotes.length
    ? featureNotes.join(" · ")
    : "no optional features on";
  const invalidWarning = errors.length
    ? ` · Ang config invalid, run ${SCRIPT} library validate`
    : "";

  return `Ang: ${summary}${invalidWarning}`;
}
