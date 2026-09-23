export type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled" | "unknown";
export type ReadingStatus = "reading" | "completed" | "plan_to_read" | "dropped";
export type Manga = { id:string; title:string; altTitles?:string[]; description?:string; coverUrl?:string; status:MangaStatus; year?:number; genres:string[]; authors:string[]; artists:string[]; lastChapter?:string; lastVolume?:string; totalChapters?:number; chapterCountSource?:string; contentRating?:string; followedCount?:number; popularity?:number; favourites?:number; averageScore?:number; createdAt?:string; updatedAt?:string; };
export type Chapter = { id:string; chapter:string; title:string; volume?:string; pages:number; publishedAt?:string; externalUrl?:string; };
export type ActivityEvent = { id:string; type:"added"|"chapter_read"|"status_changed"|"removed"; mangaId:string; mangaTitle:string; detail:string; chapter?:string; createdAt:string; };
export type LibraryEntry = { manga:Manga; readingStatus:ReadingStatus; currentChapter?:string; addedAt:string; updatedAt:string; };
export type MangaListResponse = { data:Manga[]; total:number; };
