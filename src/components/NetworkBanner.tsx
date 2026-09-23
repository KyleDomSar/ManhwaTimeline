import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { colors, spacing } from "../constants/theme";

export function NetworkBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false);
    });

    NetInfo.fetch().then((state) => {
      setOffline(state.isConnected === false);
    });

    return unsubscribe;
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>You're offline</Text>
      <Text style={styles.message}>Cached content is still available. New data may be unavailable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "800",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
