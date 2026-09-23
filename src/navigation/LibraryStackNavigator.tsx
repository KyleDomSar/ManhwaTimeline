import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LibraryScreen } from "../screens/LibraryScreen";
import { MangaDetailScreen } from "../screens/MangaDetailScreen";
import type { DiscoverStackParamList } from "./DiscoverStackNavigator";

const Stack=createNativeStackNavigator<DiscoverStackParamList>();

export function LibraryStackNavigator(){
 return <Stack.Navigator screenOptions={{headerShown:false}}>
  <Stack.Screen name="DiscoverHome" component={LibraryScreen}/>
  <Stack.Screen name="MangaDetail" component={MangaDetailScreen}/>
 </Stack.Navigator>;
}
