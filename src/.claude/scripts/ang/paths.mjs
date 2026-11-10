import path from 'node:path';

export const PROJECT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
export const CTX = path.join(PROJECT, 'project-context');
export const TAGS_FILE = path.join(CTX, 'tags.json');
export const TRIGGERS_FILE = path.join(CTX, 'triggers.json');
export const TRIGGER_DIR = path.join(CTX, 'triggers');
export const CONFIG_FILE = path.join(PROJECT, '.claude', 'ang.json');
export const SCRIPT = 'ang-context-manager.mjs';

export const STAGES = ['ideas', 'shaping', 'planning', 'execution', 'retro', '10k'];
export const FLOW = ['raw', 'ideas', 'shaping', 'planning', 'execution', 'retro'];
export const ITEM_STAGES = FLOW.slice(1);
export const DEPARTMENTS = ['technical', 'competitor-intelligence', 'marketing', 'product', 'sales', 'legal', 'financial'];
export const ITEM_STATUSES = ['active', 'ready-for-planning', 'blocked'];
export const EPIC_TYPES = ['technical', 'business', 'mixed'];
export const STORY_STATUSES = ['draft', 'ready', 'implemented', 'done', 'blocked'];
export const STORY_OWNERS = ['agent', 'user', 'both'];
export const TAG_LIMIT = 50;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
