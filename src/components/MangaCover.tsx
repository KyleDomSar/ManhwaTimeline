import React, { useEffect, useState } from "react";
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

type Props = {
  uri?: string;
  style: StyleProp<ImageStyle>;
  fallbackText?: string;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
};

export function MangaCover({ uri, style, fallbackText = "No Cover", resizeMode = "cover" }: Props) {
  const [loading, setLoading] = useState(Boolean(uri));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(Boolean(uri));
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return (
      <View style={[style, styles.placeholder]}>
        <Text style={styles.placeholderText}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      {loading ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={styles.loading} />
        </View>
      ) : null}
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoadStart={() => {
          setLoading(true);
          setFailed(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceElevated,
  },
});
