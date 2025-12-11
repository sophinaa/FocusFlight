import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { DesignTokens } from "@/constants/design-tokens";

export default function HomeScreen() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<string | null>(null);
  const originRef = useRef<TextInput | null>(null);

  const loadMapStyle = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("mapStyle");
      setMapStyle(stored || null);
    } catch (err) {
      console.warn("Failed to load map style", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMapStyle();
    }, [loadMapStyle])
  );

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
        durationMinutes: durationNumber.toString(),
      },
    });
  };

  const handleViewStats = () => {
    router.push("/StatsScreen");
  };

  const handleMapStyle = () => {
    router.push("/map-style");
  };

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

  const screenBg = useMemo(() => {
    switch ((mapStyle || "Standard").toLowerCase()) {
      case "terra":
        return "#050816";
      case "monochrome":
        return "#0b0d10";
      case "satellite":
        return "#0c140f";
      case "standard":
      default:
        return "#0c1522";
    }
  }, [mapStyle]);

  const globeStyle = useMemo(() => {
    switch ((mapStyle || "Standard").toLowerCase()) {
      case "terra":
        return { backgroundColor: "#0b1220", shadowColor: "#14b8a6", shadowOpacity: 0.35 };
      case "monochrome":
        return { backgroundColor: "#0f1115", shadowColor: "#e5e7eb", shadowOpacity: 0.25 };
      case "satellite":
        return { backgroundColor: "#0f1a12", shadowColor: "#16a34a", shadowOpacity: 0.35 };
      case "standard":
      default:
        return { backgroundColor: "#0d253f", shadowColor: "#3b82f6", shadowOpacity: 0.3 };
    }
  }, [mapStyle]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const navCards = [
    { title: "History", action: handleViewStats },
    { title: "Trends", action: handleViewStats },
    { title: "Settings", action: handleMapStyle },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: screenBg }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.globe, globeStyle]} />
          <View style={styles.heroOverlay}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.city}>Glasgow</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>✈</Text>
                <Text style={styles.pillText}>Next flight</Text>
              </View>
            </View>
            <View style={styles.heroBottom}>
              <Pressable
                style={[styles.startButton, { backgroundColor: DesignTokens.colors.textMain }]}
                onPress={() => originRef.current?.focus()}>
                <Text style={[styles.startButtonText, { color: DesignTokens.colors.bgMain }]}>Start Journey</Text>
              </Pressable>

              <View style={styles.navStack}>
                {navCards.map((card, idx) => (
                  <Pressable
                    key={card.title}
                    onPress={card.action}
                    style={[
                      styles.navCard,
                      { backgroundColor: `rgba(255,255,255,${0.08 - idx * 0.02})` },
                    ]}>
                    <Text style={styles.navCardText}>{card.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        <Pressable style={styles.card} onPress={handleMapStyle}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>Map Style</Text>
            <View style={[styles.badge, { backgroundColor: accent + "22", borderColor: accent }]}>
              <Text style={[styles.badgeText, { color: accent }]}>{mapStyle || "Standard"}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>Choose how the world map looks</Text>
          <View style={styles.thumbsRow}>
            {["Terra", "Monochrome", "Standard", "Satellite"].map((label) => (
              <View key={label} style={styles.thumb}>
                <Text style={styles.thumbText}>{label.slice(0, 3)}</Text>
                <Text style={styles.thumbLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flight Planner</Text>
          <View style={styles.field}>
            <Text style={styles.label}>From</Text>
            <TextInput
              ref={originRef}
              placeholder="e.g. LHR"
              placeholderTextColor={DesignTokens.colors.textMuted}
              value={origin}
              onChangeText={setOrigin}
              style={styles.input}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>To</Text>
            <TextInput
              placeholder="e.g. DXB"
              placeholderTextColor={DesignTokens.colors.textMuted}
              value={destination}
              onChangeText={setDestination}
              style={styles.input}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              placeholder="120"
              placeholderTextColor={DesignTokens.colors.textMuted}
              value={duration}
              onChangeText={setDuration}
              style={styles.input}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.button, { backgroundColor: accent }]} onPress={handleTakeOff}>
          <Text style={styles.buttonText}>Take Off</Text>
        </Pressable>
        <Text style={styles.helper}>You’ll see the timer and map on the next screen.</Text>

        <Pressable style={styles.footerLink} onPress={handleViewStats}>
          <Text style={styles.footerText}>View Flight Log</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgMain,
  },
  heroBottom: {
    alignItems: "flex-start",
    gap: DesignTokens.spacing.gapMedium,
    marginBottom: DesignTokens.spacing.gapSmall,
  },
  container: {
    flexGrow: 1,
    padding: DesignTokens.spacing.screenPadding,
    gap: DesignTokens.spacing.gapLarge,
  },
  hero: {
    height: 420,
    borderRadius: DesignTokens.radii.cardRadius * 1.2,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "transparent",
  },
  globe: {
    position: "absolute",
    width: "90%",
    aspectRatio: 1,
    borderRadius: 9999,
    right: "-10%",
    top: "4%",
    opacity: 0.75,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  heroOverlay: {
    flex: 1,
    padding: DesignTokens.spacing.cardPadding,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: DesignTokens.colors.textMuted,
    fontSize: DesignTokens.typography.body.size,
    textShadowColor: "#000",
    textShadowRadius: 8,
  },
  city: {
    color: DesignTokens.colors.textMain,
    fontSize: DesignTokens.typography.h1.size,
    fontWeight: DesignTokens.typography.h1.weight as any,
    textShadowColor: "#000",
    textShadowRadius: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: DesignTokens.radii.buttonRadius,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillIcon: {
    color: DesignTokens.colors.textMain,
  },
  pillText: {
    color: DesignTokens.colors.textMain,
    fontWeight: "700",
    fontSize: DesignTokens.typography.label.size,
  },
  startButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: DesignTokens.radii.buttonRadius,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  startButtonText: {
    fontWeight: "700",
    fontSize: DesignTokens.typography.h2.size,
  },
  navStack: {
    marginTop: DesignTokens.spacing.gapMedium,
    gap: 8,
    position: "relative",
  },
  navCard: {
    padding: 14,
    borderRadius: DesignTokens.radii.cardRadius,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  navCardText: {
    color: DesignTokens.colors.textMain,
    fontWeight: "700",
  },
  field: {
    gap: DesignTokens.spacing.gapSmall,
    marginTop: DesignTokens.spacing.gapMedium,
  },
  label: {
    fontSize: DesignTokens.typography.label.size,
    fontWeight: DesignTokens.typography.label.weight as any,
    color: DesignTokens.colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#0b1220",
    color: DesignTokens.colors.textMain,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: DesignTokens.typography.body.size,
  },
  button: {
    paddingVertical: 16,
    borderRadius: DesignTokens.radii.buttonRadius,
    alignItems: "center",
    marginTop: DesignTokens.spacing.gapMedium,
  },
  buttonText: {
    color: DesignTokens.colors.textMain,
    fontSize: DesignTokens.typography.h2.size,
    fontWeight: "700",
  },
  error: {
    color: DesignTokens.colors.danger,
    marginTop: 8,
    textAlign: "center",
    fontSize: DesignTokens.typography.body.size,
    fontWeight: "700",
  },
  card: {
    backgroundColor: DesignTokens.colors.bgCard,
    borderRadius: DesignTokens.radii.cardRadius,
    padding: DesignTokens.spacing.cardPadding,
    gap: DesignTokens.spacing.gapSmall,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardTitle: {
    fontSize: DesignTokens.typography.h2.size,
    fontWeight: DesignTokens.typography.h2.weight as any,
    color: DesignTokens.colors.textMain,
  },
  cardSubtitle: {
    color: DesignTokens.colors.textMuted,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DesignTokens.radii.buttonRadius,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: "700",
  },
  thumbsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: DesignTokens.spacing.gapSmall,
  },
  thumb: {
    width: "23%",
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    gap: 4,
  },
  thumbText: {
    color: DesignTokens.colors.textMain,
    fontWeight: "700",
  },
  thumbLabel: {
    color: DesignTokens.colors.textMuted,
    fontSize: DesignTokens.typography.label.size,
  },
  helper: {
    color: DesignTokens.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
  },
  footerLink: {
    marginTop: DesignTokens.spacing.gapMedium,
    alignItems: "center",
  },
  footerText: {
    color: DesignTokens.colors.textMain,
    fontWeight: "700",
  },
});
