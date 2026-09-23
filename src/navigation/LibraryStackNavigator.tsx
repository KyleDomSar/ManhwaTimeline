import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LibraryScreen } from "../screens/LibraryScreen";
import { MangaDetailScreen } from "../screens/MangaDetailScreen";
import type { Manga } from "../types/models";

export type LibraryStackParamList = {
  LibraryHome: undefined;
  MangaDetail: { manga: Manga };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} />
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
    </Stack.Navigator>
  );
}
