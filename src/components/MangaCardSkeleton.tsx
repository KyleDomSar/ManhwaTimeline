import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export function MangaCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cover} />
      <View style={styles.info}>
        <View style={[styles.line, styles.titleLine]} />
        <View style={[styles.line, styles.shortLine]} />
        <View style={[styles.line, styles.mediumLine]} />
        <View style={[styles.line, styles.shortLine]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cover: {
    width: 92,
    height: 128,
    backgroundColor: colors.surfaceElevated,
  },
  info: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: {
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  titleLine: {
    width: "88%",
    height: 16,
  },
  mediumLine: {
    width: "68%",
  },
  shortLine: {
    width: "42%",
  },
});
