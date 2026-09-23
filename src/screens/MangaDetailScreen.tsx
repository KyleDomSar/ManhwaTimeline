import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "../constants/theme";
import type { DiscoverStackParamList } from "../navigation/DiscoverStackNavigator";
import type { ReadingStatus } from "../types/models";
import { addToLibrary, getLibrary, removeFromLibrary, updateLibraryEntry } from "../storage/library";

type Props = NativeStackScreenProps<DiscoverStackParamList, "MangaDetail">;

const statuses: Array<{ value: ReadingStatus; label: string }> = [
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_read", label: "Plan to Read" },
  { value: "dropped", label: "Dropped" },
];

export function MangaDetailScreen({ route, navigation }: Props) {
  const { manga } = route.params;
  const [tracked, setTracked] = useState(false);
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>("plan_to_read");
  const [loading, setLoading] = useState(true);

  const syncLibrary = useCallback(async () => {
    const entries = await getLibrary();
    const entry = entries.find((item) => item.manga.id === manga.id);
    setTracked(Boolean(entry));
    setReadingStatus(entry?.readingStatus ?? "plan_to_read");
    setLoading(false);
  }, [manga.id]);

  useEffect(() => {
    void syncLibrary();
  }, [syncLibrary]);

  const toggleLibrary = async () => {
    if (tracked) {
      await removeFromLibrary(manga.id);
      setTracked(false);
      setReadingStatus("plan_to_read");
      return;
    }

    await addToLibrary(manga, "plan_to_read");
    setTracked(true);
    setReadingStatus("plan_to_read");
  };

  const changeStatus = async (status: ReadingStatus) => {
    if (!tracked) {
      await addToLibrary(manga, status);
      setTracked(true);
    } else {
      await updateLibraryEntry(manga.id, { readingStatus: status });
    }
    setReadingStatus(status);
  };

  return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Pressable onPress={() => navigation.goBack()} style={styles.back}>
      <Text style={styles.backText}>‹ Back</Text>
    </Pressable>

    <View style={styles.hero}>
      {manga.coverUrl ? <Image source={{ uri: manga.coverUrl }} style={styles.cover}/> : <View style={[styles.cover, styles.placeholder]}><Text style={styles.muted}>No Cover</Text></View>}
      <View style={styles.heroInfo}>
        <Text style={styles.title}>{manga.title}</Text>
        <Text style={styles.status}>{manga.status}</Text>
        {manga.year ? <Text style={styles.muted}>{manga.year}</Text> : null}
        {manga.followedCount !== undefined ? <Text style={styles.muted}>{manga.followedCount.toLocaleString()} followers</Text> : null}
      </View>
    </View>

    <Pressable disabled={loading} onPress={() => void toggleLibrary()} style={[styles.trackButton, tracked && styles.trackedButton]}>
      <Text style={styles.trackText}>{tracked ? "Remove from Library" : "Add to Library"}</Text>
    </Pressable>

    <Text style={styles.sectionTitle}>Reading Status</Text>
    <View style={styles.statusGrid}>
      {statuses.map((item) => (
        <Pressable
          key={item.value}
          disabled={loading}
          onPress={() => void changeStatus(item.value)}
          style={[styles.statusChip, tracked && readingStatus === item.value && styles.activeChip]}
        >
          <Text style={[styles.statusChipText, tracked && readingStatus === item.value && styles.activeChipText]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>

    <Text style={styles.sectionTitle}>About</Text>
    <Text style={styles.description}>{manga.description || "No description available."}</Text>

    {manga.genres.length ? <>
      <Text style={styles.sectionTitle}>Genres</Text>
      <View style={styles.genreWrap}>
        {manga.genres.map((genre) => <View key={genre} style={styles.genreChip}><Text style={styles.genreText}>{genre}</Text></View>)}
      </View>
    </> : null}

    {manga.authors.length || manga.artists.length ? <>
      <Text style={styles.sectionTitle}>Creators</Text>
      {manga.authors.length ? <Text style={styles.description}>Author: {manga.authors.join(", ")}</Text> : null}
      {manga.artists.length ? <Text style={[styles.description, styles.creatorSpacing]}>Artist: {manga.artists.join(", ")}</Text> : null}
    </> : null}

    {manga.lastChapter ? <View style={styles.infoRow}><Text style={styles.label}>Latest chapter</Text><Text style={styles.value}>{manga.lastChapter}</Text></View> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.background},
  content:{padding:spacing.lg,paddingBottom:spacing.xxl},
  back:{marginBottom:spacing.lg},
  backText:{color:colors.primary,fontSize:16,fontWeight:"700"},
  hero:{flexDirection:"row",gap:spacing.lg},
  cover:{width:140,height:200,borderRadius:radius.md},
  placeholder:{backgroundColor:colors.surfaceElevated,alignItems:"center",justifyContent:"center"},
  heroInfo:{flex:1,justifyContent:"center",gap:spacing.sm},
  title:{color:colors.text,fontSize:24,fontWeight:"800"},
  status:{color:colors.primary,textTransform:"capitalize",fontWeight:"700"},
  muted:{color:colors.textSecondary},
  trackButton:{marginTop:spacing.xl,backgroundColor:colors.primary,padding:spacing.md,borderRadius:radius.md,alignItems:"center"},
  trackedButton:{backgroundColor:colors.surfaceElevated,borderWidth:1,borderColor:colors.primary},
  trackText:{color:colors.text,fontWeight:"800"},
  sectionTitle:{color:colors.text,fontSize:18,fontWeight:"800",marginTop:spacing.xl,marginBottom:spacing.sm},
  description:{color:colors.textSecondary,fontSize:14,lineHeight:22},
  creatorSpacing:{marginTop:spacing.xs},
  statusGrid:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},
  statusChip:{paddingVertical:spacing.sm,paddingHorizontal:spacing.md,borderRadius:radius.full,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},
  activeChip:{backgroundColor:colors.primarySoft,borderColor:colors.primary},
  statusChipText:{color:colors.textSecondary,fontSize:13,fontWeight:"700"},
  activeChipText:{color:colors.text},
  genreWrap:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},
  genreChip:{backgroundColor:colors.surfaceElevated,borderRadius:radius.full,paddingVertical:spacing.xs,paddingHorizontal:spacing.sm},
  genreText:{color:colors.textSecondary,fontSize:12,fontWeight:"600"},
  infoRow:{marginTop:spacing.xl,backgroundColor:colors.surface,padding:spacing.md,borderRadius:radius.md,flexDirection:"row",justifyContent:"space-between"},
  label:{color:colors.textSecondary},
  value:{color:colors.text,fontWeight:"700"}
});
