import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useMemo, useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useRouter, useFocusEffect } from "expo-router";

const NAV_CARDS = [
  { label: "History", route: "/StatsScreen" },
  { label: "Trends", route: "/StatsScreen" },
  { label: "Settings", route: "/settings" },
];

const spacing = { sm: 8, md: 12, lg: 16, section: 24 };

export default function HomeScreen() {
  const router = useRouter();
  const [streakDays, setStreakDays] = useState<number>(0);

  const loadStreak = useCallback(async () => {
    try {
      const storedFlights = await AsyncStorage.getItem("flights");
      const parsed = storedFlights ? JSON.parse(storedFlights) : [];
      if (Array.isArray(parsed)) {
        const days = new Set(
          parsed.map((f) => {
            const date = new Date(f?.startedAt);
            if (Number.isNaN(date.getTime())) return null;
            return date.toISOString().split("T")[0];
          })
        );
        days.delete(null as never);
        setStreakDays(days.size);
      } else {
        setStreakDays(0);
      }
    } catch {
      setStreakDays(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [loadStreak])
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleStart = () => {
    router.push({
      pathname: "/FlightScreen",
      params: { origin: "Glasgow", destination: "Dubai", durationMinutes: "120" },
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.window}>
        <GlobeBackground />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.city}>Glasgow</Text>
          </View>

          <View style={styles.streakPill}>
            <Text style={styles.streakIcon}>✈︎</Text>
            <Text style={styles.streakText}>
              {streakDays > 0 ? `Streak: ${streakDays} day${streakDays > 1 ? "s" : ""}` : "Streak: 0"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Journey</Text>
          </Pressable>

          <View style={styles.navStack}>
            {NAV_CARDS.map((card) => (
              <NavCard key={card.label} label={card.label} onPress={() => router.push(card.route)} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const GlobeBackground = () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #020617;
          }
          canvas {
            display: block;
          }
        </style>
      </head>
      <body>
        <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
        <script>
          const scene = new THREE.Scene();
          scene.background = new THREE.Color("#020617");

          const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );
          camera.position.set(0, 0, 4);

          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          document.body.appendChild(renderer.domElement);

          const geometry = new THREE.SphereGeometry(1.5, 64, 64);
          const material = new THREE.MeshPhongMaterial({
            color: 0x111827,
            emissive: 0x000000,
            shininess: 15,
            specular: 0x111111,
          });
          const globe = new THREE.Mesh(geometry, material);
          scene.add(globe);

          const gridMaterial = new THREE.LineBasicMaterial({ color: 0x1f2937, linewidth: 1 });

          function addLatitudeLine(latDeg) {
            const latRad = (latDeg * Math.PI) / 180;
            const radius = Math.cos(latRad) * 1.5;
            const y = Math.sin(latRad) * 1.5;
            const points = [];
            const segments = 128;
            for (let i = 0; i <= segments; i++) {
              const theta = (i / segments) * Math.PI * 2;
              points.push(new THREE.Vector3(
                radius * Math.cos(theta),
                y,
                radius * Math.sin(theta)
              ));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            scene.add(line);
          }

          function addLongitudeLine(lonDeg) {
            const lonRad = (lonDeg * Math.PI) / 180;
            const points = [];
            const segments = 128;
            for (let i = 0; i <= segments; i++) {
              const phi = (i / segments) * Math.PI - Math.PI / 2;
              const x = 1.5 * Math.cos(phi) * Math.cos(lonRad);
              const y = 1.5 * Math.sin(phi);
              const z = 1.5 * Math.cos(phi) * Math.sin(lonRad);
              points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            scene.add(line);
          }

          [ -60, -30, 0, 30, 60 ].forEach(addLatitudeLine);
          [ -90, -45, 0, 45, 90 ].forEach(addLongitudeLine);

          const light = new THREE.DirectionalLight(0xffffff, 1.0);
          light.position.set(5, 3, 5);
          scene.add(light);

          const ambient = new THREE.AmbientLight(0x111111);
          scene.add(ambient);

          const starsGeometry = new THREE.BufferGeometry();
          const starCount = 500;
          const starPositions = new Float32Array(starCount * 3);
          for (let i = 0; i < starCount * 3; i++) {
            starPositions[i] = (Math.random() - 0.5) * 50;
          }
          starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
          const starsMaterial = new THREE.PointsMaterial({ color: 0x111827, size: 0.1 });
          const stars = new THREE.Points(starsGeometry, starsMaterial);
          scene.add(stars);

          window.addEventListener("resize", () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          });

          function animate() {
            requestAnimationFrame(animate);
            globe.rotation.y += 0.002;
            stars.rotation.y += 0.0005;
            renderer.render(scene, camera);
          }
          animate();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.globeBackground}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

type NavCardProps = {
  label: string;
  onPress: () => void;
};

const NavCard: React.FC<NavCardProps> = ({ label, onPress }) => {
  return (
    <Pressable style={styles.navCard} onPress={onPress}>
      <Text style={styles.navCardText}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  window: {
    flex: 1,
    margin: 16,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  globeBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
  },
  globeFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  globeCircle: {
    width: "90%",
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: "#0e1420",
    borderWidth: 1,
    borderColor: "#111827",
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  headerRow: {
    position: "absolute",
    top: 32,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
    textShadowColor: "#000",
    textShadowRadius: 10,
  },
  city: {
    color: "#F9FAFB",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 4,
    textShadowColor: "#000",
    textShadowRadius: 12,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.9)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  streakIcon: {
    color: "#E5E7EB",
    marginRight: 6,
    fontSize: 12,
  },
  streakText: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "500",
  },
  bottomArea: {
    position: "absolute",
    left: 32,
    bottom: 32,
  },
  startButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  startButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "600",
  },
  navStack: {
    gap: spacing.sm,
  },
  navCard: {
    backgroundColor: "rgba(15,23,42,0.9)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    width: 200,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  navCardText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
  },
});
