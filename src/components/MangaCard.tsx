import React from "react";
import {Pressable,StyleSheet,Text,View} from "react-native";
import {colors,radius,spacing} from "../constants/theme";
import {MangaCover} from "./MangaCover";
import type {Manga} from "../types/models";
type Props={manga:Manga;onPress?:()=>void};
export function MangaCard({manga,onPress}:Props){
 return <Pressable onPress={onPress} style={({pressed})=>[styles.card,pressed&&styles.pressed]}>
  <MangaCover uri={manga.coverUrl} style={styles.cover}/>
  <View style={styles.info}><Text numberOfLines={2} style={styles.title}>{manga.title}</Text>
   <View style={styles.badges}><Text style={styles.status}>{manga.status}</Text>{manga.year?<Text style={styles.meta}>{manga.year}</Text>:null}</View>
   {manga.genres.length?<Text numberOfLines={1} style={styles.genres}>{manga.genres.slice(0,3).join("  •  ")}</Text>:null}
   {manga.averageScore!==undefined?<Text style={styles.rating}>{(manga.averageScore/10).toFixed(1)}/10 rating</Text>:null}{manga.followedCount!==undefined?<Text style={styles.followers}>{manga.followedCount.toLocaleString()} favorites</Text>:null}
   {manga.lastChapter?<Text style={styles.chapter}>Latest chapter {manga.lastChapter}</Text>:null}
  </View>
 </Pressable>;
}
const styles=StyleSheet.create({card:{flexDirection:"row",backgroundColor:colors.surface,borderRadius:radius.md,overflow:"hidden",borderWidth:1,borderColor:colors.border,marginBottom:spacing.md},pressed:{opacity:.75},cover:{width:92,height:128},info:{flex:1,padding:spacing.md,gap:spacing.sm},title:{color:colors.text,fontSize:17,fontWeight:"800"},badges:{flexDirection:"row",alignItems:"center",gap:spacing.sm},status:{color:colors.primary,fontSize:12,textTransform:"capitalize",fontWeight:"700"},meta:{color:colors.textSecondary,fontSize:12},genres:{color:colors.textSecondary,fontSize:12},rating:{color:colors.warning,fontSize:11,fontWeight:"700"},followers:{color:colors.textMuted,fontSize:11},chapter:{color:colors.textMuted,fontSize:11}});
