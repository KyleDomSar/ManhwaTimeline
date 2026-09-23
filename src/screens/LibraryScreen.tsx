import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";

export function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Library</Text>
      <Text style={styles.subtitle}>Your tracked manhwa will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm
  }
});