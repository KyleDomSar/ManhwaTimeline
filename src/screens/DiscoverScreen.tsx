import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { getPopularManga } from "../api/mangadex";
import { MangaCard } from "../components/MangaCard";
import { colors, spacing } from "../constants/theme";
import type { Manga } from "../types/models";

export function DiscoverScreen() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    setError(null);
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setManga(await getPopularManga());
    } catch {
      setError("Unable to load manga right now. Check your internet connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.secondary}>Loading manga...</Text>
      </View>
    );
  }

  if (error && manga.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>DISCOVER</Text>
        <Text style={styles.heading}>Find your next read</Text>
      </View>
      <FlatList
        data={manga}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />
        }
        renderItem={({ item }) => <MangaCard manga={item} />}
        ListEmptyComponent={<Text style={styles.secondary}>No manga found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl
  },
  secondary: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center"
  },
  error: {
    color: colors.danger,
    textAlign: "center"
  }
});