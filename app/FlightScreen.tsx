import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [ended, setEnded] = useState(totalSeconds === 0);
  const navigationEndedRef = useRef(false);

  useEffect(() => {
    // Reset timer if route params change.
    setRemaining(totalSeconds);
    setIsPaused(totalSeconds === 0);
    setEnded(totalSeconds === 0);
    navigationEndedRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (isPaused || ended) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, ended]);

  useEffect(() => {
    if (!ended || navigationEndedRef.current) return;
    navigationEndedRef.current = true;
    router.back();
  }, [ended]);

  const togglePause = () => {
    if (ended) return;
    setIsPaused((prev) => !prev);
  };

  const handleEnd = () => {
    navigationEndedRef.current = true;
    setEnded(true);
    router.back();
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
