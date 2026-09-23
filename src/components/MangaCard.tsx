import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import type { Manga } from "../types/models";

type Props = {
  manga: Manga;
  onPress?: () => void;
};

export function MangaCard({ manga, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {manga.coverUrl ? (
        <Image source={{ uri: manga.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.placeholderText}>No Cover</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>{manga.title}</Text>
        <Text style={styles.status}>{manga.status}</Text>
        {manga.year ? <Text style={styles.meta}>{manga.year}</Text> : null}
      </View>
    </Pressable>
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
    marginBottom: spacing.md
  },
  pressed: {
    opacity: 0.75
  },
  cover: {
    width: 84,
    height: 116
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 11
  },
  info: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  status: {
    color: colors.primary,
    fontSize: 12,
    textTransform: "capitalize"
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12
  }
});