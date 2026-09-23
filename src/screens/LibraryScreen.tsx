import React,{useCallback,useEffect,useState} from "react";
import {Image,Pressable,RefreshControl,ScrollView,StyleSheet,Text,View} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../navigation/LibraryStackNavigator";
import {getLibrary,removeFromLibrary,updateLibraryEntry} from "../storage/library";
import {colors,radius,spacing} from "../constants/theme";
import type {LibraryEntry,ReadingStatus} from "../types/models";
const statuses:ReadingStatus[]=["reading","completed","plan_to_read","dropped"];
type Props=NativeStackScreenProps<LibraryStackParamList,"LibraryHome">;
export function LibraryScreen({navigation}:Props){
 const[entries,setEntries]=useState<LibraryEntry[]>([]);const[filter,setFilter]=useState<ReadingStatus|"all">("all");const[refreshing,setRefreshing]=useState(false);
 const load=useCallback(async()=>setEntries(await getLibrary()),[]);useEffect(()=>{void load()},[load]);
 const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false)};const visible=filter==="all"?entries:entries.filter(e=>e.readingStatus===filter);
 return <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary}/>}><Text style={styles.kicker}>LIBRARY</Text><Text style={styles.title}>My Manhwa</Text>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{(["all",...statuses] as const).map(s=><Pressable key={s} onPress={()=>setFilter(s)} style={[styles.chip,filter===s&&styles.active]}><Text style={styles.chipText}>{s==="all"?"All":s==="plan_to_read"?"Plan to Read":s.charAt(0).toUpperCase()+s.slice(1)}</Text></Pressable>)}</ScrollView>
 {visible.length===0?<Text style={styles.empty}>Your library is empty. Add a manhwa from Discover.</Text>:visible.map(entry=><LibraryCard key={entry.manga.id} entry={entry} onUpdate={setEntries} navigation={navigation}/>)}</ScrollView>;
}
function LibraryCard({entry,onUpdate,navigation}:{entry:LibraryEntry;onUpdate:(v:LibraryEntry[])=>void;navigation:NativeStackScreenProps<LibraryStackParamList,"LibraryHome">["navigation"]}){
 const[loading,setLoading]=useState(false);
 const progress=entry.currentChapter&&entry.manga.lastChapter?Math.min(100,Math.round((Number(entry.currentChapter)/Number(entry.manga.lastChapter))*100)):0;
 const markNext=async()=>{const current=Number(entry.currentChapter);const total=Number(entry.manga.lastChapter);const next=Number.isFinite(current)&&current>0?current+1:1;if(Number.isFinite(total)&&total>0&&next>total)return;setLoading(true);try{onUpdate(await updateLibraryEntry(entry.manga.id,{currentChapter:String(next),readingStatus:"reading"}))}finally{setLoading(false)}};
 return <View style={styles.card}>
  <View style={styles.row}>
   <Pressable onPress={()=>navigation.navigate("MangaDetail",{manga:entry.manga})} style={({pressed})=>[styles.mainInfo,pressed&&styles.pressed]}>
    <View style={styles.coverWrap}>{entry.manga.coverUrl?<Image source={{uri:entry.manga.coverUrl}} style={styles.cover}/>:<View style={[styles.cover,styles.placeholder]}><Text style={styles.coverText}>No Cover</Text></View>}</View>
    <View style={styles.info}><Text style={styles.cardTitle} numberOfLines={2}>{entry.manga.title}</Text><Text style={styles.status}>{entry.readingStatus==="plan_to_read"?"Plan to Read":entry.readingStatus.charAt(0).toUpperCase()+entry.readingStatus.slice(1)}</Text><Text style={styles.chapter}>{entry.currentChapter?"Last read: Chapter "+entry.currentChapter:"Not started"}</Text>{progress>0?<View style={styles.progressTrack}><View style={[styles.progressFill,{width:progress+"%"}]}/></View>:null}{progress>0?<Text style={styles.progressText}>{progress}% chapter progress</Text>:null}</View>
   </Pressable>
   <Pressable onPress={()=>void removeFromLibrary(entry.manga.id).then(onUpdate)} hitSlop={2} pressRetentionOffset={0} style={styles.removeButton}><Text style={styles.remove}>Remove</Text></Pressable>
  </View>
  <View style={styles.actions}>{statuses.map(s=><Pressable key={s} onPress={()=>void updateLibraryEntry(entry.manga.id,{readingStatus:s}).then(onUpdate)} style={[styles.action,entry.readingStatus===s&&styles.selected]}><Text style={styles.actionText}>{s==="plan_to_read"?"Plan to Read":s.charAt(0).toUpperCase()+s.slice(1)}</Text></Pressable>)}</View>
  <View style={styles.bottomActions}><Pressable onPress={()=>void markNext()} style={styles.chapterButton}><Text style={styles.chapterButtonText}>{loading?"Saving...":"Mark Next Chapter"}</Text></Pressable></View>
 </View>;
}
