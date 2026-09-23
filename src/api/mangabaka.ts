import type { Manga } from "../types/models";
import { getCached, setCached } from "../storage/cache";

const API_URL = "https://api.mangabaka.org/v1";
const REQUEST_TIMEOUT = 10000;
const chapterInfoInFlight = new Map<string, Promise<{ totalChapters?: number; source: "MangaBaka" }>>();

async function fetchMangaBaka(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

type SearchItem = {
  id?: string | number;
  title?: string | null;
  titles?: Array<string | { title?: string; name?: string }>;
  total_chapters?: number | string | null;
  chapters?: number | string | null;
};
type SearchResponse = { data?: SearchItem[]; results?: SearchItem[] };

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function getTitles(item: SearchItem) {
  const extra = (item.titles ?? []).flatMap(value =>
    typeof value === "string" ? [value] : [value.title, value.name].filter((x): x is string => Boolean(x))
  );
  return [item.title, ...extra].filter((x): x is string => Boolean(x));
}
function score(query: string, item: SearchItem) {
  const q = normalize(query);
  const titles = getTitles(item).map(normalize);
  if (titles.includes(q)) return 0;
  if (titles.some(title => title.startsWith(q))) return 1;
  if (titles.some(title => title.includes(q))) return 2;
  return 3;
}
function chapterCount(item: SearchItem) {
  const raw = item.total_chapters ?? item.chapters;
  const value = typeof raw === "string" ? Number(raw) : raw;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export async function getChapterInfo(manga: Pick<Manga, "id" | "title" | "altTitles">) {
  const key = `chapter-info.${manga.id}`;
  const cached = await getCached<{ totalChapters?: number; source: "MangaBaka" }>(key);
  if (cached) return cached;
  const existing = chapterInfoInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
  const queries = [manga.title, ...(manga.altTitles ?? [])].filter(Boolean);
  for (const query of queries) {
    const params = new URLSearchParams({ q: query, limit: "10" });
    const response = await fetchMangaBaka(`${API_URL}/series/search?${params.toString()}`);
    if (!response.ok) continue;
    const json = (await response.json()) as SearchResponse;
    const items = json.data ?? json.results ?? [];
    const matches = [...items].sort((a, b) => score(query, a) - score(query, b));
    const best = matches.find(item => chapterCount(item) !== undefined);
    const totalChapters = best ? chapterCount(best) : undefined;
    if (totalChapters !== undefined) {
      const result = { totalChapters, source: "MangaBaka" as const };
      await setCached(key, result);
      return result;
    }
  }
  const result = { source: "MangaBaka" as const };
  await setCached(key, result);
  return result;
  })();
  chapterInfoInFlight.set(key, request);
  try {
    return await request;
  } finally {
    chapterInfoInFlight.delete(key);
  }
}
