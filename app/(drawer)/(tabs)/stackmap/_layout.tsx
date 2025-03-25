import { Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import WaitTime from "@/components/waitTime";
export default function stackmap() {
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
                headerTitle: "Mapa",
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
    </Stack>
  );
}