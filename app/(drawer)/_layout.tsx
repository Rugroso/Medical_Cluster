import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useAuth } from "../../context/AuthContext"; 
import * as Haptics from 'expo-haptics';

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer screenOptions={{ headerShown: false }} drawerContent={() => <CustomDrawerContent />} />
    </GestureHandlerRootView>
  );
}

function CustomDrawerContent() {
  const router = useRouter();
  const { logout } = useAuth(); 

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      console.log("Cerrando sesión...");
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Menú</Text>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutButton, pressed ? styles.logoutButtonPressed : {}]}
      >
        <LogOut size={20} color="white" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  titleContainer: {
    marginTop: 40,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    justifyContent: "center",
  },
  logoutButtonPressed: {
    backgroundColor: "#B91C1C",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});