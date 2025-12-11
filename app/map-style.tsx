import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

const options = [
  { key: "terra", title: "Terra", description: "Dark-globe night-style map" },
  { key: "monochrome", title: "Monochrome", description: "Grayscale map" },
  { key: "standard", title: "Standard", description: "Normal map" },
  { key: "satellite", title: "Satellite", description: "Satellite imagery" },
];

export default function MapStyleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Style</Text>
      <Text style={styles.subtitle}>Choose how the world map looks</Text>

      {options.map((option) => (
        <Pressable
          key={option.key}
          style={styles.option}
          onPress={() => {
            // Placeholder: hook this into settings later
            router.back();
          }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDesc}>{option.description}</Text>
          </View>
          <Text style={styles.optionAction}>Select</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 8,
  },
  option: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  optionDesc: {
    color: "#6b7280",
    marginTop: 4,
  },
  optionAction: {
    color: "#0a84ff",
    fontWeight: "700",
  },
});
