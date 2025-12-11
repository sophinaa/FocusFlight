import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Stats go here</Text>
      <Text style={styles.subtext}>Hours · Flights · Streak (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtext: {
    marginTop: 8,
    color: "#666",
  },
});
