#!/usr/bin/env node
// Ang's deterministic helpers for project-context/. Zero dependencies (Node built-ins only).
// Run with --help for every command; each one is declared in ang/commands/*.mjs.
import { loadConfig } from './ang/config/config.mjs';
import { dispatch } from './ang/registry.mjs';
import library from './ang/commands/library.mjs';
import item from './ang/commands/item.mjs';
import state from './ang/commands/state.mjs';
import tag from './ang/commands/tag.mjs';
import trigger from './ang/commands/trigger.mjs';
import session from './ang/commands/session.mjs';
import { FEATURES } from './ang/features.mjs';

const featureCommands = FEATURES.flatMap((f) => f.commands.map((c) => ({ ...c, feature: f.key })));
const commands = [...library, ...item, ...state, ...tag, ...trigger, ...session, ...featureCommands];
dispatch(commands, loadConfig().config, process.argv.slice(2));
