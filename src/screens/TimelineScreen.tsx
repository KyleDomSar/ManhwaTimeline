import React,{useCallback,useEffect,useMemo,useState} from "react";
import {Pressable,RefreshControl,ScrollView,SectionList,StyleSheet,Text,View} from "react-native";
import {colors,radius,spacing} from "../constants/theme";
import {TimelineSkeleton} from "../components/TimelineSkeleton";
import {MangaCover} from "../components/MangaCover";
import {getActivity,getLibrary} from "../storage/library";
import type {ActivityEvent,LibraryEntry} from "../types/models";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TimelineStackParamList } from "../navigation/TimelineStackNavigator";

type Props=NativeStackScreenProps<TimelineStackParamList,"TimelineHome">;
type TimelineRow=
 {kind:"entry";entry:LibraryEntry}
 |{kind:"activity";event:ActivityEvent};

export function TimelineScreen({navigation}:Props){
 const[entries,setEntries]=useState<LibraryEntry[]>([]);const[activity,setActivity]=useState<ActivityEvent[]>([]);const[refreshing,setRefreshing]=useState(false);const[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{const[library,events]=await Promise.all([getLibrary(),getActivity(20)]);setEntries(library);setActivity(events);setLoading(false)},[]);
 useEffect(()=>{void load()},[load]);
 const refresh=useCallback(async()=>{setRefreshing(true);await load();setRefreshing(false)},[load]);
 const reading=useMemo(()=>entries.filter(e=>e.readingStatus==="reading"),[entries]);const completed=useMemo(()=>entries.filter(e=>e.readingStatus==="completed"),[entries]);const plan=useMemo(()=>entries.filter(e=>e.readingStatus==="plan_to_read"),[entries]);const total=entries.length;const progress=total?Math.round((completed.length/total)*100):0;
 const entryById=useMemo(()=>new Map(entries.map(entry=>[entry.manga.id,entry])),[entries]);
 const sections=useMemo(()=>[
  {title:"Continue Reading",empty:"No manhwa currently marked as Reading.",data:reading.map(entry=>({kind:"entry" as const,entry}))},
  {title:"Plan to Read",empty:"Nothing queued yet.",data:plan.map(entry=>({kind:"entry" as const,entry}))},
  ...(completed.length>0?[{title:"Completed",empty:"",data:completed.slice(0,5).map(entry=>({kind:"entry" as const,entry}))}]:[]),
  {title:"Recent Activity",empty:"Your reading activity will appear here.",data:activity.map(event=>({kind:"activity" as const,event}))},
 ],[reading,plan,completed,activity]);
 const keyExtractor=useCallback((item:TimelineRow,index:number)=>item.kind==="entry"?"entry:"+item.entry.manga.id:"activity:"+item.event.id+"-"+index,[]);
 const renderSectionHeader=useCallback(({section}:{section:{title:string}})=><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>,[]);
 const renderSectionFooter=useCallback(({section}:{section:{data:TimelineRow[];empty:string}})=>section.data.length===0?<Text style={styles.empty}>{section.empty}</Text>:null,[]);
 const renderTimelineItem=useCallback(({item}:{item:TimelineRow})=>item.kind==="entry"?<TimelineEntryCard entry={item.entry} navigation={navigation}/>:<ActivityCard event={item.event} entry={entryById.get(item.event.mangaId)} navigation={navigation}/>,[entryById,navigation]);
 if(loading)return <ScrollView style={styles.container}><TimelineSkeleton/></ScrollView>;
 return <SectionList
  style={styles.container}
  contentContainerStyle={styles.content}
  sections={sections}
  keyExtractor={keyExtractor}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary}/>}
  ListHeaderComponent={<>
   <Text style={styles.kicker}>MANHWATIMELINE</Text><Text style={styles.title}>Your Timeline</Text><Text style={styles.subtitle}>Your reading activity, progress, and next reads.</Text>
   <View style={styles.stats}><Stat label="Library" value={String(total)}/><Stat label="Reading" value={String(reading.length)}/><Stat label="Done" value={String(completed.length)}/></View>
   <View style={styles.progressCard}><View style={styles.row}><Text style={styles.cardTitle}>Library progress</Text><Text style={styles.percent}>{progress}%</Text></View><View style={styles.bar}><View style={[styles.fill,{width:progress+"%"}]}/></View><Text style={styles.muted}>{completed.length} of {total} titles completed</Text></View>
  </>}
  renderSectionHeader={renderSectionHeader}
  renderItem={renderTimelineItem}
  renderSectionFooter={renderSectionFooter}
 />;
}
function formatDate(value:string){const date=new Date(value);return date.toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}
function Stat({label,value}:{label:string;value:string}){return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>}
function Section({title,entries,empty,navigation}:{title:string;entries:LibraryEntry[];empty:string;navigation:Props["navigation"]}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{entries.length===0?<Text style={styles.empty}>{empty}</Text>:entries.map(e=><Pressable key={e.manga.id} onPress={()=>navigation.push("MangaDetail",{manga:e.manga})} style={({pressed})=>[styles.item,pressed&&styles.pressed]}><View style={styles.info}><Text style={styles.itemTitle} numberOfLines={1}>{e.manga.title}</Text><Text style={styles.muted}>{e.currentChapter?"Last read: Chapter "+e.currentChapter:"Not started"}</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}</View>}

const TimelineEntryCard=React.memo(function TimelineEntryCard({entry,navigation}:{entry:LibraryEntry;navigation:Props["navigation"]}){return <Pressable onPress={()=>navigation.push("MangaDetail",{manga:entry.manga})} style={({pressed})=>[styles.item,pressed&&styles.pressed]}><MangaCover uri={entry.manga.coverUrl} style={styles.itemCover}/><View style={styles.info}><Text style={styles.itemTitle} numberOfLines={1}>{entry.manga.title}</Text><Text style={styles.muted}>{entry.currentChapter?"Last read: Chapter "+entry.currentChapter:"Not started"}</Text></View><Text style={styles.chevron}>›</Text></Pressable>});

const ActivityCard=React.memo(function ActivityCard({event,entry,navigation}:{event:ActivityEvent;entry:LibraryEntry|undefined;navigation:Props["navigation"]}){const content=<View style={styles.activity}>{entry?<MangaCover uri={entry.manga.coverUrl} style={styles.activityCover}/>:<View style={styles.dot}/>}<View style={styles.activityInfo}><Text style={styles.itemTitle}>{event.mangaTitle}</Text><Text style={styles.muted}>{event.detail}</Text><Text style={styles.date}>{formatDate(event.createdAt)}</Text></View>{entry?<Text style={styles.chevron}>›</Text>:null}</View>;return entry?<Pressable onPress={()=>navigation.push("MangaDetail",{manga:entry.manga})} style={({pressed})=>[pressed&&styles.pressed]}>{content}</Pressable>:content});

const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,paddingBottom:spacing.xxl},kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.5},title:{color:colors.text,fontSize:30,fontWeight:"800",marginTop:spacing.xs},subtitle:{color:colors.textSecondary,marginTop:spacing.sm,lineHeight:21},stats:{flexDirection:"row",gap:spacing.sm,marginTop:spacing.xl},stat:{flex:1,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},statValue:{color:colors.text,fontSize:22,fontWeight:"800"},muted:{color:colors.textSecondary,fontSize:12,marginTop:spacing.xs},progressCard:{marginTop:spacing.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},row:{flexDirection:"row",justifyContent:"space-between"},cardTitle:{color:colors.text,fontWeight:"800"},percent:{color:colors.primary,fontWeight:"800"},bar:{height:8,backgroundColor:colors.surfaceElevated,borderRadius:radius.pill,overflow:"hidden",marginTop:spacing.md},fill:{height:"100%",backgroundColor:colors.primary},section:{marginTop:spacing.xl},sectionHeader:{marginTop:spacing.xl,marginBottom:spacing.sm},sectionTitle:{color:colors.text,fontSize:19,fontWeight:"800",marginBottom:spacing.sm},empty:{color:colors.textMuted,paddingVertical:spacing.sm},itemCover:{width:46,height:64,borderRadius:radius.sm,marginRight:spacing.md},item:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,flexDirection:"row",alignItems:"center"},info:{flex:1},itemTitle:{color:colors.text,fontWeight:"700",fontSize:15},activityCover:{width:44,height:62,borderRadius:radius.sm},activity:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,flexDirection:"row",gap:spacing.md},dot:{width:9,height:9,borderRadius:9,backgroundColor:colors.primary,marginTop:5},activityInfo:{flex:1},date:{color:colors.textMuted,fontSize:11,marginTop:3},chevron:{color:colors.textMuted,fontSize:24,lineHeight:24},pressed:{opacity:0.72}});
