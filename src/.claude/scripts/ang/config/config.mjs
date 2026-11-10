import fs from 'node:fs';
import { CONFIG_FILE, SCRIPT } from '../paths.mjs';
import { read, rel } from '../util.mjs';
import { FEATURES, featureConfig, onFeatures } from '../features.mjs';

const CONFIG_DEFAULTS = Object.fromEntries(FEATURES.map((f) => [f.key, featureConfig(f).default]));

function keyError(key, value) {
  const feature = FEATURES.find((f) => f.key === key);
  if (!feature) return `is not a known key (${Object.keys(CONFIG_DEFAULTS).join(', ')})`;
  return featureConfig(feature).check(value);
}

// A missing .claude/ang.json means every optional behaviour is off.
export function loadConfig() {
  const where = rel(CONFIG_FILE);
  const defaults = { ...CONFIG_DEFAULTS };
  if (!fs.existsSync(CONFIG_FILE)) return { config: defaults, errors: [] };
  let raw;
  try {
    raw = JSON.parse(read(CONFIG_FILE));
  } catch {
    return { config: defaults, errors: [`${where}: invalid JSON`] };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { config: defaults, errors: [`${where}: must be a JSON object`] };
  const config = defaults;
  const errors = [];
  for (const [key, value] of Object.entries(raw)) {
    const error = keyError(key, value);
    if (error) errors.push(`${where}: ${key} ${error}`);
    else config[key] = value;
  }
  return { config, errors };
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
  const on = onFeatures(config).map((f) => featureBanner(f, config));
  const summary = on.length ? on.join(' · ') : 'no optional features on';
  const broken = errors.length ? ` · ang.json invalid, run ${SCRIPT} library validate` : '';
  return `Ang: ${summary}${broken}`;
}
