import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FlightScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Flight Screen Placeholder</Text>
      <Text style={styles.subtext}>Countdown · Route · Progress</Text>
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
