import React,{useCallback,useEffect,useState} from "react";
import {FlatList,Pressable,RefreshControl,ScrollView,StyleSheet,Text,View} from "react-native";
import {colors,radius,spacing} from "../constants/theme";
import {TimelineSkeleton} from "../components/TimelineSkeleton";
import {getActivity,getLibrary} from "../storage/library";
import type {ActivityEvent,LibraryEntry} from "../types/models";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TimelineStackParamList } from "../navigation/TimelineStackNavigator";

type Props=NativeStackScreenProps<TimelineStackParamList,"TimelineHome">;

export function TimelineScreen({navigation}:Props){
 const[entries,setEntries]=useState<LibraryEntry[]>([]);const[activity,setActivity]=useState<ActivityEvent[]>([]);const[refreshing,setRefreshing]=useState(false);const[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{const[library,events]=await Promise.all([getLibrary(),getActivity(20)]);setEntries(library);setActivity(events);setLoading(false)},[]);
 useEffect(()=>{void load()},[load]);
 const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false)};
 const reading=entries.filter(e=>e.readingStatus==="reading");const completed=entries.filter(e=>e.readingStatus==="completed");const plan=entries.filter(e=>e.readingStatus==="plan_to_read");const total=entries.length;const progress=total?Math.round((completed.length/total)*100):0;
 if(loading)return <ScrollView style={styles.container}><TimelineSkeleton/></ScrollView>;
 const sections=[
  {title:"Continue Reading",empty:"No manhwa currently marked as Reading.",data:reading.map(entry=>({kind:"entry" as const,entry}))},
  {title:"Plan to Read",empty:"Nothing queued yet.",data:plan.map(entry=>({kind:"entry" as const,entry}))},
  ...(completed.length>0?[{title:"Completed",empty:"",data:completed.slice(0,5).map(entry=>({kind:"entry" as const,entry}))}]:[]),
  {title:"Recent Activity",empty:"Your reading activity will appear here.",data:activity.map(event=>({kind:"activity" as const,event}))},
 ];
 return <SectionList
  style={styles.container}
  contentContainerStyle={styles.content}
  sections={sections}
  keyExtractor={(item,index)=>item.kind==="entry"?item.entry.manga.id:item.event.id+"-"+index}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary}/>}
  ListHeaderComponent={<>
   <Text style={styles.kicker}>MANHWATIMELINE</Text><Text style={styles.title}>Your Timeline</Text><Text style={styles.subtitle}>Your reading activity, progress, and next reads.</Text>
   <View style={styles.stats}><Stat label="Library" value={String(total)}/><Stat label="Reading" value={String(reading.length)}/><Stat label="Done" value={String(completed.length)}/></View>
   <View style={styles.progressCard}><View style={styles.row}><Text style={styles.cardTitle}>Library progress</Text><Text style={styles.percent}>{progress}%</Text></View><View style={styles.bar}><View style={[styles.fill,{width:progress+"%"}]}/></View><Text style={styles.muted}>{completed.length} of {total} titles completed</Text></View>
  </>}
  renderSectionHeader={({section})=><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>}
  renderItem={({item})=>item.kind==="entry"
   ?<Pressable onPress={()=>navigation.push("MangaDetail",{manga:item.entry.manga})} style={({pressed})=>[styles.item,pressed&&styles.pressed]}><View style={styles.info}><Text style={styles.itemTitle} numberOfLines={1}>{item.entry.manga.title}</Text><Text style={styles.muted}>{item.entry.currentChapter?"Last read: Chapter "+item.entry.currentChapter:"Not started"}</Text></View><Text style={styles.chevron}>›</Text></Pressable>
   :<ActivityCard event={item.event} entries={entries} navigation={navigation}/>}
  renderSectionFooter={({section})=>section.data.length===0?<Text style={styles.empty}>{section.empty}</Text>:null}
 />;
}
function formatDate(value:string){const date=new Date(value);return date.toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}
function Stat({label,value}:{label:string;value:string}){return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>}
function Section({title,entries,empty,navigation}:{title:string;entries:LibraryEntry[];empty:string;navigation:Props["navigation"]}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{entries.length===0?<Text style={styles.empty}>{empty}</Text>:entries.map(e=><Pressable key={e.manga.id} onPress={()=>navigation.push("MangaDetail",{manga:e.manga})} style={({pressed})=>[styles.item,pressed&&styles.pressed]}><View style={styles.info}><Text style={styles.itemTitle} numberOfLines={1}>{e.manga.title}</Text><Text style={styles.muted}>{e.currentChapter?"Last read: Chapter "+e.currentChapter:"Not started"}</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}</View>}

function ActivityCard({event,entries,navigation}:{event:ActivityEvent;entries:LibraryEntry[];navigation:Props["navigation"]}){const entry=entries.find(item=>item.manga.id===event.mangaId);const content=<View style={styles.activity}><View style={styles.dot}/><View style={styles.activityInfo}><Text style={styles.itemTitle}>{event.mangaTitle}</Text><Text style={styles.muted}>{event.detail}</Text><Text style={styles.date}>{formatDate(event.createdAt)}</Text></View>{entry?<Text style={styles.chevron}>›</Text>:null}</View>;return entry?<Pressable onPress={()=>navigation.push("MangaDetail",{manga:entry.manga})} style={({pressed})=>[pressed&&styles.pressed]}>{content}</Pressable>:content}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,paddingBottom:spacing.xxl},kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.5},title:{color:colors.text,fontSize:30,fontWeight:"800",marginTop:spacing.xs},subtitle:{color:colors.textSecondary,marginTop:spacing.sm,lineHeight:21},stats:{flexDirection:"row",gap:spacing.sm,marginTop:spacing.xl},stat:{flex:1,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},statValue:{color:colors.text,fontSize:22,fontWeight:"800"},muted:{color:colors.textSecondary,fontSize:12,marginTop:spacing.xs},progressCard:{marginTop:spacing.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},row:{flexDirection:"row",justifyContent:"space-between"},cardTitle:{color:colors.text,fontWeight:"800"},percent:{color:colors.primary,fontWeight:"800"},bar:{height:8,backgroundColor:colors.surfaceElevated,borderRadius:radius.pill,overflow:"hidden",marginTop:spacing.md},fill:{height:"100%",backgroundColor:colors.primary},section:{marginTop:spacing.xl},sectionHeader:{marginTop:spacing.xl,marginBottom:spacing.sm},sectionTitle:{color:colors.text,fontSize:19,fontWeight:"800",marginBottom:spacing.sm},empty:{color:colors.textMuted,paddingVertical:spacing.sm},item:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,flexDirection:"row",alignItems:"center"},info:{flex:1},itemTitle:{color:colors.text,fontWeight:"700",fontSize:15},activity:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,flexDirection:"row",gap:spacing.md},dot:{width:9,height:9,borderRadius:9,backgroundColor:colors.primary,marginTop:5},activityInfo:{flex:1},date:{color:colors.textMuted,fontSize:11,marginTop:3},chevron:{color:colors.textMuted,fontSize:24,lineHeight:24},pressed:{opacity:0.72}});
