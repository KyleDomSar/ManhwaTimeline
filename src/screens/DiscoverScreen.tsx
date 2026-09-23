import React,{useCallback,useEffect,useState} from "react";
import {FlatList,Pressable,RefreshControl,StyleSheet,Text,TextInput,View} from "react-native";
import {getCompletedManga,getLatestManga,getOngoingManga,getPopularManga,getTags,searchManga} from "../api/anilist";
import {MangaCard} from "../components/MangaCard";
import {MangaCardSkeleton} from "../components/MangaCardSkeleton";
import {colors,radius,spacing} from "../constants/theme";
import type {Manga} from "../types/models";
import type {NativeStackScreenProps} from "@react-navigation/native-stack";
import type {DiscoverStackParamList} from "../navigation/DiscoverStackNavigator";

type Props=NativeStackScreenProps<DiscoverStackParamList,"DiscoverHome">;
type Filter="popular"|"latest"|"ongoing"|"completed";
type Tag={id:string;name:string};
const filters:Filter[]=["popular","latest","ongoing","completed"];

export function DiscoverScreen({navigation}:Props){
 const[manga,setManga]=useState<Manga[]>([]);
 const[query,setQuery]=useState("");
 const[filter,setFilter]=useState<Filter>("popular");
 const[tags,setTags]=useState<Tag[]>([]);
 const[genre,setGenre]=useState<Tag|undefined>();
 const[loading,setLoading]=useState(true);
 const[refreshing,setRefreshing]=useState(false);
 const[error,setError]=useState<string|null>(null);

 useEffect(()=>{void getTags().then(setTags).catch(()=>{})},[]);

 const load=useCallback(async(search=query,selected=filter,selectedGenre=genre,refresh=false)=>{
  setError(null);
  refresh?setRefreshing(true):setLoading(true);
  try{
   const id=selectedGenre?.id;
   let data:Manga[];
   if(search.trim())data=await searchManga(search.trim(),20,id);
   else if(selected==="latest")data=await getLatestManga(20,id);
   else if(selected==="ongoing")data=await getOngoingManga(20,id);
   else if(selected==="completed")data=await getCompletedManga(20,id);
   else data=await getPopularManga(20,id);
   if(selected==="ongoing")data=data.filter(item=>item.status==="ongoing");
   else if(selected==="completed")data=data.filter(item=>item.status==="completed");
   setManga(data);
  }catch{
   setError("Unable to load manga. Check your connection and try again.");
  }finally{
   setLoading(false);
   setRefreshing(false);
  }
 },[query,filter,genre]);

 useEffect(()=>{void load("",filter,genre)},[]);

 const chooseGenre=useCallback((g?:Tag)=>{
  setGenre(g);
  void load(query,filter,g);
 },[load,query,filter]);

 const renderMangaItem=useCallback(({item}:{item:Manga})=>(
  <MangaCard manga={item} onPress={()=>navigation.navigate("MangaDetail",{manga:item})}/>
 ),[navigation]);

 const keyExtractor=useCallback((item:Manga)=>item.id,[]);

 const handleRefresh=useCallback(()=>{
  void load(query,filter,genre,true);
 },[load,query,filter,genre]);

 if(loading)return <View style={styles.container}><View style={styles.header}><Text style={styles.kicker}>DISCOVER</Text><Text style={styles.heading}>Find your next read</Text></View><View style={styles.skeletonList}>{Array.from({length:5}).map((_,index)=><MangaCardSkeleton key={index}/>)}</View></View>;

 return <View style={styles.container}>
  <View style={styles.header}>
   <Text style={styles.kicker}>DISCOVER</Text>
   <Text style={styles.heading}>{query.trim()?"Search results":"Find your next read"}</Text>
   <View style={styles.searchWrap}>
    <TextInput value={query} onChangeText={setQuery} onSubmitEditing={()=>void load(query,filter,genre)} returnKeyType="search" placeholder="Search manhwa..." placeholderTextColor={colors.textMuted} style={styles.search}/>
    {query?<Pressable onPress={()=>{setQuery("");void load("",filter,genre)}} style={styles.clearButton}><Text style={styles.clearText}>Clear</Text></Pressable>:null}
   </View>
   <Text style={styles.filterLabel}>Sort & status</Text>
   <View style={styles.filters}>{filters.map(f=><Pressable key={f} onPress={()=>{setFilter(f);void load(query,f,genre)}} style={[styles.chip,filter===f&&styles.active]}><Text style={styles.chipText}>{f}</Text></Pressable>)}</View>
   <Text style={styles.filterLabel}>Genre</Text>
   <FlatList horizontal data={[{id:"",name:"All"},...tags]} extraData={genre?.id} keyExtractor={x=>x.id||"all"} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList} renderItem={({item})=><Pressable onPress={()=>chooseGenre(item.id?item:undefined)} style={[styles.genreChip,(genre?.id===item.id||(item.id===""&&!genre))&&styles.active]}><Text style={styles.chipText}>{item.name}</Text></Pressable>}/>
  </View>
  {error&&manga.length===0
   ?<View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={()=>void load(query,filter,genre)} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable></View>
   :<FlatList
      data={manga}
      keyExtractor={keyExtractor}
      contentContainerStyle={manga.length?styles.list:styles.emptyList}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary}/>}
      renderItem={renderMangaItem}
      ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyTitle}>{query.trim()?"No results found":"No manga available"}</Text><Text style={styles.secondary}>{query.trim()?"Try a different title or search term.":"Pull down to refresh and try again."}</Text></View>}
    />
  }
 </View>;
}

const styles=StyleSheet.create({
 container:{flex:1,backgroundColor:colors.background},
 skeletonList:{paddingHorizontal:spacing.lg,paddingTop:spacing.sm},
 header:{paddingHorizontal:spacing.lg,paddingTop:spacing.xl,paddingBottom:spacing.sm},
 kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.5},
 heading:{color:colors.text,fontSize:28,fontWeight:"800",marginTop:spacing.xs,marginBottom:spacing.md},
 searchWrap:{position:"relative",justifyContent:"center"},
 search:{height:48,backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,color:colors.text,paddingHorizontal:spacing.md,paddingRight:64},
 clearButton:{position:"absolute",right:spacing.sm,paddingHorizontal:spacing.sm,paddingVertical:spacing.xs},
 clearText:{color:colors.primary,fontSize:12,fontWeight:"700"},
 filterLabel:{color:colors.text,fontSize:13,fontWeight:"800",marginTop:spacing.md,marginBottom:spacing.sm},
 filters:{flexDirection:"row",gap:spacing.sm},
 genreList:{gap:spacing.sm,paddingBottom:spacing.md},
 chip:{borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,borderRadius:radius.pill,paddingHorizontal:spacing.md,paddingVertical:spacing.sm},
 genreChip:{borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,borderRadius:radius.pill,paddingHorizontal:spacing.md,paddingVertical:spacing.sm},
 active:{borderColor:colors.primary,backgroundColor:colors.primarySoft},
 chipText:{color:colors.textSecondary,textTransform:"capitalize",fontSize:12},
 list:{padding:spacing.lg,paddingTop:spacing.sm},
 center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:colors.background,padding:spacing.xl},
 retry:{marginTop:spacing.md,backgroundColor:colors.primarySoft,borderRadius:radius.md,paddingHorizontal:spacing.lg,paddingVertical:spacing.sm},
 retryText:{color:colors.primary,fontWeight:"800"},
 emptyList:{flexGrow:1,padding:spacing.lg},
 emptyState:{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:spacing.xxl},
 emptyTitle:{color:colors.text,fontSize:18,fontWeight:"800"},
 secondary:{color:colors.textSecondary,marginTop:spacing.sm,textAlign:"center"},
 error:{color:colors.danger,textAlign:"center"}
});
