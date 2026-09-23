import React,{useCallback,useEffect,useState} from "react";
import {Alert,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {colors,radius,spacing} from "../constants/theme";
import {getActivity,getLibrary,clearActivity,clearLibrary} from "../storage/library";
import type {LibraryEntry} from "../types/models";

export function SettingsScreen(){
 const[libraryCount,setLibraryCount]=useState(0);
 const[activityCount,setActivityCount]=useState(0);
 const load=useCallback(async()=>{const [library,activity]=await Promise.all([getLibrary(),getActivity(100)]);setLibraryCount(library.length);setActivityCount(activity.length)},[]);
 useEffect(()=>{void load()},[load]);
 const confirmClearLibrary=()=>Alert.alert("Clear Library","Remove all manhwa from your library?",[{text:"Cancel",style:"cancel"},{text:"Clear",style:"destructive",onPress:async()=>{await clearLibrary();await load()}}]);
 const confirmClearActivity=()=>Alert.alert("Clear Activity","Delete your recent activity history?",[{text:"Cancel",style:"cancel"},{text:"Clear",style:"destructive",onPress:async()=>{await clearActivity();await load()}}]);
 return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
  <Text style={styles.kicker}>SETTINGS</Text><Text style={styles.title}>ManhwaTimeline</Text><Text style={styles.subtitle}>Manage your app data and preferences.</Text>
  <Section title="Appearance"><Row label="Theme" value="Dark" /><Row label="Accent" value="Purple" /></Section>
  <Section title="Reading"><Row label="Chapter tracking" value="Enabled" /><Row label="Default status" value="Plan to Read" /></Section>
  <Section title="Data">
   <Row label="Library" value={String(libraryCount)+" title"+(libraryCount===1?"":"s")} />
   <Row label="Activity" value={String(activityCount)+" event"+(activityCount===1?"":"s")} />
   <Action label="Clear Activity" onPress={confirmClearActivity} />
  </Section>
  <Section title="Danger Zone"><Action label="Clear Library" danger onPress={confirmClearLibrary} /></Section>
  <Section title="About"><Row label="Version" value="1.0.0" /><Row label="Metadata" value="AniList" /><Row label="Chapter data" value="AniList / MangaBaka" /></Section>
 </ScrollView>;
}
function Section({title,children}:{title:string;children:React.ReactNode}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.card}>{children}</View></View>}
function Row({label,value}:{label:string;value:string}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>}
function Action({label,onPress,danger=false}:{label:string;onPress:()=>void;danger?:boolean}){return <Pressable onPress={onPress} style={({pressed})=>[styles.action,pressed&&styles.pressed]}><Text style={[styles.actionText,danger&&styles.danger]}>{label}</Text></Pressable>}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.xl,paddingBottom:spacing.xxl},kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.2},title:{color:colors.text,fontSize:30,fontWeight:"900",marginTop:spacing.xs},subtitle:{color:colors.textSecondary,fontSize:14,marginTop:spacing.sm,marginBottom:spacing.xl},section:{marginBottom:spacing.lg},sectionTitle:{color:colors.textSecondary,fontSize:12,fontWeight:"800",textTransform:"uppercase",letterSpacing:1,marginBottom:spacing.sm},card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,overflow:"hidden"},row:{minHeight:50,paddingHorizontal:spacing.lg,paddingVertical:spacing.md,borderBottomWidth:1,borderBottomColor:colors.border,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},label:{color:colors.text,fontSize:15,fontWeight:"600"},value:{color:colors.textSecondary,fontSize:14,maxWidth:"55%",textAlign:"right"},action:{minHeight:50,paddingHorizontal:spacing.lg,justifyContent:"center"},pressed:{backgroundColor:colors.surfaceElevated},actionText:{color:colors.text,fontSize:15,fontWeight:"600"},danger:{color:colors.danger}});
