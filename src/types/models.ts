export type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled" | "unknown";

export type Manga = {
  id: string;
  title: string;
  altTitles?: string[];
  description?: string;
  coverUrl?: string;
  status: MangaStatus;
  year?: number;
  genres: string[];
  authors: string[];
  artists: string[];
  lastChapter?: string;
  lastVolume?: string;
  contentRating?: string;
  followedCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MangaListResponse = {
  data: Manga[];
  total: number;
};