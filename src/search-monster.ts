import { getMonsterList } from "~/utils/get-monster-list";
import { getMonsterData } from "~/utils/get-monster-data";
import {
  describeMonster,
  type DescribeMonsterOpts
} from "~/utils/describe-monster";

const [, , ...args] = process.argv;

async function search(list: number[], query: string) {
  const matches = new Array<{ data: MonsterData; lang: "en" | "de" }>();
  for (const id of list) {
    const data = await getMonsterData(id);
    if (data.name.en.toLowerCase().includes(query)) {
      matches.push({ data, lang: "en" });
    } else if (data.name.de?.toLowerCase().includes(query)) {
      matches.push({ data, lang: "de" });
    }
  }

  return matches;
}

// prettier-ignore
const HELP = 
`Search Monster

Search for Monsters by a part of their name

options:
  -h, --help    show this help message and exit
  --show-id     Enables showing monster IDs
  --hide-id     Disables showing monster IDs
  --show-lv     Enables showing monster levels
  --hide-lv     Disables showing monster levels
  --show-rank   Enables showing monster ranks
  --hide-rank   Disables showing monster ranks

Options can be entered at any point and in any order.
All arguments starting with a - (dash) are parsed as an argument, all other arguments are parsed as search queries.
Use quotes if your query contains spaces!`

async function main() {
  const list = await getMonsterList();
  const opts: DescribeMonsterOpts = {
    showId: true
  };
  const queries = new Array<string>();

  // handle args
  console.log("[DEBUG] args:", args);
  for (const arg of args) {
    switch (arg) {
      case "--help":
      case "-h":
        console.log(HELP);
        process.exit(0);
        break;
      case "--show-id":
        opts.showId = true;
        continue;
      case "--hide-id":
        opts.showId = false;
        continue;
      case "--show-lv":
        opts.showLevel = true;
        continue;
      case "--hide-lv":
        opts.showLevel = false;
        continue;
      case "--show-rank":
        opts.showRank = true;
        continue;
      case "--hide-rank":
        opts.showRank = false;
        continue;
    }

    // handle unknown arg
    if (arg.startsWith("-")) {
      console.warn(`Unknown argument '${arg}'`);
      continue;
    }

    // arg must be a search query
    queries.push(arg);
  }

  // handle searches
  for (const query of queries) {
    console.log(`Search query '${query}':`);
    const results = await search(list, query);
    for (const result of results) {
      console.log(
        `- ${describeMonster(result.data, { ...opts, lang: result.lang })}`
      );
    }
    console.log(""); // force newline
  }
}

main()
  .then(() => console.log("Completed"))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
