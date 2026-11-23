// Every command is declared as { noun, verb, args, flags, summary, feature?, run }.
// Dispatch, --help and usage errors are all built from these declarations, so a command's signature lives in one place.
//   args:  [{ name, enum?, optional?, variadic? }] in positional order; a variadic arg must be last
//   flags: [{ name, value?, enum?, required? }]; a flag without `value` is a boolean switch
//   feature: the ang.json key that must be on for the command to exist
import { SCRIPT } from "./paths.mjs";
import { fail } from "./util.mjs";

function argUsage(arg) {
  const label = arg.enum ? arg.enum.join("|") : arg.name;
  const dots = arg.variadic ? "..." : "";

  return arg.optional ? `[<${label}>${dots}]` : `<${label}>${dots}`;
}

function flagValueUsage(flag) {
  if (flag.enum) {
    return ` <${flag.enum.join("|")}>`;
  }

  return flag.value ? ` <${flag.value}>` : "";
}

function flagUsage(flag) {
  const value = flagValueUsage(flag);

  return flag.required ? `--${flag.name}${value}` : `[--${flag.name}${value}]`;
}

export function usage(command) {
  const parts = [
    command.noun,
    command.verb,
    ...command.args.map(argUsage),
    ...command.flags.map(flagUsage),
  ];

  return parts.join(" ");
}

function printHelp(commands) {
  const width = Math.max(...commands.map((command) => usage(command).length));

  for (const command of commands) {
    console.log(`  ${usage(command).padEnd(width)}  ${command.summary}`);
  }
}

function parseFlags(command, tokens) {
  const positionals = [];
  const flags = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const isFlagToken = token.startsWith("--");
    const flag = isFlagToken
      ? command.flags.find((candidate) => candidate.name === token.slice(2))
      : null;

    if (isFlagToken && !flag) {
      fail(`unknown flag ${token}\n  usage: ${usage(command)}`);
    }

    if (!flag) {
      positionals.push(token);
      continue;
    }

    const isSwitch = !flag.value && !flag.enum;

    if (isSwitch) {
      flags[flag.name] = true;
      continue;
    }

    const value = tokens[++i];

    if (value === undefined) {
      fail(`--${flag.name} needs a value\n  usage: ${usage(command)}`);
    }

    if (flag.enum && !flag.enum.includes(value)) {
      fail(`--${flag.name} must be one of ${flag.enum.join("|")}`);
    }

    flags[flag.name] = value;
  }

  const missingFlag = command.flags.find(
    (flag) => flag.required && flags[flag.name] === undefined,
  );

  if (missingFlag) {
    fail(`--${missingFlag.name} is required\n  usage: ${usage(command)}`);
  }

  return { positionals, flags };
}

function bindArgs(command, positionals) {
  const args = {};

  for (const [i, arg] of command.args.entries()) {
    const value = arg.variadic ? positionals.slice(i) : positionals[i];
    const missing = arg.variadic ? value.length === 0 : value === undefined;

    if (missing && !arg.optional) {
      fail(`missing <${arg.name}>\n  usage: ${usage(command)}`);
    }

    if (!missing && arg.enum && !arg.enum.includes(value)) {
      fail(`<${arg.name}> must be one of ${arg.enum.join("|")}`);
    }

    args[arg.name] = value;
  }

  const lastIsVariadic = command.args.at(-1)?.variadic;

  if (!lastIsVariadic && positionals.length > command.args.length) {
    fail(`too many arguments\n  usage: ${usage(command)}`);
  }

  return args;
}

export function dispatch(allCommands, config, argv) {
  const enabled = allCommands.filter(
    (command) => !command.feature || config[command.feature],
  );
  const [noun, verb, ...rest] = argv;
  const wantsHelp = argv.includes("--help") || argv.includes("-h");
  const nounCommands = enabled.filter((command) => command.noun === noun);
  const wantsGeneralHelp = !noun || (wantsHelp && !nounCommands.length);

  if (wantsGeneralHelp) {
    console.log(
      `usage: ${SCRIPT} <noun> <verb> [<target>] [<positional>...] [--flag <value>]\n`,
    );
    printHelp(enabled);

    return;
  }

  const command = nounCommands.find((candidate) => candidate.verb === verb);

  if (!command) {
    const isKnownNoun = nounCommands.length > 0;
    const isDisabledForNoun = (candidate) =>
      !enabled.includes(candidate) && candidate.noun === noun;
    const disabled = allCommands.find(
      (candidate) =>
        isDisabledForNoun(candidate) &&
        (candidate.verb === verb || !isKnownNoun),
    );

    if (disabled) {
      fail(`${noun} commands need "${disabled.feature}": true in ang.json`);
    }

    if (!isKnownNoun) {
      fail(`unknown command "${noun}" — run ${SCRIPT} --help`);
    }

    if (!wantsHelp) {
      console.error(
        verb ? `✖ unknown command "${noun} ${verb}"` : `✖ ${noun} needs a verb`,
      );
    }

    printHelp(nounCommands);

    if (!wantsHelp) {
      process.exit(1);
    }

    return;
  }

  if (wantsHelp) {
    printHelp([command]);

    return;
  }

  const { positionals, flags } = parseFlags(command, rest);

  command.run(bindArgs(command, positionals), flags);
}
