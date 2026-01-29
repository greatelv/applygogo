import releaseNotesData from "./data/release-notes.json";

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  description: string;
  week: string;
}

interface RawReleaseNote {
  version: string;
  date: string;
  title: Record<string, string>;
  description: Record<string, string>;
  week: Record<string, string>;
}

export function getAllReleaseNotes(locale: string = "ko"): ReleaseNote[] {
  const data = releaseNotesData as RawReleaseNote[];

  // Sort by date descending
  const sorted = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return sorted.map((note) => ({
    version: note.version,
    date: note.date,
    title: note.title[locale] || note.title["en"] || note.title["ko"],
    description:
      note.description[locale] ||
      note.description["en"] ||
      note.description["ko"],
    week: note.week[locale] || note.week["en"] || note.week["ko"],
  }));
}

export function getLatestReleaseNote(
  locale: string = "ko",
): ReleaseNote | undefined {
  const notes = getAllReleaseNotes(locale);
  return notes[0];
}
