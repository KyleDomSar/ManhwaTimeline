import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { getPopularManga, searchManga } from "../api/mangadex";
import { MangaCard } from "../components/MangaCard";
import { colors, radius, spacing } from "../constants/theme";
import type { Manga } from "../types/models";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DiscoverStackParamList } from "../navigation/DiscoverStackNavigator";

type Props = NativeStackScreenProps<DiscoverStackParamList, "DiscoverHome">;

export function DiscoverScreen({ navigation }: Props) {
  const [manga,setManga]=useState<Manga[]>([]); const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async(search="",refresh=false)=>{setError(null);if(refresh)setRefreshing(true);else setLoading(true);try{setManga(search.trim()?await searchManga(search.trim()):await getPopularManga());}catch{setError("Unable to load manga. Check your connection and try again.");}finally{setLoading(false);setRefreshing(false);}},[]);
  useEffect(()=>{void load();},[load]);
  if(loading)return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/><Text style={styles.secondary}>Loading manga...</Text></View>;
  return <View style={styles.container}><View style={styles.header}><Text style={styles.kicker}>DISCOVER</Text><Text style={styles.heading}>{query.trim()?"Search results":"Find your next read"}</Text><TextInput value={query} onChangeText={setQuery} onSubmitEditing={()=>void load(query)} returnKeyType="search" placeholder="Search manhwa..." placeholderTextColor={colors.textMuted} style={styles.search}/></View>
    {error&&manga.length===0?<View style={styles.center}><Text style={styles.error}>{error}</Text></View>:<FlatList data={manga} keyExtractor={item=>item.id} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>void load(query,true)} tintColor={colors.primary}/>} renderItem={({item})=><MangaCard manga={item} onPress={()=>navigation.navigate("MangaDetail",{manga:item})}/>} ListEmptyComponent={<Text style={styles.secondary}>No manga found.</Text>}/>}</View>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},header:{paddingHorizontal:spacing.lg,paddingTop:spacing.xl,paddingBottom:spacing.md},kicker:{color:colors.primary,fontSize:12,fontWeight:"800",letterSpacing:1.5},heading:{color:colors.text,fontSize:28,fontWeight:"800",marginTop:spacing.xs,marginBottom:spacing.md},search:{height:48,backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,color:colors.text,paddingHorizontal:spacing.md},list:{padding:spacing.lg,paddingTop:spacing.sm},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:colors.background,padding:spacing.xl},secondary:{color:colors.textSecondary,marginTop:spacing.sm,textAlign:"center"},error:{color:colors.danger,textAlign:"center"}});
