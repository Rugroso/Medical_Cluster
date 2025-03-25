import { Stack } from "expo-router";
import {act, useEffect, useState} from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Weather from "@/components/weather";
import WaitTime from "@/components/waitTime";

export default function stackhome() {
  const navigation = useNavigation();

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  return (
    <Stack>
    <Stack.Screen
        name="index"
        options={{
          headerTitle: "Inicio",
          headerLeft: () => (
            <TouchableOpacity 
              style={{ padding: 6, backgroundColor: "#f5f5f5", borderRadius: 50, marginBottom: 10  }}
              onPress={openDrawer}
            >

              <MaterialCommunityIcons name="menu" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View>
              <WaitTime />
            </View>
          ),
        }}
      />
      <Stack.Screen name="doctor" options={{ headerTitle: "Médico" }} />
      <Stack.Screen name="categorias/medicos" options={{ headerTitle: "Médicos" }} />
      <Stack.Screen name="categorias/restaurantes" options={{ headerTitle: "Restaurantes" }} />
      <Stack.Screen name="categorias/comercio" options={{ headerTitle: "Comercio" }} />
      <Stack.Screen name="categorias/deportes" options={{ headerTitle: "Deportes" }} />
      <Stack.Screen name="categorias/educacion" options={{ headerTitle: "Educación" }} />
      <Stack.Screen name="categorias/entretenimiento" options={{ headerTitle: "Entretenimiento" }} />
      <Stack.Screen name="categorias/gobierno" options={{ headerTitle: "Gobierno" }} />
      <Stack.Screen name="categorias/transporte" options={{ headerTitle: "Transporte" }} />
    </Stack>
  );
}