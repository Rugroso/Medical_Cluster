import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { db } from "../../../../config/Firebase_Conf";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import React from "react";

interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const {user: user} = useAuth();
  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  
  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userData: User = {
          ...querySnapshot.docs[0].data() as User,
        };
        console.log("Usuario encontrado:", userData);
        return userData;
      } else {
        console.log("No se encontró ningún usuario con ese ID.");
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo el usuario:", error);
      return null;
    }
  };
  
    React.useEffect(() => {
      if (user?.uid) {
        getUserById(user.uid).then(userData => {
          if (userData) {
            setName(userData.name)
            setLastName(userData.lastName)
          }
        });
      }
    }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <FontAwesome5 name="user-circle" size={90} color="#000000" />
        <Text style={styles.username}>{name} {lastName}</Text>
        <Text style={styles.location}>San Luis Río Colorado, Sonora</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
          <FontAwesome5 name="heart" size={26} color="#FF6B6B" />
          <Text style={styles.buttonText}>Favoritos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
          <FontAwesome5 name="hospital" size={26} color="#3498DB" />
          <Text style={styles.buttonText}>Mis Citas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    paddingTop: 50,
  },
  profileHeader: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingVertical: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  location: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
    gap: 15,
  },
  button: {
    width: '42%',
    height: 90,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  }
});