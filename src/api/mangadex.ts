import type { Manga, MangaStatus } from "../types/models";

const API_URL = "https://api.mangadex.org";
const COVER_URL = "https://uploads.mangadex.org/covers";

type MangaDexManga = {
  id: string;
  attributes: {
    title?: Record<string, string>;
    altTitles?: Array<Record<string, string>>;
    description?: Record<string, string>;
    status?: string;
    year?: number | null;
    lastChapter?: string | null;
    lastVolume?: string | null;
    contentRating?: string;
    followedCount?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  relationships?: Array<{
    type: string;
    id: string;
    attributes?: {
      name?: string;
      fileName?: string;
    };
  }>;
};

function pickEnglish(record?: Record<string, string>): string | undefined {
  if (!record) return undefined;
  return record.en ?? record["ja-ro"] ?? record["ja"] ?? Object.values(record)[0];
}

function mapStatus(status?: string): MangaStatus {
  switch (status) {
    case "ongoing":
    case "completed":
    case "hiatus":
    case "cancelled":
      return status;
    default:
      return "unknown";
  }
}

function mapManga(item: MangaDexManga): Manga {
  const cover = item.relationships?.find((relation) => relation.type === "cover_art");
  const authors = item.relationships
    ?.filter((relation) => relation.type === "author")
    .map((relation) => relation.attributes?.name)
    .filter((name): name is string => Boolean(name)) ?? [];
  const artists = item.relationships
    ?.filter((relation) => relation.type === "artist")
    .map((relation) => relation.attributes?.name)
    .filter((name): name is string => Boolean(name)) ?? [];

  return {
    id: item.id,
    title: pickEnglish(item.attributes.title) ?? "Untitled",
    altTitles: item.attributes.altTitles
      ?.map((title) => pickEnglish(title))
      .filter((title): title is string => Boolean(title)),
    description: pickEnglish(item.attributes.description),
    coverUrl:
      cover?.attributes?.fileName
        ? `${COVER_URL}/${item.id}/${cover.attributes.fileName}`
        : undefined,
    status: mapStatus(item.attributes.status),
    year: item.attributes.year ?? undefined,
    genres: [],
    authors,
    artists,
    lastChapter: item.attributes.lastChapter ?? undefined,
    lastVolume: item.attributes.lastVolume ?? undefined,
    contentRating: item.attributes.contentRating,
    followedCount: item.attributes.followedCount,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt
  };
}

export async function getPopularManga(limit = 20): Promise<Manga[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    "order[followedCount]": "desc",
    "contentRating[]": "safe",
    "includes[]": "cover_art",
    "includes[1]": "author",
    "includes[2]": "artist"
  });

  const response = await fetch(`${API_URL}/manga?${params.toString()}`);
  if (!response.ok) throw new Error(`MangaDex request failed: ${response.status}`);

  const json = (await response.json()) as { data: MangaDexManga[] };
  return json.data.map(mapManga);
}

export async function searchManga(query: string, limit = 20): Promise<Manga[]> {
  const params = new URLSearchParams({
    title: query,
    limit: String(limit),
    "order[relevance]": "desc",
    "contentRating[]": "safe",
    "includes[]": "cover_art",
    "includes[1]": "author",
    "includes[2]": "artist"
  });

  const response = await fetch(`${API_URL}/manga?${params.toString()}`);
  if (!response.ok) throw new Error(`MangaDex request failed: ${response.status}`);

  const json = (await response.json()) as { data: MangaDexManga[] };
  return json.data.map(mapManga);
}