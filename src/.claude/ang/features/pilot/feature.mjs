function check(value) {
  const isName = typeof value === "string" && value.trim() !== "";

  if (value === null || isName) {
    return null;
  }

  return "must be null or a name";
}

const rule = (name) => `## Pilot
${name} is the pilot: the person you're working with. Where skills, rules and agents say "me", "I" or "the user", they mean ${name}. Address them as ${name}.`;

export default {
  key: "pilot",
  dir: import.meta.dirname,
  config: { default: null, check },
  on: (value) => typeof value === "string",
  validate: () => [],
  banner: (value) => value,
  rule,
  commands: [],
  bootstrap: {
    question:
      "What name should Ang call you by? Being addressed by name makes sessions flow better.",
    default: null,
    ifYes: "Set `pilot` to the name they give.",
  },
};
