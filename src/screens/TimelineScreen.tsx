import React,{useCallback,useEffect,useState} from "react";
import {Pressable,RefreshControl,ScrollView,StyleSheet,Text,View} from "react-native";
import {colors,radius,spacing} from "../constants/theme";
import {getLibrary,updateLibraryEntry} from "../storage/library";
import type {LibraryEntry} from "../types/models";

export function TimelineScreen(){
 const[entries,setEntries]=useState<LibraryEntry[]>([]);const[refreshing,setRefreshing]=useState(false);
 const load=useCallback(async()=>setEntries(await getLibrary()),[]);
 useEffect(()=>{void load()},[load]);
 const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false)};
 const reading=entries.filter(e=>e.readingStatus==="reading");
 const completed=entries.filter(e=>e.readingStatus==="completed");
 const plan=entries.filter(e=>e.readingStatus==="plan_to_read");
 const total=entries.length;
 const progress=total?Math.round((completed.length/total)*100):0;
 return <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary}/>}>
  <Text style={styles.kicker}>MANHWATIMELINE</Text><Text style={styles.title}>Your Timeline</Text><Text style={styles.subtitle}>Keep track of what you're reading and what's next.</Text>
  <View style={styles.stats}><Stat label="Library" value={String(total)}/><Stat label="Reading" value={String(reading.length)}/><Stat label="Done" value={String(completed.length)}/></View>
  <View style={styles.progressCard}><View style={styles.row}><Text style={styles.cardTitle}>Library progress</Text><Text style={styles.percent}>{progress}%</Text></View><View style={styles.bar}><View style={[styles.fill,{width:progress+"%"}]}/></View><Text style={styles.muted}>{completed.length} of {total} titles completed</Text></View>
  <Section title="Continue Reading" entries={reading} empty="No manhwa currently marked as Reading." onNext={async e=>{const n=e.currentChapter?String(Number(e.currentChapter)+1):"1";setEntries(await updateLibraryEntry(e.manga.id,{currentChapter:n}))}}/>
  <Section title="Plan to Read" entries={plan} empty="Nothing queued yet."/>
  {completed.length>0?<Section title="Recently Completed" entries={completed.slice(0,5)} empty=""/>:null}
 </ScrollView>;
}
function Stat({label,value}:{label:string;value:string}){return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>}
function Section({title,entries,empty,onNext}:{title:string;entries:LibraryEntry[];empty:string;onNext?:(e:LibraryEntry)=>Promise<void>}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{entries.length===0?<Text style={styles.empty}>{empty}</Text>:entries.map(e=><View key={e.manga.id} style={styles.item}><View style={styles.info}><Text style={styles.itemTitle} numberOfLines={1}>{e.manga.title}</Text><Text style={styles.muted}>{e.currentChapter?"Chapter "+e.currentChapter:"Not started"}</Text></View>{onNext?<Pressable onPress={()=>void onNext(e)} style={styles.next}><Text style={styles.nextText}>{e.currentChapter?"Next":"Start"}</Text></Pressable>:null}</View>)}</View>}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,paddingBottom:spacing.xxl},kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.5},title:{color:colors.text,fontSize:30,fontWeight:"800",marginTop:spacing.xs},subtitle:{color:colors.textSecondary,marginTop:spacing.sm,lineHeight:21},stats:{flexDirection:"row",gap:spacing.sm,marginTop:spacing.xl},stat:{flex:1,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},statValue:{color:colors.text,fontSize:22,fontWeight:"800"},muted:{color:colors.textSecondary,fontSize:12,marginTop:spacing.xs},progressCard:{marginTop:spacing.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},row:{flexDirection:"row",justifyContent:"space-between"},cardTitle:{color:colors.text,fontWeight:"800"},percent:{color:colors.primary,fontWeight:"800"},bar:{height:8,backgroundColor:colors.surfaceElevated,borderRadius:radius.pill,overflow:"hidden",marginTop:spacing.md},fill:{height:"100%",backgroundColor:colors.primary},section:{marginTop:spacing.xl},sectionTitle:{color:colors.text,fontSize:19,fontWeight:"800",marginBottom:spacing.sm},empty:{color:colors.textMuted,paddingVertical:spacing.sm},item:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,marginBottom:spacing.sm,flexDirection:"row",alignItems:"center"},info:{flex:1},itemTitle:{color:colors.text,fontWeight:"700",fontSize:15},next:{backgroundColor:colors.primarySoft,borderWidth:1,borderColor:colors.primary,borderRadius:radius.sm,paddingHorizontal:spacing.md,paddingVertical:spacing.sm},nextText:{color:colors.text,fontWeight:"700"}});
