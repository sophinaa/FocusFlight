import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DesignTokens } from "@/constants/design-tokens";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Map style and preferences coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignTokens.spacing.screenPadding,
    backgroundColor: DesignTokens.colors.bgMain,
    gap: DesignTokens.spacing.gapSmall,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: DesignTokens.colors.textMain,
    fontSize: DesignTokens.typography.h1.size,
    fontWeight: DesignTokens.typography.h1.weight as any,
  },
  subtitle: {
    color: DesignTokens.colors.textMuted,
    fontSize: DesignTokens.typography.body.size,
    textAlign: "center",
  },
});
