---
title: Install script and upgrade ambition
shortDescription: Zac's calls on 2026-11-16 - a shipped install.sh one-liner, no uninstall command, and an in-scope upgrade skill that merges upstream releases around local workflow improvements
tags: [distribution, open-source]
---
# Install script and upgrade ambition

## Summary
Zac's calls on 2026-11-16, made after the [copy-in bake-off](./copy-in-spike.md). These are his statements of intent (ET 1, evidence tier 1: a primary source):
- **Install:** ship an `install.sh` that runs the copy-in for the user, so the install is one copy-pasteable line in the README and docs.
- **Uninstall:** no command. Removing Ang is easy by hand, and automating it reliably is hard once local workflow improvements exist.
- **Update:** an upgrade skill is in scope for this item and is to be built. It merges an upstream Ang release into an instance, around the local workflow improvements made in that instance. Shaping it will likely take several sessions.

## Install script
The [bake-off](./copy-in-spike.md) found that the copy-in tools need `--force` and then overwrite the user's `.claude/settings.json`. A shipped script wraps the copy-in. Why Zac wants it:
- **One line** (`curl … | sh`-style) is a very common install pattern for READMEs and docs.
- **It protects the user's settings.** It backs up the user's existing `.claude/settings.json`, then merges Ang's settings into it with node. Ang already requires node, so there's no `jq` dependency. The backup covers a merge that drops a property that mattered.
- **It fails early and says why.** Zac's call (2026-11-17): before copying anything, the script checks and stops with a plain message naming what's wrong and how to fix it:
  - node at the supported minimum (not just present) and npx available;
  - the current directory is inside a git repo, since Ang's workflow leaves changes unstaged for review and makes no sense outside one;
  - the current directory is the repo root (`git rev-parse --show-toplevel`); from a subdirectory it stops and names the root to `cd` to. Ang's library links start with `/project-context/`, so they only resolve from the root (Zac's call, 2026-11-17);
  - the working tree is clean, so the install's changes can be reviewed and backed out on their own in git, as with the upgrade skill (Zac's call, 2026-11-17);
  - Ang isn't already installed (`.claude/ang/version.json` exists): re-running would overwrite local workflow improvements, so it points to the upgrade skill;
  - nothing would be overwritten: an existing `project-context/` or skills, rules or agents named like Ang's are listed and the install stops;
  - an existing `.claude/settings.json` parses, so the merge can't fail halfway or drop the user's settings;
  - the ref resolves, and when it doesn't, it says whether GitHub was unreachable, the unauthenticated rate limit was hit or the ref doesn't exist.

  On success it prints the installed version, where it went and the next step (`/bootstrap-repo`). OS, disk-space and permission checks are left out: rare, and they already fail loudly.
- **Future changes are free to deliver.** Any later change to installing is a new `install.sh`, and every new user gets it without changing their instructions.

## Uninstall
In a vanilla install, uninstalling means deleting Ang's skills, rules and `project-context/`. Once an instance has local workflow improvements, there are too many variables to automate removal reliably. Easy by hand and hard to automate, so it's dropped. The upgrade path is likely to need the effort far more.

## Upgrade ambition
Zac's ambition, in his words where possible:
- **Know the installed version.** The installed instance records which Ang open-source version it came from.
- **An upgrade skill.** It fetches the latest release from the open-source repo and "massages" the updates into the local instance around whatever workflow improvements it has.
- **Local improvements keep their own record.** Later parked (Zac's call, 2026-11-16): the [upgrade merge spike](./upgrade-merge-spike.md) found every local edit by diffing against the recorded SHA, so the changelog waits in [parked work](/project-context/ideas/parked.md).
- **Escape hatch.** When local improvements make an upgrade too large to be reasonable, the user is warned of the size of the job before diving in. They are offered options, such as taking only the parts of the new release that made them want to upgrade.
- **Fast path.** When the merge turns out to be simple, the skill just does it.
- **Checks before merging.** Zac's call (2026-11-17), the upgrade counterpart to the install's checks. Before writing anything, the skill stops with a plain message when:
  - the instance is already on the target release (version record SHA matches it);
  - the target is older than the installed release, so an upgrade would be a downgrade;
  - the working tree has uncommitted changes, since the merge touches many files and git is how the user reviews or backs it out;
  - prerequisites are missing, as for install (node minimum, git repo, the release resolves).

  A missing version record, or a recorded SHA upstream doesn't know, is not a stop: per the ohnvm call below it goes to the escape hatch. On finishing, it reports from and to versions, what merged cleanly, what needed judgement and how to review it (`git diff`).

**ohnvm, a hoped-for side effect:** Zac's `ohnvm` repo runs a snowflaked, pre-open-source Ang with no recorded version. Its Ang predates this repo (first committed 2026-10-19; this repo starts 2026-11-10), so no Ang commit is its true baseline. Zac's call (2026-11-16): the upgrade skill gets **no special path for pre-open-source instances**. Only Zac has them, and only until he's upgraded them. Instead, nothing in the skill outright stops an upgrade when the version record is missing. An LLM runs the skill, so with no hard stop it may well upgrade ohnvm by accident, which would be a bonus, not a requirement.

## Cutting releases
Zac's call (2026-11-17): the process for cutting a release belongs to this item. Releases are git tags with generated GitHub Releases (open-source-hygiene's d13), and `install.sh` and the upgrade skill are what consume them, so the steps that make a release usable live with them. Those steps are stamping the tag into `install.sh`, tagging, publishing the release, and whatever each release must declare for an upgrade.

## Against the delivery intent, deliberately
The [delivery intent](/project-context/10k/intent.md) says to build the least and treats new features as a "no" until they make their case. Zac has made the case for the upgrade skill. It goes against the intent on purpose, as a rare exception, because he sees real value in it. It also stays in this item rather than splitting out. It's part of the same logical unit of work as install, and growing in size doesn't make it a separate one.

## Related
- [Copy-in bake-off](./copy-in-spike.md)
- [Install route landscape](../ideas-content/install-route.md)
- [Brief](../ideas-content/brief.md)
- [Hub](../../../README.md)
- [Delivery intent](/project-context/10k/intent.md)
