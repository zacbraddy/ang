// Chains the upgrade guides in the local releases/upgrades/, as `upgrade guides` does from GitHub, so /cut-release can
// check and rehearse a new guide before its tag exists.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chainGuides } from "../src/.claude/scripts/ang/upgrade/guides.mjs";

const GUIDES_DIR = path.resolve(
  import.meta.dirname,
  "..",
  "releases",
  "upgrades",
);

export function draftGuides({ dir = GUIDES_DIR, fromTag, toTag }) {
  const fetchGuide = async (tag) => {
    try {
      return fs.readFileSync(path.join(dir, `${tag}.md`), "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      throw new Error(
        `no upgrade guide for ${tag} at releases/upgrades/${tag}.md`,
        { cause: error },
      );
    }
  };

  return chainGuides(fetchGuide, fromTag, toTag);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [fromTag, toTag] = process.argv.slice(2);

  if (!fromTag || !toTag) {
    console.error("usage: node scripts/draft-guides.mjs <fromTag> <toTag>");
    process.exit(1);
  }

  try {
    const guides = await draftGuides({ fromTag, toTag });

    console.log(JSON.stringify(guides, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
