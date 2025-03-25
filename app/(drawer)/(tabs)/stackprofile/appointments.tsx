import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import { db } from "../../../../config/Firebase_Conf";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as Haptics from "expo-haptics";
import { getAuth } from "firebase/auth";

interface AppointmentDisplay {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAddress: string;
  date: string;
  time: string;
  timestamp: number;
  status: "pendiente" | "en progreso" | "terminada";
}

type SortOption = "dateAsc" | "dateDesc";
type StatusFilter = "pendiente" | "terminada" | null;

const getDoctorById = async (
  doctorId: string
): Promise<{ name: string; address: string } | null> => {
  try {
    const q = query(collection(db, "doctors"), where("doctorId", "==", doctorId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doctorData = querySnapshot.docs[0].data() as any;
      return {
        name: doctorData.name,
        address: doctorData.address || "Dirección no disponible",
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching doctor by id:", error);
    return null;
  }
};

export default function AppointmentsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const defColor = "#4f0b2e";

  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateAsc");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const q = query(collection(db, "users"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as any;
        if (userData.appointments && userData.appointments.length > 0) {
          const appointmentPromises = userData.appointments.map(async (app: any, index: number) => {
            const dateObj = app.appointment.toDate();
            const doctorData = await getDoctorById(app.doctorId);
            const doctorName = doctorData ? doctorData.name : "Doctor desconocido";
            const doctorAddress = doctorData ? doctorData.address : "Dirección no disponible";
            const appointmentTime = dateObj.getTime();
            const now = Date.now();
            let computedStatus: "pendiente" | "en progreso" | "terminada";
            if (now < appointmentTime) {
              computedStatus = "pendiente";
            } else if (now < appointmentTime + 30 * 60 * 1000) {
              computedStatus = "en progreso";
            } else {
              computedStatus = "terminada";
            }
            return {
              id: index.toString(),
              doctorId: app.doctorId,
              doctorName,
              doctorAddress,
              date: dateObj.toLocaleDateString(),
              time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              timestamp: appointmentTime,
              status: computedStatus,
            };
          });
          let appointmentsData = await Promise.all(appointmentPromises);
          appointmentsData.sort((a, b) => a.timestamp - b.timestamp);
          setAppointments(appointmentsData);
          setFilteredAppointments(appointmentsData);
        } else {
          setAppointments([]);
          setFilteredAppointments([]);
        }
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await loadAppointments();
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let result = [...appointments];
    if (searchQuery) {
      result = result.filter((appt) =>
        appt.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === "dateAsc") {
      result.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      result.sort((a, b) => b.timestamp - a.timestamp);
    }
    if (statusFilter) {
      result = result.filter((appt) =>
        statusFilter === "pendiente"
          ? appt.status === "pendiente" || appt.status === "en progreso"
          : appt.status === "terminada"
      );
    }
    setFilteredAppointments(result);
  }, [appointments, searchQuery, sortBy, statusFilter]);

  const toggleSortOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSortOptions(!showSortOptions);
  };

  const handleSort = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(option);
    setShowSortOptions(false);
  };

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case "dateAsc":
        return "Fecha (Ascendente)";
      case "dateDesc":
        return "Fecha (Descendente)";
      default:
        return "Ordenar por";
    }
  };

  const toggleStatusOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowStatusOptions(!showStatusOptions);
  };

  const handleStatusFilter = (option: StatusFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatusFilter(option);
    setShowStatusOptions(false);
  };

  const getStatusLabel = (status: StatusFilter): string => {
    if (status === "pendiente") return "Pendientes";
    if (status === "terminada") return "Terminadas";
    return "Todos";
  };

  const renderAppointmentCard = ({ item }: { item: AppointmentDisplay }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(drawer)/(tabs)/stackprofile/doctor",
          params: { doctorIdParam: item.doctorId },
        })
      }
    >
      <View style={styles.appointmentCard}>
        <Text style={styles.appointmentTitle}>{item.doctorName}</Text>
        <Text style={styles.appointmentAddress}>{item.doctorAddress}</Text>
        <View style={styles.appointmentDateTime}>
          <Text style={styles.appointmentDate}>{item.date}</Text>
          <Text style={styles.appointmentTime}>{item.time}</Text>
        </View>
        <Text style={styles.appointmentStatus}>Estado: {item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar citas por doctor..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={[styles.filterButton, { flex: 0.48, backgroundColor: defColor }]}
          onPress={toggleSortOptions}
        >
          <Feather name="sliders" size={16} color="#FFF" />
          <Text style={[styles.filterButtonText, { color: "#FFF" }]}>
            {getSortLabel(sortBy)}
          </Text>
          <AntDesign name={showSortOptions ? "up" : "down"} size={12} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { flex: 0.48, backgroundColor: defColor }]}
          onPress={toggleStatusOptions}
        >
          <Ionicons name="filter" size={16} color="#FFF" />
          <Text style={[styles.filterButtonText, { color: "#FFF" }]}>
            {getStatusLabel(statusFilter)}
          </Text>
          <AntDesign name={showStatusOptions ? "up" : "down"} size={12} color="#FFF" />
        </TouchableOpacity>
      </View>

      {showSortOptions && (
        <View style={styles.optionsContainer}>
          <ScrollView style={[styles.scrollableOptions, { height: 90 }]} showsVerticalScrollIndicator={true}>
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "dateAsc" && styles.selectedOption]}
              onPress={() => handleSort("dateAsc")}
            >
              <Text style={[styles.optionText, sortBy === "dateAsc" && styles.selectedOptionText]}>
                Fecha (Ascendente)
              </Text>
              {sortBy === "dateAsc" && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "dateDesc" && styles.selectedOption]}
              onPress={() => handleSort("dateDesc")}
            >
              <Text style={[styles.optionText, sortBy === "dateDesc" && styles.selectedOptionText]}>
                Fecha (Descendente)
              </Text>
              {sortBy === "dateDesc" && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {showStatusOptions && (
        <View style={styles.optionsContainer}>
          <ScrollView style={[styles.scrollableOptions, { height: 135 }]} showsVerticalScrollIndicator={true}>
            <TouchableOpacity
              style={[styles.optionItem, statusFilter === null && styles.selectedOption]}
              onPress={() => handleStatusFilter(null)}
            >
              <Text style={[styles.optionText, statusFilter === null && styles.selectedOptionText]}>
                Todos
              </Text>
              {statusFilter === null && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionItem, statusFilter === "pendiente" && styles.selectedOption]}
              onPress={() => handleStatusFilter("pendiente")}
            >
              <Text style={[styles.optionText, statusFilter === "pendiente" && styles.selectedOptionText]}>
                Pendientes
              </Text>
              {statusFilter === "pendiente" && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionItem, statusFilter === "terminada" && styles.selectedOption]}
              onPress={() => handleStatusFilter("terminada")}
            >
              <Text style={[styles.optionText, statusFilter === "terminada" && styles.selectedOptionText]}>
                Terminadas
              </Text>
              {statusFilter === "terminada" && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointmentCard}
        contentContainerStyle={styles.appointmentsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[defColor]}
            tintColor={defColor}
            title="Actualizando..."
            titleColor="#666"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="calendar-times" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No se encontraron citas</Text>
            <Text style={styles.emptyStateSubtext}>
              Intenta con otros filtros o términos de búsqueda
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
  },
  filterButtonText: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  optionsContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollableOptions: {
    width: "100%",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    height: 45,
  },
  selectedOption: {
    backgroundColor: "#F9F0F5",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#4f0b2e",
    fontWeight: "500",
  },
  appointmentsList: {
    padding: 16,
    gap: 16,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f0b2e",
    marginBottom: 5,
  },
  appointmentAddress: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  appointmentDateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appointmentDate: {
    fontSize: 14,
    color: "#333",
  },
  appointmentTime: {
    fontSize: 14,
    color: "#333",
  },
  appointmentStatus: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },
});

export { AppointmentsScreen };