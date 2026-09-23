import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LibraryEntry, Manga, ReadingStatus } from "../types/models";
const KEY="manhwatimeline.library.v1";
async function read():Promise<LibraryEntry[]>{const raw=await AsyncStorage.getItem(KEY);if(!raw)return[];try{return JSON.parse(raw) as LibraryEntry[]}catch{return[]}}
async function write(entries:LibraryEntry[]){await AsyncStorage.setItem(KEY,JSON.stringify(entries));}
export async function getLibrary(){return read();}
export async function addToLibrary(manga:Manga,readingStatus:ReadingStatus="plan_to_read"){const entries=await read();const now=new Date().toISOString();const existing=entries.find(e=>e.manga.id===manga.id);if(existing){existing.readingStatus=readingStatus;existing.updatedAt=now;}else entries.unshift({manga,readingStatus,addedAt:now,updatedAt:now});await write(entries);return entries;}
export async function updateLibraryEntry(id:string,patch:Partial<Pick<LibraryEntry,"readingStatus"|"currentChapter">>){const entries=await read();const entry=entries.find(e=>e.manga.id===id);if(!entry)return entries;Object.assign(entry,patch,{updatedAt:new Date().toISOString()});await write(entries);return entries;}
export async function removeFromLibrary(id:string){const entries=(await read()).filter(e=>e.manga.id!==id);await write(entries);return entries;}