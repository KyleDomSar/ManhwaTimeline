import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX="manhwatimeline.cache.v1.";
const TTL=15*60*1000;

type CacheEntry<T>={savedAt:number;data:T};

export async function getCached<T>(key:string,allowStale=false):Promise<T|undefined>{
 const raw=await AsyncStorage.getItem(PREFIX+key);
 if(!raw)return undefined;
 try{
  const entry=JSON.parse(raw) as CacheEntry<T>;
  if(!allowStale&&Date.now()-entry.savedAt>TTL)return undefined;
  return entry.data;
 }catch{return undefined}
}

export async function setCached<T>(key:string,data:T){
 const entry:CacheEntry<T>={savedAt:Date.now(),data};
 await AsyncStorage.setItem(PREFIX+key,JSON.stringify(entry));
}
