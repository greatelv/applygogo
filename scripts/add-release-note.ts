import * as fs from "fs/promises";
import * as path from "path";

async function addReleaseNote() {
  const args = process.argv.slice(2);
  // Usage: npx tsx scripts/add-release-note.ts <version> <ko_week> <en_week> <ja_week> <ko_title> <en_title> <ja_title> <ko_desc> <en_desc> <ja_desc>
  if (args.length < 10) {
    console.log(
      "Usage: npx tsx scripts/add-release-note.ts <version> <ko_week> <en_week> <ja_week> <ko_title> <en_title> <ja_title> <ko_desc> <en_desc> <ja_desc>",
    );
    process.exit(1);
  }

  const [
    version,
    ko_week,
    en_week,
    ja_week,
    ko_title,
    en_title,
    ja_title,
    ko_desc,
    en_desc,
    ja_desc,
  ] = args;

  const dataPath = path.join(process.cwd(), "src/lib/data/release-notes.json");
  const rawData = await fs.readFile(dataPath, "utf-8");
  const notes = JSON.parse(rawData);

  const newNote = {
    version,
    date: new Date().toISOString().split("T")[0],
    title: {
      ko: ko_title,
      en: en_title,
      ja: ja_title,
    },
    description: {
      ko: ko_desc,
      en: en_desc,
      ja: ja_desc,
    },
    week: {
      ko: ko_week,
      en: en_week,
      ja: ja_week,
    },
  };

  notes.push(newNote);

  // Sort by date descending
  notes.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  await fs.writeFile(dataPath, JSON.stringify(notes, null, 2), "utf-8");
  console.log(`Successfully added multilingual release note v${version}`);
}

addReleaseNote().catch(console.error);
