import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import { MangaCardSkeleton } from "./MangaCardSkeleton";

export function LibrarySkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.kicker} />
      <View style={styles.title} />
      <View style={styles.filters}>
        <View style={styles.chip} /><View style={styles.chip} /><View style={styles.chip} />
      </View>
      <MangaCardSkeleton />
      <MangaCardSkeleton />
    </View>
  );
}

const styles=StyleSheet.create({
  container:{padding:spacing.lg},
  kicker:{width:80,height:10,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated},
  title:{width:170,height:28,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.sm},
  filters:{flexDirection:"row",gap:spacing.sm,marginTop:spacing.md,marginBottom:spacing.md},
  chip:{width:72,height:32,borderRadius:radius.pill,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},
});
