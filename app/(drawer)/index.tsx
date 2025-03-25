import { Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/Firebase_Conf"; 

export default function Index() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            console.log(userSnapshot.data().isAdmin)
            setIsAdmin(userSnapshot.data()?.isAdmin || false);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error al obtener rol del usuario:", error);
          setIsAdmin(false);
        }
      }
      setCheckingRole(false);
    };

    if (user) {
      fetchUserRole();
    } else {
      setCheckingRole(false);
    }
  }, [user]);

  if (loading || checkingRole || isAdmin == null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4f0b2e" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  } else {
    
  }
  if (isAdmin != null) {
    return isAdmin ? <Redirect href="/(drawer)/(admintabs)" /> : <Redirect href="/(drawer)/(tabs)/stackhome" />;
  }
}