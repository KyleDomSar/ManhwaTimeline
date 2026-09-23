import type { Manga, MangaStatus } from "../types/models";
import {getCached,setCached} from "../storage/cache";

const API_URL="https://graphql.anilist.co";

type AniListMedia={
 id:number;
 title?:{english?:string|null;romaji?:string|null;native?:string|null;userPreferred?:string|null};
 synonyms?:string[];
 description?:string|null;
 status?:string|null;
 startDate?:{year?:number|null};
 chapters?:number|null;
 genres?:string[];
 coverImage?:{large?:string|null;extraLarge?:string|null};
 popularity?:number|null;
 favourites?:number|null;
 averageScore?:number|null;
 staff?:{edges?:Array<{role?:string|null;node?:{name?:{full?:string|null}}}>};
};

type AniListResponse={data?:{Page?:{media?:AniListMedia[];pageInfo?:{hasNextPage?:boolean}};Media?:AniListMedia};errors?:Array<{message:string}>};

type AniListDetailResponse={data?:{Media?:AniListMedia&{relations?:{edges?:Array<{relationType?:string|null;node?:AniListMedia|null}>};recommendations?:{nodes?:Array<{mediaRecommendation?:AniListMedia|null}>}}};errors?:Array<{message:string}>};

const MEDIA_QUERY=`
query ($page:Int,$perPage:Int,$search:String,$status:MediaStatus,$genre:String,$sort:[MediaSort]) {
 Page(page:$page,perPage:$perPage) {
  pageInfo { hasNextPage }
  media(type:MANGA,format:MANGA,isAdult:false,search:$search,status:$status,genre:$genre,sort:$sort) {
   id
   title { english romaji native userPreferred }
   synonyms
   description(asHtml:false)
   status
   startDate { year }
   chapters
   genres
   coverImage { large extraLarge }
   popularity
   favourites
   averageScore
   staff(perPage:20) {
    edges { role node { name { full } } }
   }
  }
 }
}
`;

const GENRES_QUERY=`query { GenreCollection }`;
const DETAIL_QUERY=`
query ($id:Int!) {
 Media(id:$id,type:MANGA) {
  id
  genres
  relations {
   edges {
    relationType
    node {
     id
     type
     title { english romaji native userPreferred }
     synonyms
     description(asHtml:false)
     status
     startDate { year }
     chapters
     genres
     coverImage { large extraLarge }
     popularity
     favourites
     averageScore
    }
   }
  }
  recommendations(perPage:10) {
   nodes {
    mediaRecommendation {
     id
     type
     title { english romaji native userPreferred }
     synonyms
     description(asHtml:false)
     status
     startDate { year }
     chapters
     genres
     coverImage { large extraLarge }
     popularity
     favourites
     averageScore
    }
   }
  }
 }
}
`;

function mapStatus(status?:string|null):MangaStatus {
 if(status==="RELEASING")return "ongoing";
 if(status==="FINISHED")return "completed";
 if(status==="HIATUS")return "hiatus";
 if(status==="CANCELLED")return "cancelled";
 return "unknown";
}

function cleanDescription(value?:string|null){
 return value?.replace(/<[^>]*>/g,"").replace(/\\n\\s*/g," ").trim()||undefined;
}

function mapManga(item:AniListMedia):Manga {
 const staff=item.staff?.edges??[];
 const authors=staff.filter(x=>/story|author|original creator/i.test(x.role??"")).map(x=>x.node?.name?.full).filter((x):x is string=>Boolean(x));
 const artists=staff.filter(x=>/art|artist|illustrat/i.test(x.role??"")).map(x=>x.node?.name?.full).filter((x):x is string=>Boolean(x));
 const title=item.title?.english??item.title?.userPreferred??item.title?.romaji??item.title?.native??"Untitled";
 return {
  id:String(item.id),
  title,
  altTitles:[item.title?.romaji,item.title?.native,...(item.synonyms??[])].filter((x):x is string=>Boolean(x)&&x!==title),
  description:cleanDescription(item.description),
  coverUrl:item.coverImage?.extraLarge??item.coverImage?.large??undefined,
  status:mapStatus(item.status),
  year:item.startDate?.year??undefined,
  genres:item.genres??[],
  authors:[...new Set(authors)],
  artists:[...new Set(artists)],
  lastChapter:item.chapters!=null?String(item.chapters):undefined,
  totalChapters:item.chapters??undefined,
  chapterCountSource:item.chapters!=null?"AniList":undefined,
  contentRating:"safe",
  followedCount:item.favourites??undefined,
  popularity:item.popularity??undefined,
  favourites:item.favourites??undefined,
  averageScore:item.averageScore??undefined,
 };
}

async function request(variables:Record<string,unknown>):Promise<Manga[]> {
 const key="media."+JSON.stringify(variables);
 try{
  const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:MEDIA_QUERY,variables})});
  if(!response.ok)throw new Error("AniList request failed: "+response.status);
  const json=await response.json() as AniListResponse;
  if(json.errors?.length)throw new Error(json.errors[0].message);
  const data=(json.data?.Page?.media??[]).map(mapManga);
  await setCached(key,data);
  return data;
 }catch(error){
  const cached=await getCached<Manga[]>(key,true);
  if(cached)return cached;
  throw error;
 }
}

const browse=(limit:number,sort:string,genre?:string,status?:string)=>request({page:1,perPage:limit,sort:[sort],genre:genre||undefined,status:status||undefined});

export async function getTags(){
 const key="genres";
 try{
  const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:GENRES_QUERY})});
  if(!response.ok)throw new Error("AniList genre request failed: "+response.status);
  const json=await response.json() as {data?:{GenreCollection?:string[]};errors?:Array<{message:string}>};
  if(json.errors?.length)throw new Error(json.errors[0].message);
  const tags=(json.data?.GenreCollection??[]).map(name=>({id:name,name}));
  await setCached(key,tags);
  return tags;
 }catch(error){
  const cached=await getCached<{id:string;name:string}[]>(key,true);
  if(cached)return cached;
  throw error;
 }
}

export async function getPopularManga(limit=20,genreId?:string){return browse(limit,"POPULARITY_DESC",genreId)}
export async function getLatestManga(limit=20,genreId?:string){return browse(limit,"UPDATED_AT_DESC",genreId)}
export async function getCompletedManga(limit=20,genreId?:string){return browse(limit,"POPULARITY_DESC",genreId,"FINISHED")}
export async function getOngoingManga(limit=20,genreId?:string){return browse(limit,"POPULARITY_DESC",genreId,"RELEASING")}

type MangaDiscovery = {
 related: Array<{relationType:string;manga:Manga}>;
 recommended: Manga[];
};

export async function getMangaDiscovery(id:string):Promise<MangaDiscovery>{
 const key="discovery."+id;
 try{
  const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:DETAIL_QUERY,variables:{id:Number(id)}})});
  if(!response.ok)throw new Error("AniList detail request failed: "+response.status);
  const json=await response.json() as AniListDetailResponse;
  if(json.errors?.length)throw new Error(json.errors[0].message);
  const media=json.data?.Media;
  const related=(media?.relations?.edges??[])
   .filter(edge=>edge.relationType!=="ADAPTATION"&&edge.node?.type==="MANGA")
   .map(edge=>({relationType:edge.relationType??"RELATED",manga:edge.node?mapManga(edge.node):undefined}))
   .filter((item):item is {relationType:string;manga:Manga}=>Boolean(item.manga));
  const recommended=(media?.recommendations?.nodes??[])
   .map(node=>node.mediaRecommendation)
   .filter((item):item is AniListMedia=>Boolean(item&&item.type==="MANGA"))
   .map(mapManga);
  if(recommended.length){
   const result={related,recommended};
   await setCached(key,result);
   return result;
  }
  const fallback=media?.genres?.[0]
   ?(await request({page:1,perPage:15,genre:media.genres[0],sort:["POPULARITY_DESC"]})).filter(item=>item.id!==id).slice(0,10)
   :[];
  const result={related,recommended:fallback};
  await setCached(key,result);
  return result;
 }catch(error){
  const cached=await getCached<MangaDiscovery>(key,true);
  if(cached)return cached;
  throw error;
 }
}

export async function searchManga(query:string,limit=20,genreId?:string){
 const results=await request({page:1,perPage:Math.max(limit,30),search:query.trim(),genre:genreId||undefined,sort:["SEARCH_MATCH","POPULARITY_DESC"]});
 const q=query.trim().toLowerCase();
 const score=(title:string)=>{const t=title.toLowerCase();return t===q?0:t.startsWith(q)?1:t.includes(q)?2:3};
 return results.sort((a,b)=>score(a.title)-score(b.title)).slice(0,limit);
}
