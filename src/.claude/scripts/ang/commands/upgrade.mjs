import { chainGuides, githubGuideFetcher } from '../upgrade/guides.mjs';
import { fail } from '../util.mjs';

export default [
  {
    noun: 'upgrade', verb: 'guides', args: [],
    flags: [{ name: 'from', value: 'tag', required: true }, { name: 'to', value: 'tag', required: true }],
    summary: 'print the upgrade guides between two Ang tags as JSON, oldest first, chained by their from: lines',
    // dispatch doesn't await run, so the rejection is caught here rather than left unhandled.
    run(_, { from, to }) {
      return chainGuides(githubGuideFetcher(to), from, to)
        .then((guides) => console.log(JSON.stringify(guides, null, 2)))
        .catch((error) => fail(error.message));
    },
  },
];
