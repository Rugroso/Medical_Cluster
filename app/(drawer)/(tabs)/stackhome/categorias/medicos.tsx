import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Switch,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { db } from "../../../../../config/Firebase_Conf";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import MedCardSM from "@/components/MedCardSM";
import * as Haptics from "expo-haptics";
import { getAuth } from "firebase/auth";
import { useRoute } from "@react-navigation/native";

interface Rating {
  userId: string;
  rating: number;
  comment: string;
}

interface Doctor {
  doctorId: string;
  name: string;
  description: string;
  ratings: Rating[]; 
  opening: string;
  tags: string[];
  services: string[];
  isOpen: boolean;
  openingFormat: string;
  image: string;
  specialties: string[];
}

type SortOption = "nameAsc" | "nameDesc" | "ratingHigh" | "ratingLow";
type FilterOption = string | null;

export default function DoctorsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const route = useRoute();
  const {specialty} = route.params as {specialty: string};

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nameAsc");
  const [filterBySpecialty, setFilterBySpecialty] = useState<FilterOption>(null);
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const defColor = "#4f0b2e";

  
  const OPTION_ITEM_HEIGHT = 45; 
  const MAX_VISIBLE_OPTIONS = 3; 

  const getFormattedHour = (hour: string, pm: boolean) => {
    const parsedHour: number = parseInt(hour.slice(0, -3));
    return pm ? (parsedHour + 12).toString() : parsedHour.toString();
  };

  const getSpecialties = async (): Promise<string[]> => {
    try {
      const q = query(collection(db, "specialties"), orderBy("title"));
      const snapshot = await getDocs(q);
      const titles = snapshot.docs.map(doc => {
        const data = doc.data();
        return data.title || "";
      });
      return titles.filter(title => title); 
    } catch (error) {
      console.error("Error obteniendo especialidades:", error);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
      const specialtiesFromDB = await getSpecialties();
      setSpecialties(specialtiesFromDB);
    };
    init();
  }, []);

  const getDoctors = async (): Promise<Doctor[]> => {
    try {
      const q = query(collection(db, "doctors"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doctorsData: Doctor[] = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const { rating, ...rest } = data;
          return {
            ...rest,
            doctorId: docSnap.id,
          };
        });
        // console.log("Doctores encontrados:", doctorsData.length);
        return doctorsData;
      } else {
        // console.log("No se encontró ningún doctor.");
        return [];
      }
    } catch (error) {
      console.error("Error obteniendo doctores:", error);
      return [];
    }
  };

  useEffect(() => {
    if (specialty!=='noparams') {
      setFilterBySpecialty(specialty);
    }
  }, [specialty]);

  const getUserFavorites = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const q = query(
        collection(db, "users"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as { favoriteDoctors: string[] };
        setUserFavorites(userData.favoriteDoctors || []);
      }
    } catch (error) {
      console.error("Error obteniendo favoritos del usuario:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const doctorsData = await getDoctors();
      
      const processedDoctors = doctorsData.map((doc) => {
        const openingHours = doc.opening.split("-");
        const formattedAm = getFormattedHour(openingHours[0], false);
        const formattedPm = getFormattedHour(openingHours[1], true);
        const newHour = formattedAm.concat(" - ", formattedPm);
        
        const [openingTime, closingTime] = newHour.split(" - ").map((time) => parseInt(time));
        const currentHour = new Date().getHours();
        const isOpen = currentHour >= openingTime && currentHour < closingTime;
        
        return {
          ...doc,
          openingFormat: newHour,
          isOpen,
        };
      });
      
            
      setDoctors(processedDoctors);
      setFilteredDoctors(processedDoctors);
      await getUserFavorites();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await loadData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = [...doctors];
    
    if (searchQuery) {
      result = result.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (doc.specialties && doc.specialties.some((specialty) => specialty.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    if (filterBySpecialty) {
      result = result.filter((doc) =>
        doc.specialties && Array.isArray(doc.specialties) && doc.specialties.includes(filterBySpecialty)
      );
    }
    
    if (filterOpenOnly) {
      result = result.filter((doc) => doc.isOpen);
    }
    
    if (filterFavorites) {
      result = result.filter((doc) => userFavorites.includes(doc.doctorId));
    }
    
    switch (sortBy) {
      case "nameAsc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "ratingHigh":
        result.sort((a, b) => {
          const aAvg =
            a.ratings && a.ratings.length > 0
              ? a.ratings.reduce((acc, cur) => acc + cur.rating, 0) / a.ratings.length
              : 0;
          const bAvg =
            b.ratings && b.ratings.length > 0
              ? b.ratings.reduce((acc, cur) => acc + cur.rating, 0) / b.ratings.length
              : 0;
          return bAvg - aAvg;
        });
        break;
      case "ratingLow":
        result.sort((a, b) => {
          const aAvg =
            a.ratings && a.ratings.length > 0
              ? a.ratings.reduce((acc, cur) => acc + cur.rating, 0) / a.ratings.length
              : 0;
          const bAvg =
            b.ratings && b.ratings.length > 0
              ? b.ratings.reduce((acc, cur) => acc + cur.rating, 0) / b.ratings.length
              : 0;
          return aAvg - bAvg;
        });
        break;
    }
    
    setFilteredDoctors(result);
  }, [doctors, searchQuery, sortBy, filterBySpecialty, filterOpenOnly, filterFavorites, userFavorites]);

  const openDoctor = (doctorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // console.log("Doctor ID:", doctorId);
    router.push({
      pathname: "/(drawer)/(tabs)/stackhome/doctor",
      params: { doctorIdParam: doctorId },
    });
  };

  const toggleSortOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSortOptions(!showSortOptions);
    if (showFilterOptions) setShowFilterOptions(false);
  };

  const toggleFilterOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterOptions(!showFilterOptions);
    if (showSortOptions) setShowSortOptions(false);
  };

  const handleSort = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(option);
    setShowSortOptions(false);
  };

  const handleFilter = (option: FilterOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterBySpecialty(option);
    setShowFilterOptions(false);
  };

  const toggleOpenFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterOpenOnly(!filterOpenOnly);
  };

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case "nameAsc":
        return "Nombre (A-Z)";
      case "nameDesc":
        return "Nombre (Z-A)";
      case "ratingHigh":
        return "Calificación (Alta-Baja)";
      case "ratingLow":
        return "Calificación (Baja-Alta)";
      default:
        return "Ordenar por";
    }
  };

  const getOptionsContainerHeight = (itemCount: number) => {
    const visibleCount = Math.min(itemCount, MAX_VISIBLE_OPTIONS);
    return visibleCount * OPTION_ITEM_HEIGHT;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar doctores, especialidades..."
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

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy !== "nameAsc" && { backgroundColor: defColor },
          ]}
          onPress={toggleSortOptions}
        >
          <Feather name="sliders" size={16} color={sortBy !== "nameAsc" ? "#FFF" : "#333"} />
          <Text style={[styles.filterButtonText, sortBy !== "nameAsc" && { color: "#FFF" }]}>
            {getSortLabel(sortBy)}
          </Text>
          <AntDesign name={showSortOptions ? "up" : "down"} size={12} color={sortBy !== "nameAsc" ? "#FFF" : "#333"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            (filterBySpecialty !== null || filterOpenOnly) && { backgroundColor: defColor },
          ]}
          onPress={toggleFilterOptions}
        >
          <Ionicons name="filter" size={16} color={(filterBySpecialty !== null || filterOpenOnly) ? "#FFF" : "#333"} />
          <Text style={[styles.filterButtonText, (filterBySpecialty !== null || filterOpenOnly) && { color: "#FFF" }]}>
            {filterBySpecialty || (filterOpenOnly ? "Solo abiertos" : "Filtrar")}
          </Text>
          <AntDesign name={showFilterOptions ? "up" : "down"} size={12} color={(filterBySpecialty !== null || filterOpenOnly) ? "#FFF" : "#333"} />
        </TouchableOpacity>

      </View>
      <View style={styles.favoriteFilterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterFavorites && { backgroundColor: defColor },
          ]}
          onPress={() => setFilterFavorites(!filterFavorites)}
        >
          <Ionicons name="heart" size={16} color={filterFavorites ? "#FFF" : "#333"} />
          <Text style={[styles.filterButtonText, filterFavorites && { color: "#FFF" }]}>
            Favoritos
          </Text>
        </TouchableOpacity>
      </View>
      
      {showSortOptions && (
        <View style={styles.optionsContainer}>
          <ScrollView 
            style={[styles.scrollableOptions, { height: getOptionsContainerHeight(4) }]}
            showsVerticalScrollIndicator={true}
          >
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "nameAsc" && styles.selectedOption]}
              onPress={() => handleSort("nameAsc")}
            >
              <Text style={[styles.optionText, sortBy === "nameAsc" && styles.selectedOptionText]}>
                Nombre (A-Z)
              </Text>
              {sortBy === "nameAsc" && (
                <Ionicons name="checkmark" size={18} color={defColor} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "nameDesc" && styles.selectedOption]}
              onPress={() => handleSort("nameDesc")}
            >
              <Text style={[styles.optionText, sortBy === "nameDesc" && styles.selectedOptionText]}>
                Nombre (Z-A)
              </Text>
              {sortBy === "nameDesc" && (
                <Ionicons name="checkmark" size={18} color={defColor} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "ratingHigh" && styles.selectedOption]}
              onPress={() => handleSort("ratingHigh")}
            >
              <Text style={[styles.optionText, sortBy === "ratingHigh" && styles.selectedOptionText]}>
                Calificación (Alta-Baja)
              </Text>
              {sortBy === "ratingHigh" && (
                <Ionicons name="checkmark" size={18} color={defColor} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "ratingLow" && styles.selectedOption]}
              onPress={() => handleSort("ratingLow")}
            >
              <Text style={[styles.optionText, sortBy === "ratingLow" && styles.selectedOptionText]}>
                Calificación (Baja-Alta)
              </Text>
              {sortBy === "ratingLow" && (
                <Ionicons name="checkmark" size={18} color={defColor} />
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {showFilterOptions && (
        <View style={styles.optionsContainer}>
          <View style={styles.openFilterContainer}>
            <Text style={styles.openFilterText}>Solo mostrar abiertos</Text>
            <Switch
              value={filterOpenOnly}
              onValueChange={toggleOpenFilter}
              trackColor={{ false: "#D1D1D1", true: "#F9D5E5" }}
              thumbColor={filterOpenOnly ? defColor : "#F4F4F4"}
            />
          </View>
          
          <View style={styles.specialtyHeader}>
            <Text style={styles.specialtyHeaderText}>Especialidades</Text>
          </View>
          
          <ScrollView 
            style={[styles.scrollableOptions, { height: getOptionsContainerHeight(specialties.length + 1) }]}
            showsVerticalScrollIndicator={true}
          >
            <TouchableOpacity
              style={[styles.optionItem, filterBySpecialty === null && styles.selectedOption]}
              onPress={() => handleFilter(null)}
            >
              <Text style={[styles.optionText, filterBySpecialty === null && styles.selectedOptionText]}>
                Todas las especialidades
              </Text>
              {filterBySpecialty === null && (
                <Ionicons name="checkmark" size={18} color={defColor} />
              )}
            </TouchableOpacity>
            
            {specialties.map((specialty, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionItem, filterBySpecialty === specialty && styles.selectedOption]}
                onPress={() => handleFilter(specialty)}
              >
                <Text style={[styles.optionText, filterBySpecialty === specialty && styles.selectedOptionText]}>
                  {specialty}
                </Text>
                {filterBySpecialty === specialty && (
                  <Ionicons name="checkmark" size={18} color={defColor} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item, index) => item.doctorId || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.doctorCard} onPress={() => openDoctor(item.doctorId)}>
            {loading ? null : (
              <MedCardSM
                name={item.name}
                description={item.description}
                opening={item.opening}
                image={item.image}
                isOpen={item.isOpen}
                rating={
                  item.ratings && item.ratings.length > 0
                    ? parseFloat(
                        (
                          item.ratings.reduce((acc, cur) => acc + cur.rating, 0) /
                          item.ratings.length
                        ).toFixed(1)
                      )
                    : 0
                }
              />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.doctorsList}
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
            <FontAwesome5 name="user-md" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No se encontraron doctores</Text>
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
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    backgroundColor: "#FFF",
  },
    favoriteFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    justifyContent: "center",
    width: "47%",
  },
  filterButtonText: {
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#333",
    marginHorizontal: 2,
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
  openFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  openFilterText: {
    fontSize: 16,
    color: "#333",
  },
  specialtyHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  specialtyHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  doctorsList: {
    padding: 16,
    gap: 16,
  },
  doctorCard: {
    width: "100%",
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

export { DoctorsScreen };