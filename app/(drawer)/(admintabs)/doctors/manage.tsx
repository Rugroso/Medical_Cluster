import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { router } from "expo-router"
import { MaterialCommunityIcons, MaterialIcons, Feather } from "@expo/vector-icons"
import { db } from "../../../../config/Firebase_Conf"
import { collection, query, getDocs, doc, deleteDoc } from "firebase/firestore"
import * as Haptics from "expo-haptics"

interface Rating {
  userId: string;
  rating: number;
  comment: string;
}

interface Doctor {
  doctorId: string
  name: string
  description: string
  ratings?: Rating[];
  image: string
  specialties?: string[]
}

export default function ManageDoctors() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "doctors"))
      const querySnapshot = await getDocs(q)

      const doctorsData: Doctor[] = []
      querySnapshot.forEach((doc) => {
        doctorsData.push({
          doctorId: doc.id,
          ...(doc.data() as Omit<Doctor, "doctorId">),
        })
      })

      setDoctors(doctorsData)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      Alert.alert("Error", "No se pudieron cargar los doctores")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const computeRating = (doctor: Doctor): number => {
    if (doctor.ratings && doctor.ratings.length > 0) {
      return parseFloat(
        (
          doctor.ratings.reduce((acc, cur) => acc + cur.rating, 0) /
          doctor.ratings.length
        ).toFixed(1)
      )
    }
    return 0
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchDoctors()
  }, [])

  const handleAddDoctor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push("/(drawer)/(admintabs)/doctors/add")
  }

  const handleEditDoctor = (doctorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: "/(drawer)/(admintabs)/doctors/edit",
      params: { doctorId },
    })
  }

  const handleDeleteDoctor = (doctorId: string, doctorName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert("Eliminar Doctor", `¿Estás seguro de que deseas eliminar a ${doctorName}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const doctorRef = doc(db, "doctors", doctorId)
            await deleteDoc(doctorRef)
            setDoctors(doctors.filter((doc) => doc.doctorId !== doctorId))
            Alert.alert("Éxito", `${doctorName} ha sido eliminado`)
          } catch (error) {
            console.error("Error deleting doctor:", error)
            Alert.alert("Error", "No se pudo eliminar el doctor")
          }
        },
      },
    ])
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.description && doctor.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doctor.specialties && doctor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesSearch
  })

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Image source={{ uri: item.image || "https://via.placeholder.com/100" }} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>
            {item.specialties && item.specialties.length > 0
              ? item.specialties[0]
              : item.description || "Sin especialidad"}
          </Text>
          <View style={styles.doctorRating}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name="star"
                  size={16}
                  color={i < Math.floor(computeRating(item)) ? "#FF6B2C" : "#E0E0E0"}
                  style={{ marginRight: 2 }}
                />
              ))}
            <Text style={styles.ratingText}>{computeRating(item)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.doctorActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() =>
            router.push({
              pathname: "/(drawer)/(admintabs)/doctors/doctor",
              params: { doctorIdParam: item.doctorId },
            })
          }
        >
          <Feather name="eye" size={16} color="#4f0b2e" />
          <Text style={styles.viewButtonText}>Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditDoctor(item.doctorId)}
        >
          <Feather name="edit-2" size={16} color="#3B82F6" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteDoctor(item.doctorId, item.name)}
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
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
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar doctores..."
              value={searchQuery}
              placeholderTextColor={"#999"}

              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f0b2e" />
            <Text style={styles.loadingText}>Cargando doctores...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorItem}
            keyExtractor={(item) => item.doctorId}
            contentContainerStyle={styles.doctorsList}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="doctor" size={80} color="#ccc" />
                <Text style={styles.emptyTitle}>No se encontraron doctores</Text>
                <Text style={styles.emptyDescription}>
                  No hay doctores que coincidan con tu búsqueda. Intenta con otros términos o agrega un nuevo doctor.
                </Text>
              </View>
            )}
          />
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddDoctor}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Agregar Doctor</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#4f0b2e",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#4f0b2e",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  doctorsList: {
    padding: 16,
    paddingBottom: 80,
  },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  doctorRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  doctorActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  viewButton: {
    backgroundColor: "#f9e6ee",
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#4f0b2e",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#e6f0ff",
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4f0b2e",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
})