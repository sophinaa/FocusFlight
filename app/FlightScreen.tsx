import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function FlightScreen() {
  const params = useLocalSearchParams<{
    origin?: string;
    destination?: string;
    duration?: string;
  }>();

  const origin = params.origin || "Origin";
  const destination = params.destination || "Destination";
  const duration = params.duration || "0";

  return (
    <View style={styles.container}>
      <Text style={styles.text}>In Flight</Text>
      <Text style={styles.route}>
        {origin} → {destination} · {duration} min
      </Text>
      <Text style={styles.subtext}>Timer goes here</Text>

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.secondary]}>
          <Text style={styles.secondaryText}>Pause</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>End Flight</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
  route: {
    fontSize: 16,
    color: "#333",
  },
  subtext: {
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    backgroundColor: "#0a84ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "600",
  },
});
