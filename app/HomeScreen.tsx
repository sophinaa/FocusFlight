import React from "react";
import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTakeOff = () => {
    const trimmedOrigin = origin.trim();
    const trimmedDestination = destination.trim();
    const durationNumber = Number(duration);

    if (!trimmedOrigin) {
      setError("Enter an origin.");
      return;
    }
    if (!trimmedDestination) {
      setError("Enter a destination.");
      return;
    }
    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      setError("Duration must be greater than 0 minutes.");
      return;
    }

    setError(null);
    router.push({
      pathname: "/FlightScreen",
      params: {
        origin: trimmedOrigin,
        destination: trimmedDestination,
        duration: durationNumber.toString(),
      },
    });
  };

  const handleViewStats = () => {
    router.push("/StatsScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Flight</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Origin</Text>
        <TextInput
          placeholder="e.g. LHR"
          value={origin}
          onChangeText={setOrigin}
          style={styles.input}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          placeholder="e.g. DXB"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          placeholder="120"
          value={duration}
          onChangeText={setDuration}
          style={styles.input}
          keyboardType="number-pad"
        />
      </View>

      <Pressable style={styles.button} onPress={handleTakeOff}>
        <Text style={styles.buttonText}>Take Off</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.button, styles.secondary]} onPress={handleViewStats}>
        <Text style={styles.secondaryText}>View Stats</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0a84ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
  },
  secondaryText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
