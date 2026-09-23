import React,{useCallback,useEffect,useState} from "react";
import {FlatList,Pressable,RefreshControl,ScrollView,StyleSheet,Text,View} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../navigation/LibraryStackNavigator";
import {getLibrary,removeFromLibrary,updateLibraryEntry} from "../storage/library";
import {colors,radius,spacing} from "../constants/theme";
import {LibrarySkeleton} from "../components/LibrarySkeleton";
import {MangaCover} from "../components/MangaCover";
import type {LibraryEntry,ReadingStatus} from "../types/models";
const statuses:ReadingStatus[]=["reading","completed","plan_to_read","dropped"];
type Props=NativeStackScreenProps<LibraryStackParamList,"LibraryHome">;
export function LibraryScreen({navigation}:Props){
 const[entries,setEntries]=useState<LibraryEntry[]>([]);const[filter,setFilter]=useState<ReadingStatus|"all">("all");const[refreshing,setRefreshing]=useState(false);const[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setEntries(await getLibrary());setLoading(false)},[]);useEffect(()=>{void load()},[load]);
 const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false)};const visible=filter==="all"?entries:entries.filter(e=>e.readingStatus===filter);
 const renderLibraryItem=useCallback(({item}:{item:LibraryEntry})=><LibraryCard entry={item} onUpdate={setEntries} navigation={navigation}/>,[navigation]);

 if(loading)return <ScrollView style={styles.container}><LibrarySkeleton/></ScrollView>;
 return <FlatList
  style={styles.container}
  contentContainerStyle={styles.content}
  data={visible}
  keyExtractor={entry=>entry.manga.id}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary}/>}
  ListHeaderComponent={<><Text style={styles.kicker}>LIBRARY</Text><Text style={styles.title}>My Manhwa</Text>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{(["all",...statuses] as const).map(s=><Pressable key={s} onPress={()=>setFilter(s)} style={[styles.chip,filter===s&&styles.active]}><Text style={styles.chipText}>{s==="all"?"All":s==="plan_to_read"?"Plan to Read":s.charAt(0).toUpperCase()+s.slice(1)}</Text></Pressable>)}</ScrollView>
  </>}
  ListEmptyComponent={<Text style={styles.empty}>Your library is empty. Add a manhwa from Discover.</Text>}
  renderItem={renderLibraryItem}
 />;
}
const LibraryCard=React.memo(function LibraryCard({entry,onUpdate,navigation}:{entry:LibraryEntry;onUpdate:(v:LibraryEntry[])=>void;navigation:NativeStackScreenProps<LibraryStackParamList,"LibraryHome">["navigation"]}){
 const[loading,setLoading]=useState(false);
 const progress=entry.currentChapter&&entry.manga.lastChapter?Math.min(100,Math.round((Number(entry.currentChapter)/Number(entry.manga.lastChapter))*100)):0;
 const markNext=useCallback(async()=>{const current=Number(entry.currentChapter);const total=Number(entry.manga.lastChapter);const next=Number.isFinite(current)&&current>0?current+1:1;if(Number.isFinite(total)&&total>0&&next>total)return;setLoading(true);try{onUpdate(await updateLibraryEntry(entry.manga.id,{currentChapter:String(next),readingStatus:"reading"}))}finally{setLoading(false)}},[entry.currentChapter,entry.manga.id,entry.manga.lastChapter,onUpdate]);
 return <View style={styles.card}>
  <View style={styles.row}>
   <Pressable onPress={()=>navigation.navigate("MangaDetail",{manga:entry.manga})} style={({pressed})=>[styles.mainInfo,pressed&&styles.pressed]}>
    <View style={styles.coverWrap}><MangaCover uri={entry.manga.coverUrl} style={styles.cover}/></View>
    <View style={styles.info}><Text style={styles.cardTitle} numberOfLines={2}>{entry.manga.title}</Text><Text style={styles.status}>{entry.readingStatus==="plan_to_read"?"Plan to Read":entry.readingStatus.charAt(0).toUpperCase()+entry.readingStatus.slice(1)}</Text><Text style={styles.chapter}>{entry.currentChapter?"Last read: Chapter "+entry.currentChapter:"Not started"}</Text>{progress>0?<View style={styles.progressTrack}><View style={[styles.progressFill,{width:progress+"%"}]}/></View>:null}{progress>0?<Text style={styles.progressText}>{progress}% chapter progress</Text>:null}</View>
   </Pressable>
   <Pressable onPress={()=>void removeFromLibrary(entry.manga.id).then(onUpdate)} hitSlop={2} pressRetentionOffset={0} style={styles.removeButton}><Text style={styles.remove}>Remove</Text></Pressable>
  </View>
  <View style={styles.actions}>{statuses.map(s=><Pressable key={s} onPress={()=>void updateLibraryEntry(entry.manga.id,{readingStatus:s}).then(onUpdate)} style={[styles.action,entry.readingStatus===s&&styles.selected]}><Text style={styles.actionText}>{s==="plan_to_read"?"Plan to Read":s.charAt(0).toUpperCase()+s.slice(1)}</Text></Pressable>)}</View>
  <View style={styles.bottomActions}><Pressable onPress={()=>void markNext()} style={styles.chapterButton}><Text style={styles.chapterButtonText}>{loading?"Saving...":"Mark Next Chapter"}</Text></Pressable></View>
 </View>;
});
const styles=StyleSheet.create({
 container:{flex:1,backgroundColor:colors.background},
 content:{padding:spacing.lg,paddingBottom:spacing.xl},
 kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.2},
 title:{color:colors.text,fontSize:28,fontWeight:"800",marginTop:spacing.xs,marginBottom:spacing.md},
 filters:{gap:spacing.sm,paddingBottom:spacing.md},
 chip:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.pill,paddingHorizontal:spacing.md,paddingVertical:spacing.sm},
 active:{backgroundColor:colors.primarySoft,borderColor:colors.primary},
 chipText:{color:colors.textSecondary,fontSize:12,fontWeight:"700"},
 empty:{color:colors.textMuted,fontSize:14,lineHeight:20,marginTop:spacing.xl},
 card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.md,marginBottom:spacing.md},
 row:{flexDirection:"row",alignItems:"flex-start",gap:spacing.sm},
 mainInfo:{flexDirection:"row",flex:1,gap:spacing.md,minWidth:0},
 coverWrap:{width:72,height:104},
 cover:{width:72,height:104,borderRadius:radius.md},
 info:{flex:1,minWidth:0},
 cardTitle:{color:colors.text,fontSize:15,fontWeight:"800",lineHeight:20},
 status:{color:colors.primary,fontSize:12,fontWeight:"700",marginTop:spacing.xs},
 chapter:{color:colors.textSecondary,fontSize:12,marginTop:spacing.xs},
 progressTrack:{height:5,backgroundColor:colors.surfaceElevated,borderRadius:radius.pill,overflow:"hidden",marginTop:spacing.sm},
 progressFill:{height:"100%",backgroundColor:colors.primary},
 progressText:{color:colors.textMuted,fontSize:10,marginTop:spacing.xs},
 removeButton:{alignSelf:"flex-start",paddingVertical:spacing.xs,paddingHorizontal:spacing.xs},
 remove:{color:colors.danger,fontSize:11,fontWeight:"700"},
 actions:{flexDirection:"row",flexWrap:"wrap",gap:spacing.xs,marginTop:spacing.md},
 action:{backgroundColor:colors.surfaceElevated,borderRadius:radius.md,paddingHorizontal:spacing.sm,paddingVertical:spacing.xs},
 selected:{backgroundColor:colors.primarySoft,borderWidth:1,borderColor:colors.primary},
 actionText:{color:colors.textSecondary,fontSize:10,fontWeight:"700"},
 bottomActions:{marginTop:spacing.sm},
 chapterButton:{backgroundColor:colors.primarySoft,borderRadius:radius.md,paddingVertical:spacing.sm,alignItems:"center"},
 chapterButtonText:{color:colors.primary,fontSize:12,fontWeight:"800"},
 pressed:{opacity:0.75},
});