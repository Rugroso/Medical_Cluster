import { Stack } from "expo-router";
import React from "react";

export default function stackhome() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "TestDoctor" }} />
    </Stack>
  );
}