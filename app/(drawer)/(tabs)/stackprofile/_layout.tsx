import { Stack } from "expo-router";
import React from "react";

export default function stackprofile() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Mi Perfil" }} />
    </Stack>
  );
}