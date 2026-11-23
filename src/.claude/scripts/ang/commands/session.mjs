import fs from "node:fs";
import { bannerLine, LOCAL_KEYS, loadConfig } from "../config/config.mjs";
import { FEATURES, featureText, onFeatures, onRules } from "../features.mjs";

// Here be dragons: these commands feed hooks and skill `!` injections. A failing `!` command aborts the whole skill,
// so they swallow every error and exit 0; printing nothing is the safe fallback.
function quietly(print) {
  try {
    print();
  } catch {
    // nothing to add
  }
}

function onTexts(...parts) {
  const { config } = loadConfig();

  return onFeatures(config)
    .map((feature) => featureText(feature, ...parts))
    .filter(Boolean);
}

function readHookInput() {
  const stdin = fs.readFileSync(0, "utf8");

  return stdin ? JSON.parse(stdin) : {};
}

export default [
  {
    noun: "session",
    verb: "banner",
    args: [],
    flags: [],
    summary: "Ang mode line plus each on feature's rule (SessionStart hook)",
    run() {
      // Here be dragons: hook output over 10,000 characters is moved to a file the agent isn't told about. Keep rules lean.
      const sections = [bannerLine(), ...onRules(loadConfig().config)];

      console.log(sections.join("\n\n"));
    },
  },
  {
    noun: "session",
    verb: "steps",
    args: [{ name: "skill", optional: true }],
    flags: [],
    summary:
      "steps the on features add to a skill (skill `!` injection; always exits 0)",
    run({ skill }) {
      quietly(() => {
        if (!skill) {
          return;
        }

        const steps = onTexts("steps", `${skill}.md`);

        if (!steps.length) {
          return;
        }

        console.log("**Feature add-ons.** Apply each at the step it names.\n");
        console.log(steps.join("\n\n"));
      });
    },
  },
  {
    noun: "session",
    verb: "subagent",
    args: [],
    flags: [],
    summary:
      "on features' rules and agent add-ons as subagent context (SubagentStart hook; always exits 0)",
    run() {
      quietly(() => {
        const agentType = readHookInput().agent_type;
        const agentAddOns = agentType
          ? onTexts("agents", `${agentType}.md`)
          : [];
        const context = [...onRules(loadConfig().config), ...agentAddOns];

        if (!context.length) {
          return;
        }

        const hookSpecificOutput = {
          hookEventName: "SubagentStart",
          additionalContext: context.join("\n\n"),
        };

        console.log(JSON.stringify({ hookSpecificOutput }));
      });
    },
  },
  {
    noun: "session",
    verb: "features",
    args: [],
    flags: [],
    summary:
      "every feature's ang.json key, bootstrap question and default (for /bootstrap-repo)",
    run() {
      for (const { key, bootstrap } of FEATURES) {
        const personal = LOCAL_KEYS.includes(key)
          ? " — personal, set by `/tailor-ang`"
          : "";

        console.log(
          `- **${key}** (default ${bootstrap.default}): ${bootstrap.question}${personal}`,
        );
        console.log(`  If yes: ${bootstrap.ifYes}`);
      }
    },
  },
];
