import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme, Theme } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { NetworkBanner } from "./src/components/NetworkBanner";

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B0D10",
    card: "#11151A",
    text: "#F5F7FA",
    border: "#20262D",
    primary: "#8B5CF6"
  }
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <NetworkBanner />
      <RootNavigator />
    </NavigationContainer>
  );
}