import { Stack } from "expo-router";
import React from "react";

export default function stackmap() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Mapa" }} />
    </Stack>
  );
}