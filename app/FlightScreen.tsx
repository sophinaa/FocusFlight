/**
 * Flight model (persisted to AsyncStorage under "flights"):
 * - origin: string (departure code/name)
 * - destination: string (arrival code/name)
 * - durationMinutes: number (minutes planned)
 * - startedAt: ISO timestamp (flight start)
 * - endedAt: ISO timestamp (flight end)
 * - status: "completed" | "aborted" (timer finished vs user ended early)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const durationMinutes = useMemo(() => {
    const parsed = Number(params.duration);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }, [params.duration]);
  const totalSeconds = Math.max(0, Math.round(durationMinutes * 60));

  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(totalSeconds === 0);
  const [ended, setEnded] = useState(false);
  const navigationEndedRef = useRef(false);
  const savingRef = useRef(false);
  const startedAtRef = useRef<string>(new Date().toISOString());

  const completeFlight = useCallback(
    async (status: "completed" | "aborted") => {
      if (savingRef.current) return;
      savingRef.current = true;
      setEnded(true);
      setIsPaused(true);

      const endedAt = new Date().toISOString();
      const flight = {
        origin,
        destination,
        durationMinutes,
        startedAt: startedAtRef.current,
        endedAt,
        status,
      };

      try {
        const existing = await AsyncStorage.getItem("flights");
        const parsed = existing ? JSON.parse(existing) : [];
        const updated = Array.isArray(parsed) ? parsed : [];
        updated.push(flight);
        await AsyncStorage.setItem("flights", JSON.stringify(updated));
      } catch (error) {
        console.warn("Failed to save flight", error);
      }

      if (navigationEndedRef.current) return;
      navigationEndedRef.current = true;
      router.replace("/");
    },
    [destination, durationMinutes, origin]
  );

  useEffect(() => {
    // Reset timer if route params change.
    setRemaining(totalSeconds);
    setIsPaused(totalSeconds === 0);
    setEnded(false);
    navigationEndedRef.current = false;
    savingRef.current = false;
    startedAtRef.current = new Date().toISOString();
  }, [totalSeconds]);

  useEffect(() => {
    if (totalSeconds === 0 && !savingRef.current) {
      completeFlight("completed");
    }
  }, [completeFlight, totalSeconds]);

  useEffect(() => {
    if (isPaused || ended || totalSeconds === 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeFlight("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [completeFlight, ended, isPaused, totalSeconds]);

  const togglePause = () => {
    if (ended) return;
    setIsPaused((prev) => !prev);
  };

  const handleEnd = () => {
    completeFlight("aborted");
  };

  const progress =
    totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - remaining / totalSeconds)) : 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>In Flight</Text>
      <Text style={styles.route}>
        {origin} → {destination} · {durationMinutes} min
      </Text>
      <Text style={styles.subtext}>Duration: {durationMinutes} minutes</Text>
      <Text style={styles.timer}>{formatTime(remaining)}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.secondary]} onPress={togglePause} disabled={ended}>
          <Text style={styles.secondaryText}>{isPaused ? "Resume" : "Pause"}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleEnd}>
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
  timer: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
  },
  subtext: {
    color: "#555",
    fontSize: 14,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0a84ff",
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
