"use client"

import { useState, useEffect, useCallback, use } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native"
import { router } from "expo-router"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { db } from "../../../config/Firebase_Conf"
import { collection, query, getDocs, where } from "firebase/firestore"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/context/AuthContext"
import { Feather } from "@expo/vector-icons"


interface DashboardStats {
  totalDoctors: number
  totalCategories: number
}

interface User {
  id: string
  name: string
  lastName: string
  email: string
}


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalCategories: 5,
  })
  const [adminName, setAdminName] = useState("Administrador")
  const { user } = useAuth()

  const isDevelopment = () => {
    Alert.alert("Esta función está en desarrollo y no está disponible actualmente.")
  }

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userData: User = {
          ...(querySnapshot.docs[0].data() as User),
        }
        return userData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

    const fetchUserData = async () => {
    if (user) {
      const userData = await getUserById(user.uid)
      if (userData) {
        setAdminName(`${userData.name} ${userData.lastName}`)
      } else {
        setAdminName("Administrador")
      }
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "doctors"))
      const querySnapshot = await getDocs(q)

      const totalDocs = querySnapshot.size
      let activeDocs = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.isActive) {
          activeDocs++
        }
      })

      setStats({
        totalDoctors: totalDocs,
        totalCategories: 5,
      })

      setAdminName("Admin")
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchUserData()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchStats()
    fetchUserData()
  }, [])

  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(route as any)
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f0b2e" />
        <Text style={styles.loadingText}>Cargando panel de administración...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f0b2e"]}
            tintColor="#4f0b2e"
            title="Actualizando..."
            titleColor="#666"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Bienvenido,</Text>
              <Text style={styles.adminName}>{adminName}</Text>
              <Text style={styles.roleText}>Administrador</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Resumen</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#f9e6ee" }]}>
                <FontAwesome5 name="user-md" size={24} color="#4f0b2e" />
              </View>
              <Text style={styles.statValue}>{stats.totalDoctors}</Text>
              <Text style={styles.statLabel}>Total Doctores</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

          <View style={styles.actionCardsContainer}>
            <TouchableOpacity
              style={[styles.actionCard, styles.primaryActionCard]}
              onPress={() => handleNavigate("/(drawer)/(admintabs)/doctors/manage")}
            >
              <View style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <FontAwesome5 name="user-md" size={28} color="#fff" />
                </View>
                <Text style={styles.actionCardTitle}>Gestionar Doctores</Text>
                <Text style={styles.actionCardDescription}>Añadir, editar o eliminar doctores del directorio</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={24} color="#fff" style={styles.actionCardArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.primaryActionCard]}
              onPress={() => handleNavigate("/(drawer)/(admintabs)/notifications")}
            >
              <View style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <Feather name="send" size={28} color="#fff" />
                </View>
                <Text style={styles.actionCardTitle}>Enviar Notificaciones</Text>
                <Text style={styles.actionCardDescription}>Enviar notificaciones a todos los usuarios de la app</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={24} color="#fff" style={styles.actionCardArrow} />
            </TouchableOpacity>

            <View style={styles.actionRowContainer}>
              <TouchableOpacity style={styles.actionCard} onPress={() => isDevelopment()}>
                <View style={styles.smallActionIconContainer}>
                  <MaterialIcons name="people" size={24} color="#4f0b2e" />
                </View>
                <Text style={styles.smallActionTitle}>Gestión de usuarios (En desarrollo)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRowContainer}></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 24,
    backgroundColor: "#4f0b2e",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
  },
  welcomeText: {
    fontSize: 16,
    color: "#f9e6ee",
  },
  adminName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    color: "#f9e6ee",
    marginTop: 4,
    textAlign: "right",
    width : "100%"
  },
  profileButton: {
    position: "relative",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#f9e6ee",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionCardsContainer: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  primaryActionCard: {
    backgroundColor: "#4f0b2e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    marginBottom: 16,
  },
  actionCardContent: {
    flex: 1,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  actionCardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 16,
  },
  actionCardArrow: {
    marginLeft: 8,
  },
  actionRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  smallActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f9e6ee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  smallActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#4f0b2e",
    fontWeight: "500",
  },
  activityList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activityDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f0b2e",
    marginLeft: 8,
  },
})

