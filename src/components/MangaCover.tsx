import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../constants/theme";

type Props = {
  uri?: string;
  style: StyleProp<ImageStyle>;
  fallbackText?: string;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
};

export function MangaCover({
  uri,
  style,
  fallbackText = "No Cover",
  resizeMode = "cover",
}: Props) {
  const [loading, setLoading] = useState(Boolean(uri));
  const [failed, setFailed] = useState(false);
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(Boolean(uri));
    setFailed(false);
  }, [uri]);

  useEffect(() => {
    if (!loading) {
      shimmer.stopAnimation();
      shimmer.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [loading, shimmer]);

  if (!uri || failed) {
    return (
      <View style={[style, styles.placeholder]}>
        <Text style={styles.placeholderText}>{fallbackText}</Text>
      </View>
    );
  }

  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 220],
  });

  return (
    <View style={[style, styles.container]}>
      {loading ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <View style={styles.loadingBase} />
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslateX }],
              },
            ]}
          />
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
  container: {
    overflow: "hidden",
  },
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: colors.surfaceElevated,
  },
  loadingBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceElevated,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ skewX: "-18deg" }],
  },
});
