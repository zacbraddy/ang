// host name → is this session running inside it? Read from the environment so detection costs nothing.
const HOST_DETECTORS = {
  orca: () =>
    process.env.TERM_PROGRAM === "Orca" || !!process.env.ORCA_WORKTREE_ID,
};

function check(value) {
  const isKnownHost = value === null || Object.hasOwn(HOST_DETECTORS, value);

  if (isKnownHost) {
    return null;
  }

  return `must be null or one of ${Object.keys(HOST_DETECTORS).join("|")}`;
}

// On only when configured and detected, so the same repo runs unchanged in a plain terminal.
const on = (value) => value !== null && HOST_DETECTORS[value]();

export default {
  key: "host",
  dir: import.meta.dirname,
  config: { default: null, check },
  on,
  validate: () => [],
  banner: (value) => value,
  commands: [],
  bootstrap: {
    question:
      "Which workspace host runs this repo's sessions? Don't ask the user: detect it.",
    default: null,
    ifYes:
      'Set `host` to `"orca"` if `TERM_PROGRAM=Orca` or `ORCA_WORKTREE_ID` is set in your environment, otherwise `null`. Detecting it once here spares every later session from probing for it.',
  },
};
