---
title: Install script and upgrade ambition
shortDescription: Zac's calls on 2026-11-16 - a shipped install.sh one-liner, no uninstall command, and an in-scope upgrade skill that merges upstream releases around local workflow improvements
tags: [distribution, open-source]
---
# Install script and upgrade ambition

## Summary
Zac's calls on 2026-11-16, made after the [copy-in bake-off](copy-in-spike.md). These are his statements of intent (ET 1, evidence tier 1: a primary source):
- **Install:** ship an `install.sh` that runs the copy-in for the user, so the install is one copy-pasteable line in the README and docs.
- **Uninstall:** no command. Removing Ang is easy by hand, and automating it reliably is hard once local workflow improvements exist.
- **Update:** an upgrade skill is in scope for this item and is to be built. It merges an upstream Ang release into an instance, around the local workflow improvements made in that instance. Shaping it will likely take several sessions.

## Install script
The [bake-off](copy-in-spike.md) found that the copy-in tools need `--force` and then overwrite the user's `.claude/settings.json`. A shipped script wraps the copy-in. Why Zac wants it:
- **One line** (`curl … | sh`-style) is a very common install pattern for READMEs and docs.
- **It protects the user's settings.** It backs up the user's existing `.claude/settings.json`, then merges Ang's settings into it with node. Ang already requires node, so there's no `jq` dependency. The backup covers a merge that drops a property that mattered.
- **Future changes are free to deliver.** Any later change to installing is a new `install.sh`, and every new user gets it without changing their instructions.

## Uninstall
In a vanilla install, uninstalling means deleting Ang's skills, rules and `project-context/`. Once an instance has local workflow improvements, there are too many variables to automate removal reliably. Easy by hand and hard to automate, so it's dropped. The upgrade path is likely to need the effort far more.

## Upgrade ambition
Zac's ambition, in his words where possible:
- **Know the installed version.** The installed instance records which Ang open-source version it came from.
- **An upgrade skill.** It fetches the latest release from the open-source repo and "massages" the updates into the local instance around whatever workflow improvements it has.
- **Local improvements keep their own record.** The workflow-improvement workflow (`/raise-workflow-improvement`, `/improve-workflow`) would keep a local version and changelog of the improvements made in this instance. Then the upgrading agent can see what diverged and why.
- **Escape hatch.** When local improvements make an upgrade too large to be reasonable, the user is warned of the size of the job before diving in. They are offered options, such as taking only the parts of the new release that made them want to upgrade.
- **Fast path.** When the merge turns out to be simple, the skill just does it.

**First real use:** Zac's `ohnvm` repo runs a snowflaked, pre-open-source Ang. Upgrading it to the open-source version without losing much time is the motivating case. That instance has no recorded version, so it's also the hardest one: an upgrade has to cope without a known baseline.

## Against the delivery intent, deliberately
The [delivery intent](/project-context/10k/intent.md) says to build the least and treats new features as a "no" until they make their case. Zac has made the case for the upgrade skill. It goes against the intent on purpose, as a rare exception, because he sees real value in it. It also stays in this item rather than splitting out. It's part of the same logical unit of work as install, and growing in size doesn't make it a separate one.

## Related
- [Copy-in bake-off](copy-in-spike.md)
- [Install route landscape](../ideas-content/install-route.md)
- [Brief](../ideas-content/brief.md)
- [Hub](../README.md)
- [Delivery intent](/project-context/10k/intent.md)
