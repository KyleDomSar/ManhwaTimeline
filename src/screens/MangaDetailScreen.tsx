import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "../constants/theme";
import type { DiscoverStackParamList } from "../navigation/DiscoverStackNavigator";

type Props = NativeStackScreenProps<DiscoverStackParamList, "MangaDetail">;

export function MangaDetailScreen({ route, navigation }: Props) {
  const { manga } = route.params;
  const [tracked, setTracked] = useState(false);

  return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹ Back</Text></Pressable>
    <View style={styles.hero}>
      {manga.coverUrl ? <Image source={{ uri: manga.coverUrl }} style={styles.cover}/> : <View style={[styles.cover,styles.placeholder]}><Text style={styles.muted}>No Cover</Text></View>}
      <View style={styles.heroInfo}>
        <Text style={styles.title}>{manga.title}</Text>
        <Text style={styles.status}>{manga.status}</Text>
        {manga.year ? <Text style={styles.muted}>{manga.year}</Text> : null}
      </View>
    </View>
    <Pressable onPress={() => setTracked(v => !v)} style={[styles.trackButton, tracked && styles.trackedButton]}>
      <Text style={styles.trackText}>{tracked ? "Added to Library" : "Add to Library"}</Text>
    </Pressable>
    <Text style={styles.sectionTitle}>About</Text>
    <Text style={styles.description}>{manga.description || "No description available."}</Text>
    {manga.authors.length ? <><Text style={styles.sectionTitle}>Creators</Text><Text style={styles.description}>{manga.authors.join(", ")}</Text></> : null}
    {manga.lastChapter ? <View style={styles.infoRow}><Text style={styles.label}>Latest chapter</Text><Text style={styles.value}>{manga.lastChapter}</Text></View> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,paddingBottom:spacing.xxl},
  back:{marginBottom:spacing.lg},backText:{color:colors.primary,fontSize:16,fontWeight:"700"},
  hero:{flexDirection:"row",gap:spacing.lg},cover:{width:140,height:200,borderRadius:radius.md},
  placeholder:{backgroundColor:colors.surfaceElevated,alignItems:"center",justifyContent:"center"},
  heroInfo:{flex:1,justifyContent:"center",gap:spacing.sm},title:{color:colors.text,fontSize:24,fontWeight:"800"},
  status:{color:colors.primary,textTransform:"capitalize",fontWeight:"700"},muted:{color:colors.textSecondary},
  trackButton:{marginTop:spacing.xl,backgroundColor:colors.primary,padding:spacing.md,borderRadius:radius.md,alignItems:"center"},
  trackedButton:{backgroundColor:colors.surfaceElevated,borderWidth:1,borderColor:colors.primary},trackText:{color:colors.text,fontWeight:"800"},
  sectionTitle:{color:colors.text,fontSize:18,fontWeight:"800",marginTop:spacing.xl,marginBottom:spacing.sm},
  description:{color:colors.textSecondary,fontSize:14,lineHeight:22},
  infoRow:{marginTop:spacing.xl,backgroundColor:colors.surface,padding:spacing.md,borderRadius:radius.md,flexDirection:"row",justifyContent:"space-between"},
  label:{color:colors.textSecondary},value:{color:colors.text,fontWeight:"700"}
});