import { Stack } from "expo-router";
import {act, useEffect, useState} from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import WaitTime from "@/components/waitTime";
import { Platform } from "react-native";

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
          headerTitle: "Dashboard",
          headerLeft: () => (
                  Platform.OS === "ios" ? (
                    <TouchableOpacity 
                      style={{ padding: 4, backgroundColor: "#f5f5f5", borderRadius: 50 }}
                      onPress={openDrawer}
                    >
                      <MaterialCommunityIcons name="menu" size={24} color="#333" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={{ padding: 4, marginRight:12, backgroundColor: "#f5f5f5", borderRadius: 50 }}
                      onPress={openDrawer}
                    >
                      <MaterialCommunityIcons name="menu" size={24} color="#333" />
                    </TouchableOpacity>
                  )
                ),
          headerRight: () => (
            <View>
              <WaitTime />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerTitle: "Notificaciones",
        }}
      />
      <Stack.Screen
        name="doctors/add"
        options={{
          headerTitle: "Agregar Médico",
        }}
      />
      <Stack.Screen
        name="doctors/edit"
        options={{
          headerTitle: "Editar Médico",
        }}
      />
      <Stack.Screen
        name="doctors/manage"
        options={{
          headerTitle: "Gestionar Médicos",
        }}
      />
      <Stack.Screen
        name="doctors/doctor"
        options={{
          headerTitle: "Médico",
        }}
      />
    </Stack>
  );
}