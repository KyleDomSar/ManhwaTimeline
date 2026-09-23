import type { Chapter } from "../types/models";

const API_URL = "https://api.mangadex.org";

type MangaDexTitle = Record<string, string>;

type MangaDexManga = {
  id: string;
  attributes?: {
    title?: MangaDexTitle;
    altTitles?: MangaDexTitle[];
  };
};

type MangaDexSearchResponse = {
  data?: MangaDexManga[];
};

type MangaDexChapter = {
  id: string;
  attributes?: {
    chapter?: string | null;
    title?: string | null;
    volume?: string | null;
    pages?: number;
    publishAt?: string | null;
    externalUrl?: string | null;
    translatedLanguage?: string | null;
  };
};

type MangaDexFeedResponse = {
  data?: MangaDexChapter[];
  total?: number;
};

function titlesFor(item: MangaDexManga): string[] {
  const title = item.attributes?.title ?? {};
  const alternatives = item.attributes?.altTitles ?? [];
  return [
    ...Object.values(title),
    ...alternatives.flatMap((value) => Object.values(value)),
  ].filter(Boolean);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreMatch(query: string, item: MangaDexManga): number {
  const q = normalize(query);
  const titles = titlesFor(item).map(normalize);
  if (titles.includes(q)) return 0;
  if (titles.some((title) => title.startsWith(q))) return 1;
  if (titles.some((title) => title.includes(q))) return 2;
  return 3;
}

async function findMangaId(title: string, altTitles: string[] = []): Promise<string | undefined> {
  const queries = [title, ...altTitles].filter(Boolean);

  for (const query of queries) {
    const params = new URLSearchParams({
      title: query,
      limit: "10",
      "contentRating[]": "safe",
      "contentRating[]": "suggestive",
    });

    const response = await fetch(`${API_URL}/manga?${params.toString()}`);
    if (!response.ok) continue;

    const json = (await response.json()) as MangaDexSearchResponse;
    const matches = json.data ?? [];
    if (!matches.length) continue;

    matches.sort((a, b) => scoreMatch(query, a) - scoreMatch(query, b));
    return matches[0]?.id;
  }

  return undefined;
}

export async function getChapters(
  title: string,
  altTitles: string[] = [],
  language = "en",
): Promise<Chapter[]> {
  const mangaId = await findMangaId(title, altTitles);
  if (!mangaId) return [];

  const chapters: Chapter[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      "order[chapter]": "asc",
      "order[volume]": "asc",
      "translatedLanguage[]": language,
      "contentRating[]": "safe",
      "contentRating[]": "suggestive",
    });

    const response = await fetch(
      `${API_URL}/manga/${mangaId}/feed?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("MangaDex chapter request failed: " + response.status);
    }

    const json = (await response.json()) as MangaDexFeedResponse;
    const page = json.data ?? [];

    chapters.push(
      ...page
        .filter((item) => item.attributes?.chapter)
        .map((item) => ({
          id: item.id,
          chapter: item.attributes?.chapter ?? "",
          title: item.attributes?.title ?? "",
          volume: item.attributes?.volume ?? undefined,
          pages: item.attributes?.pages ?? 0,
          publishedAt: item.attributes?.publishAt ?? undefined,
          externalUrl: item.attributes?.externalUrl ?? undefined,
        })),
    );

    offset += page.length;

    if (!page.length || page.length < limit || (json.total !== undefined && offset >= json.total)) {
      break;
    }
  }

  const seen = new Set<string>();
  return chapters.filter((chapter) => {
    const key = chapter.chapter + "|" + chapter.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
