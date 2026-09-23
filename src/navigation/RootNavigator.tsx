import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DiscoverStackNavigator } from "./DiscoverStackNavigator";
import { TimelineScreen } from "../screens/TimelineScreen";
import { LibraryStackNavigator } from "./LibraryStackNavigator";
import { SettingsScreen } from "../screens/SettingsScreen";
import { colors } from "../constants/theme";
type RootTabParamList={Timeline:undefined;Discover:undefined;Library:undefined;Settings:undefined};
const Tab=createBottomTabNavigator<RootTabParamList>();
export function RootNavigator(){return <Tab.Navigator initialRouteName="Timeline" screenOptions={{headerShown:false,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border,height:64,paddingBottom:8,paddingTop:8},tabBarActiveTintColor:colors.primary,tabBarInactiveTintColor:colors.textMuted}}><Tab.Screen name="Timeline" component={TimelineScreen}/><Tab.Screen name="Discover" component={DiscoverStackNavigator}/><Tab.Screen name="Library" component={LibraryStackNavigator}/><Tab.Screen name="Settings" component={SettingsScreen}/></Tab.Navigator>;}
