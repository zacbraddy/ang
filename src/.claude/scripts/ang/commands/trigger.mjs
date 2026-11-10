import fs from 'node:fs';
import { SLUG_RE } from '../paths.mjs';
import { fail, rel } from '../util.mjs';
import { conditionErrors, evalTrigger, loadTriggers, printReadyTriggers, saveTriggers, triggerDoc } from '../triggers/triggers.mjs';

const CONDITIONS_HELP = 'conditions: story:<item>/<NN>=<status>[|status]  stage:<item>=<stage> (reached or passed)  '
  + 'file:<repo path>  after:<YYYY-MM-DD[THH:MM]> (local, midnight default)  custom:<text> (an agent checks it once the rest are met)  '
  + 'stream:<stream>:<story:|stage:|file: condition> (judged on that stream\'s branch)';

function refuseBadConditions(conditions) {
  const errors = conditionErrors(conditions);
  if (errors.length) fail(errors.join('\n  '));
}

export default [
  {
    noun: 'trigger', verb: 'add', args: [{ name: 'slug' }, { name: 'intent' }, { name: 'conditions', variadic: true }], flags: [],
    summary: `defer an action until every condition holds; triggers/<slug>.md must exist. ${CONDITIONS_HELP}`,
    run({ slug, intent, conditions }) {
      const triggers = loadTriggers();
      if (!SLUG_RE.test(slug)) fail('trigger slugs are kebab-case');
      if (triggers.some((t) => t.slug === slug)) fail(`trigger exists: ${slug} (remove it first to change it)`);
      if (!fs.existsSync(triggerDoc(slug))) fail(`write ${rel(triggerDoc(slug))} first`);
      refuseBadConditions(conditions);
      saveTriggers([...triggers, { slug, intent, conditions }]);
      console.log(`✔ added trigger ${slug} (${evalTrigger({ conditions }).state})`);
    },
  },
  {
    noun: 'trigger', verb: 'repoint', args: [{ name: 'slug' }, { name: 'conditions', variadic: true }], flags: [],
    summary: 'replace all of a trigger\'s conditions, keep its doc',
    run({ slug, conditions }) {
      const triggers = loadTriggers();
      const trigger = triggers.find((t) => t.slug === slug);
      if (!trigger) fail(`no trigger ${slug}`);
      refuseBadConditions(conditions);
      trigger.conditions = conditions;
      saveTriggers(triggers);
      console.log(`✔ repointed ${slug} (${evalTrigger(trigger).state})`);
    },
  },
  {
    noun: 'trigger', verb: 'list', args: [], flags: [],
    summary: 'every trigger, waiting, to judge or ready, with each condition\'s result',
    run() {
      const triggers = loadTriggers();
      if (!triggers.length) {
        console.log('no triggers');
        return;
      }
      for (const t of triggers.map(evalTrigger)) {
        console.log(`${t.state.padEnd(7)} ${t.slug}: ${t.intent}`);
        for (const r of t.results) console.log(`          ${r.result.padEnd(5)} ${r.raw}${r.why ? ` (${r.why})` : ''}`);
      }
    },
  },
  {
    noun: 'trigger', verb: 'check', args: [], flags: [],
    summary: 'print the ready triggers and those whose custom conditions need judging',
    run() {
      const readyCount = printReadyTriggers(loadTriggers().map(evalTrigger));
      if (!readyCount) console.log('no triggers ready or to judge');
    },
  },
  {
    noun: 'trigger', verb: 'remove', args: [{ name: 'slug' }], flags: [],
    summary: 'delete a trigger and its doc',
    run({ slug }) {
      const triggers = loadTriggers();
      if (!triggers.some((t) => t.slug === slug)) fail(`no trigger ${slug}`);
      saveTriggers(triggers.filter((t) => t.slug !== slug));
      fs.rmSync(triggerDoc(slug), { force: true });
      console.log(`✔ removed trigger ${slug} and its doc`);
    },
  },
];
