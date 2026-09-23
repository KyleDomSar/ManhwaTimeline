import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DiscoverScreen } from "../screens/DiscoverScreen";
import { MangaDetailScreen } from "../screens/MangaDetailScreen";
import type { Manga } from "../types/models";

export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  MangaDetail: { manga: Manga };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export function DiscoverStackNavigator() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DiscoverHome" component={DiscoverScreen} />
    <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
  </Stack.Navigator>;
}