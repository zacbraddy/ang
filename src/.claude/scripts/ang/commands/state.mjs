import { EPIC_TYPES, ITEM_STATUSES } from "../paths.mjs";
import { fail, rel, today } from "../util.mjs";
import { resolveItem, stageOf } from "../items/resolve.mjs";
import {
  emptyState,
  ENTRY_KINDS,
  hasState,
  kindByName,
  kindOfId,
  loadState,
  nextId,
  refuseRawSource,
  saveState,
  statePath,
} from "../items/state.mjs";

const KIND_NAMES = Object.values(ENTRY_KINDS).map((k) => k.kind);

// Loads the item's state, applies the change, saves it and confirms.
function updateState(itemArg, change) {
  const item = resolveItem(itemArg);
  const state = loadState(item);

  change(state, item);
  saveState(item, state);

  return item;
}

function printState(item) {
  const state = loadState(item);
  const note = state.statusNote ? ` (${state.statusNote})` : "";
  const type = state.type ? ` [${state.type}]` : "";
  const from = (entry) => (entry.from ? `  (from ${entry.from})` : "");
  const via = (unknown) =>
    unknown.approach ? `  — via: ${unknown.approach}` : "";

  console.log(`${rel(item)} — ${state.status}${note}${type}`);

  console.log("\nUnknowns (priority order):");
  state.unknowns.forEach((u) =>
    console.log(`  ${u.id}  ${u.question}${via(u)}${from(u)}`),
  );

  console.log("\nKnowns:");
  state.knowns.forEach((k) =>
    console.log(`  ${k.id}  ${k.fact}  → ${k.source}${from(k)}`),
  );

  console.log("\nDecisions:");
  state.decisions.forEach((d) =>
    console.log(`  ${d.id}  ${d.decision}  → ${d.evidence}`),
  );
}

function addEntry(state, item, kindName, text, ref, top) {
  const [prefix, kind] = kindByName(kindName);
  const isUnknown = kindName === "unknown";

  if (top && !isUnknown) {
    fail("--top only applies to unknowns");
  }

  if (!isUnknown && !ref) {
    fail(`a ${kindName} needs its ${kind.ref}`);
  }

  if (!isUnknown) {
    refuseRawSource(item, ref);
  }

  const entry = {
    id: nextId(state[kind.list], prefix),
    [kind.text]: text,
    [kind.ref]: ref ?? "",
  };

  if (top) {
    state[kind.list].unshift(entry);
  } else {
    state[kind.list].push(entry);
  }

  if (kindName === "decision") {
    state.lineage.push({ date: today(), event: `decided: ${text}` });
  }

  console.log(`✔ added ${entry.id}`);
}

function findEntry(state, id) {
  const kind = kindOfId(id);
  const entry = kind && state[kind.list].find((x) => x.id === id);

  if (!entry) {
    fail(`no entry with id ${id}`);
  }

  return { kind, entry };
}

// Rewrites an entry in place so a changed item never sits beside the one it contradicts.
function replaceEntry(state, item, id, text, ref) {
  const { kind, entry } = findEntry(state, id);

  if (ref && kind.kind !== "unknown") {
    refuseRawSource(item, ref);
  }

  const changes = [];

  if (entry[kind.text] !== text) {
    changes.push(`${entry[kind.text]} → ${text}`);
  }

  if (ref && entry[kind.ref] !== ref) {
    changes.push(`${kind.ref}: ${entry[kind.ref]} → ${ref}`);
  }

  if (!changes.length) {
    fail(`${id} already says that`);
  }

  state.lineage.push({
    date: today(),
    event: `replaced ${id}: ${changes.join("; ")}`,
  });

  entry[kind.text] = text;

  if (ref) {
    entry[kind.ref] = ref;
  }

  console.log(`✔ replaced ${id}`);
}

const confirmUpdated = (item) =>
  console.log(`✔ ${rel(statePath(item))} updated`);

export default [
  {
    noun: "state",
    verb: "init",
    args: [{ name: "item" }],
    flags: [{ name: "type", enum: EPIC_TYPES }],
    summary: "create state.json for an item",
    run({ item: itemArg }, { type }) {
      const item = resolveItem(itemArg);

      if (hasState(item)) {
        fail(`state.json already exists in ${rel(item)}`);
      }

      const state = emptyState();

      if (type) {
        state.type = type;
      }

      state.lineage.push({
        date: today(),
        event: `created in ${stageOf(item)}`,
      });
      saveState(item, state);
      console.log(`✔ state initialised for ${rel(item)}`);
    },
  },
  {
    noun: "state",
    verb: "show",
    args: [{ name: "item" }],
    flags: [],
    summary: "print status, unknowns (priority order), knowns and decisions",
    run({ item }) {
      printState(resolveItem(item));
    },
  },
  {
    noun: "state",
    verb: "status",
    args: [
      { name: "item" },
      { name: "status", enum: ITEM_STATUSES },
      { name: "note", optional: true },
    ],
    flags: [],
    summary: "set the item status, with an optional note",
    run({ item, status, note }) {
      const noteSuffix = note ? `: ${note}` : "";
      const updated = updateState(item, (state) => {
        state.status = status;
        state.statusNote = note ?? "";
        state.lineage.push({
          date: today(),
          event: `status → ${status}${noteSuffix}`,
        });
      });

      confirmUpdated(updated);
    },
  },
  {
    noun: "state",
    verb: "type",
    args: [{ name: "item" }, { name: "type", enum: EPIC_TYPES }],
    flags: [],
    summary: "set the epic type",
    run({ item, type }) {
      const updated = updateState(item, (state) => {
        state.type = type;
      });

      confirmUpdated(updated);
    },
  },
  {
    noun: "state",
    verb: "lineage",
    args: [{ name: "item" }, { name: "event" }],
    flags: [],
    summary: "log a lineage event",
    run({ item, event }) {
      const updated = updateState(item, (state) => {
        state.lineage.push({ date: today(), event });
      });

      confirmUpdated(updated);
    },
  },
  {
    noun: "state",
    verb: "add",
    args: [
      { name: "item" },
      { name: "kind", enum: KIND_NAMES },
      { name: "text" },
      { name: "ref", optional: true },
    ],
    flags: [{ name: "top" }],
    summary:
      "add an entry; ref is the approach (optional) / source / evidence; --top puts an unknown first",
    run({ item, kind, text, ref }, { top }) {
      updateState(item, (state, resolved) =>
        addEntry(state, resolved, kind, text, ref, top),
      );
    },
  },
  {
    noun: "state",
    verb: "replace",
    args: [
      { name: "item" },
      { name: "id" },
      { name: "text" },
      { name: "ref", optional: true },
    ],
    flags: [],
    summary:
      "rewrite an entry in place (id u3, k2, d1), keep the id, log lineage",
    run({ item, id, text, ref }) {
      updateState(item, (state, resolved) =>
        replaceEntry(state, resolved, id, text, ref),
      );
    },
  },
  {
    noun: "state",
    verb: "answer",
    args: [
      { name: "item" },
      { name: "id" },
      { name: "fact" },
      { name: "source" },
    ],
    flags: [],
    summary: "turn an unknown into a known",
    run({ item, id, fact, source }) {
      updateState(item, (state, resolved) => {
        const unknown = state.unknowns.find((u) => u.id === id);

        if (!unknown) {
          fail(`no unknown ${id}`);
        }

        refuseRawSource(resolved, source);
        state.unknowns = state.unknowns.filter((u) => u.id !== id);

        const known = {
          id: nextId(state.knowns, "k"),
          fact,
          source,
          answers: unknown.question,
        };

        state.knowns.push(known);
        console.log(`✔ ${id} answered → ${known.id}`);
      });
    },
  },
  {
    noun: "state",
    verb: "order",
    args: [{ name: "item" }, { name: "ids", variadic: true }],
    flags: [],
    summary: "put the listed unknowns first, in that order",
    run({ item, ids }) {
      updateState(item, (state) => {
        const findUnknown = (id) =>
          state.unknowns.find((u) => u.id === id) ?? fail(`no unknown ${id}`);
        const first = ids.map(findUnknown);
        const rest = state.unknowns.filter((u) => !ids.includes(u.id));

        state.unknowns = [...first, ...rest];

        const newOrder = state.unknowns.map((u) => u.id).join(", ");

        console.log(`✔ reordered: ${newOrder}`);
      });
    },
  },
  {
    noun: "state",
    verb: "remove",
    args: [{ name: "item" }, { name: "id" }],
    flags: [],
    summary: "remove an entry by id (u3, k2, d1), log lineage",
    run({ item, id }) {
      const updated = updateState(item, (state) => {
        const { kind, entry } = findEntry(state, id);

        state[kind.list] = state[kind.list].filter((x) => x.id !== id);
        state.lineage.push({
          date: today(),
          event: `removed ${id}: ${entry[kind.text]}`,
        });
      });

      confirmUpdated(updated);
    },
  },
];
