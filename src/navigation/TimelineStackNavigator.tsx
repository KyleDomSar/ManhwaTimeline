import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TimelineScreen } from "../screens/TimelineScreen";
import { MangaDetailScreen } from "../screens/MangaDetailScreen";
import type { Manga } from "../types/models";

export type TimelineStackParamList = {
  TimelineHome: undefined;
  MangaDetail: { manga: Manga };
};

const Stack = createNativeStackNavigator<TimelineStackParamList>();

export function TimelineStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimelineHome" component={TimelineScreen} />
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
    </Stack.Navigator>
  );
}
