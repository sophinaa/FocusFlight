import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";

type Flight = {
  origin: string;
  destination: string;
  durationMinutes?: number;
  duration?: number; // legacy field support
  startedAt: string;
  endedAt: string;
  status: string;
};

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [flightCount, setFlightCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  const computeStats = useCallback((flights: Flight[]) => {
    const validFlights = flights.filter(
      (f) =>
        (typeof f.durationMinutes === "number" ||
          typeof f.duration === "number") &&
        Number.isFinite((f.durationMinutes ?? f.duration) as number) &&
        (f.durationMinutes ?? f.duration)! >= 0 &&
        typeof f.startedAt === "string"
    );
    const minutes = validFlights.reduce(
      (sum, f) => sum + (f.durationMinutes ?? f.duration ?? 0),
      0
    );
    const days = new Set(
      validFlights.map((f) => {
        const date = new Date(f.startedAt);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().split("T")[0];
      })
    );
    days.delete(null as never);

    setTotalMinutes(minutes);
    setFlightCount(validFlights.length);
    setStreakDays(days.size);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("flights");
      const parsed = stored ? JSON.parse(stored) : [];
      computeStats(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.warn("Failed to load stats", error);
      computeStats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [computeStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Flight Stats</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0a84ff" />
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Total minutes</Text>
            <Text style={styles.value}>{totalMinutes}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Flights</Text>
            <Text style={styles.value}>{flightCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Streak days</Text>
            <Text style={styles.value}>{streakDays}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
});
