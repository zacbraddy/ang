// Every Ang feature module, each declared in .claude/ang/features/<key>/feature.mjs as
// { key, dir, validate(on) → errors[], warnings?() → warnings[] (when on), banner?(value) → text after its banner key,
//   config?: { default, check(value) → error | null } (when its ang.json value isn't a boolean),
//   on?(value) → is it on (default: the value is truthy), rule?(value) → text (in place of rule.md, when the rule depends on the value),
//   commands, bootstrap: { question, default, ifYes } }.
// Its folder may also hold rule.md (printed by the SessionStart banner), steps/<skill>.md (printed by `session steps`),
// agents/<agent-type>.md (injected by the SubagentStart hook) and conventions.md (its part of the library conventions).
import fs from 'node:fs';
import path from 'node:path';
import host from '../../ang/features/host/feature.mjs';
import intent from '../../ang/features/intent/feature.mjs';
import streams from '../../ang/features/streams/feature.mjs';
import pilot from '../../ang/features/pilot/feature.mjs';
import { read } from './util.mjs';

export const FEATURES = [intent, streams, host, pilot];

const BOOLEAN_CONFIG = { default: false, check: (value) => (typeof value === 'boolean' ? null : 'must be true or false') };

export const featureConfig = (feature) => feature.config ?? BOOLEAN_CONFIG;

export function isOn(feature, config) {
  const value = config[feature.key];
  return feature.on ? feature.on(value) : !!value;
}

export const onFeatures = (config) => FEATURES.filter((f) => isOn(f, config));

export function featureText(feature, ...parts) {
  const file = path.join(feature.dir, ...parts);
  return fs.existsSync(file) ? read(file).trim() : null;
}

export const featureRule = (feature, config) => (feature.rule ? feature.rule(config[feature.key]) : featureText(feature, 'rule.md'));

export const onRules = (config) => onFeatures(config).map((f) => featureRule(f, config)).filter(Boolean);
