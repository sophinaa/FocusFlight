import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { DesignTokens } from "@/constants/design-tokens";

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
  const [completedCount, setCompletedCount] = useState(0);
  const [abortedCount, setAbortedCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [recent, setRecent] = useState<Flight[]>([]);

  const computeStats = useCallback((flights: Flight[]) => {
    const validFlights = flights.filter(
      (f) =>
        (typeof f.durationMinutes === "number" ||
          typeof f.duration === "number") &&
        Number.isFinite((f.durationMinutes ?? f.duration) as number) &&
        (f.durationMinutes ?? f.duration)! >= 0 &&
        typeof f.startedAt === "string"
    );
    const minutes = validFlights.reduce((sum, f) => sum + (f.durationMinutes ?? f.duration ?? 0), 0);

    setTotalMinutes(minutes);
    setFlightCount(validFlights.length);
    setCompletedCount(validFlights.filter((f) => f.status === "completed").length);
    setAbortedCount(validFlights.filter((f) => f.status === "aborted").length);

    const days = new Set(
      validFlights.map((f) => {
        const date = new Date(f.startedAt);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().split("T")[0];
      })
    );
    days.delete(null as never);
    setStreakDays(days.size);

    const sorted = [...validFlights].sort((a, b) => {
      const aTime = new Date(a.endedAt || a.startedAt).getTime();
      const bTime = new Date(b.endedAt || b.startedAt).getTime();
      return bTime - aTime;
    });
    setRecent(sorted.slice(0, 5));
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

  const formattedTime = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }, [totalMinutes]);

  const formatFlightLine = (f: Flight) => {
    const minutes = f.durationMinutes ?? f.duration ?? 0;
    const status = f.status ?? "completed";
    return `${f.origin} → ${f.destination} · ${minutes} min · ${status}`;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Flight Log</Text>
        <Text style={styles.subtitle}>Track your total focus time and flights</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={DesignTokens.colors.textMain} />
      ) : flightCount === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.label}>No flights yet</Text>
          <Text style={styles.subtext}>Start a flight to see stats here.</Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Total Focus Time</Text>
            <Text style={styles.value}>{formattedTime}</Text>
            <Text style={styles.subtext}>Across all completed flights</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Flights</Text>
            <Text style={styles.value}>{flightCount}</Text>
            <Text style={styles.subtext}>
              {completedCount} completed · {abortedCount} aborted
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Streak</Text>
            <Text style={styles.value}>{streakDays} days</Text>
            <Text style={styles.subtext}>Days with at least one flight</Text>
          </View>

          {recent.length > 0 ? (
            <View style={styles.list}>
              <Text style={styles.label}>Recent Flights</Text>
              {recent.map((f, idx) => (
                <Text key={idx} style={styles.listItem}>
                  {formatFlightLine(f)}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: DesignTokens.spacing.screenPadding,
    backgroundColor: DesignTokens.colors.bgMain,
    gap: DesignTokens.spacing.gapMedium,
  },
  header: {
    gap: DesignTokens.spacing.gapSmall,
    marginBottom: DesignTokens.spacing.gapMedium,
  },
  title: {
    fontSize: DesignTokens.typography.h1.size,
    fontWeight: DesignTokens.typography.h1.weight as any,
    color: DesignTokens.colors.textMain,
    textAlign: "center",
  },
  subtitle: {
    color: DesignTokens.colors.textMuted,
    textAlign: "center",
  },
  card: {
    backgroundColor: DesignTokens.colors.bgCard,
    borderRadius: DesignTokens.radii.cardRadius,
    padding: DesignTokens.spacing.cardPadding,
    gap: DesignTokens.spacing.gapSmall,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: DesignTokens.typography.body.size,
    color: DesignTokens.colors.textMuted,
  },
  value: {
    fontSize: DesignTokens.typography.h2.size,
    fontWeight: DesignTokens.typography.h2.weight as any,
    color: DesignTokens.colors.textMain,
  },
  valueColumn: {
    alignItems: "flex-end",
  },
  emptyCard: {
    backgroundColor: DesignTokens.colors.bgCard,
    borderRadius: DesignTokens.radii.cardRadius,
    padding: DesignTokens.spacing.cardPadding,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  subtext: {
    color: DesignTokens.colors.textMuted,
    fontSize: DesignTokens.typography.body.size,
  },
  list: {
    marginTop: DesignTokens.spacing.gapMedium,
    gap: 6,
  },
  listItem: {
    color: DesignTokens.colors.textMuted,
    fontSize: DesignTokens.typography.body.size,
  },
});
