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
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { DesignTokens } from "@/constants/design-tokens";

export default function FlightScreen() {
  const params = useLocalSearchParams<{
    origin?: string;
    destination?: string;
    durationMinutes?: string;
    // legacy fallback
    duration?: string;
  }>();

  const origin = params.origin || "Origin";
  const destination = params.destination || "Destination";
  const durationMinutes = useMemo(() => {
    const raw = params.durationMinutes ?? params.duration;
    const parsed = Number(raw);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }, [params.duration, params.durationMinutes]);
  const totalSeconds = Math.max(0, Math.round(durationMinutes * 60));

  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(totalSeconds === 0);
  const [ended, setEnded] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<string | null>(null);
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

      console.log("Flight finished:", flight);
      setCompletionMessage(
        status === "completed" ? "Flight complete! Returning home..." : "Flight aborted. Returning home..."
      );

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

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem("mapStyle");
          setMapStyle(stored || null);
        } catch (err) {
          console.warn("Failed to load map style", err);
        }
      })();
    }, [])
  );

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

  const elapsedSeconds = totalSeconds - remaining;
  const progress =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, elapsedSeconds / totalSeconds))
      : 1;

  const accent = useMemo(() => {
    switch ((mapStyle || "Standard").toLowerCase()) {
      case "terra":
        return "#14b8a6";
      case "monochrome":
        return "#a3e635";
      case "satellite":
        return "#16a34a";
      case "standard":
      default:
        return "#3b82f6";
    }
  }, [mapStyle]);

  const mapBg = useMemo(() => {
    switch ((mapStyle || "Standard").toLowerCase()) {
      case "terra":
        return ["#050816", "#1a1038"];
      case "monochrome":
        return ["#0f1115", "#1a1c22"];
      case "satellite":
        return ["#1a2a1a", "#0f1a12"];
      case "standard":
      default:
        return ["#0d253f", "#123b4a"];
    }
  }, [mapStyle]);

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
      <View
        style={[
          styles.mapArea,
          {
            backgroundColor: mapBg[0],
            borderColor: "#1f2937",
          },
        ]}>
        <Text style={styles.mapText}>Map – {mapStyle || "Standard"}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.route}>
          {origin} ✈ {destination}
        </Text>
        <Text style={styles.subtext}>Focus flight in progress</Text>
        <Text style={styles.timer}>{formatTime(remaining)}</Text>
        <Text style={styles.subtext}>Total: {durationMinutes} min</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: accent }]}
          onPress={togglePause}
          disabled={ended}>
          <Text style={styles.primaryText}>{isPaused ? "Resume" : "Pause"}</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, { borderColor: DesignTokens.colors.danger }]} onPress={handleEnd}>
          <Text style={[styles.secondaryText, { color: DesignTokens.colors.danger }]}>End Flight</Text>
        </Pressable>
        {completionMessage ? <Text style={styles.message}>{completionMessage}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignTokens.spacing.screenPadding,
    backgroundColor: DesignTokens.colors.bgMain,
    gap: DesignTokens.spacing.gapLarge,
  },
  mapArea: {
    height: "40%",
    borderRadius: DesignTokens.radii.cardRadius,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    color: DesignTokens.colors.textMain,
    fontWeight: "700",
  },
  info: {
    alignItems: "center",
    gap: DesignTokens.spacing.gapSmall,
  },
  route: {
    fontSize: DesignTokens.typography.h2.size,
    fontWeight: DesignTokens.typography.h2.weight as any,
    color: DesignTokens.colors.textMain,
    textAlign: "center",
  },
  timer: {
    fontSize: DesignTokens.typography.timer.size,
    fontWeight: DesignTokens.typography.timer.weight as any,
    letterSpacing: 1,
    color: DesignTokens.colors.textMain,
  },
  subtext: {
    color: DesignTokens.colors.textMuted,
    fontSize: DesignTokens.typography.body.size,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#1f2937",
    borderRadius: DesignTokens.radii.buttonRadius,
    overflow: "hidden",
    marginTop: DesignTokens.spacing.gapSmall,
  },
  progressFill: {
    height: "100%",
  },
  controls: {
    gap: DesignTokens.spacing.gapMedium,
    marginTop: DesignTokens.spacing.gapMedium,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: DesignTokens.radii.buttonRadius,
    alignItems: "center",
  },
  primaryText: {
    color: DesignTokens.colors.textMain,
    fontSize: DesignTokens.typography.h2.size,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: DesignTokens.radii.buttonRadius,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "700",
    color: DesignTokens.colors.textMain,
  },
  message: {
    marginTop: 4,
    color: DesignTokens.colors.textMain,
    textAlign: "center",
  },
});
