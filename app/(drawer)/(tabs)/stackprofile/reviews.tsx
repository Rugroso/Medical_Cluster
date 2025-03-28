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

interface Review {
  id: string;
  doctorId: string;
  doctorName: string;
  comment: string;
  rating: number;
  date: string;
  timestamp: number;
}

type SortOption = "dateAsc" | "dateDesc" | "ratingHigh" | "ratingLow";
type RatingFilter = number | null;

// Función para obtener datos del doctor a partir de su id.
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

export default function ReviewsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const defColor = "#4f0b2e";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateAsc");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(null);
  const [showRatingOptions, setShowRatingOptions] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const q = query(collection(db, "users"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as any;
        if (userData.ratings && userData.ratings.length > 0) {
          const reviewPromises = userData.ratings.map(async (ratingItem: any, index: number) => {
            const doctorData = await getDoctorById(ratingItem.doctorId);
            const doctorName = doctorData ? doctorData.name : "Doctor desconocido";
            const dateObj = ratingItem.createdAt ? new Date(ratingItem.createdAt) : new Date();
            return {
              id: index.toString(),
              doctorId: ratingItem.doctorId,
              doctorName,
              comment: ratingItem.comment,
              rating: ratingItem.rating,
              date: dateObj.toLocaleDateString(),
              timestamp: dateObj.getTime(),
            };
          });
          const reviewsData = await Promise.all(reviewPromises);
          reviewsData.sort((a, b) => a.timestamp - b.timestamp);
          setReviews(reviewsData);
          setFilteredReviews(reviewsData);
        } else {
          setReviews([]);
          setFilteredReviews([]);
        }
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await loadReviews();
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filtrado y ordenamiento en función de búsqueda, orden y filtro de rating.
  useEffect(() => {
    let result = [...reviews];
    if (searchQuery) {
      result = result.filter((rev) =>
        rev.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (sortBy) {
      case "dateAsc":
        result.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case "dateDesc":
        result.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "ratingHigh":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "ratingLow":
        result.sort((a, b) => a.rating - b.rating);
        break;
    }
    if (ratingFilter !== null) {
      result = result.filter((rev) => rev.rating === ratingFilter);
    }
    setFilteredReviews(result);
  }, [reviews, searchQuery, sortBy, ratingFilter]);

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
      case "ratingHigh":
        return "Estrellas (Alta-Baja)";
      case "ratingLow":
        return "Estrellas (Baja-Alta)";
      default:
        return "Ordenar por";
    }
  };

  const toggleRatingOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowRatingOptions(!showRatingOptions);
  };

  const handleRatingFilter = (option: RatingFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRatingFilter(option);
    setShowRatingOptions(false);
  };

  const getRatingLabel = (rating: RatingFilter): string => {
    if (rating === 1) return "1 estrella";
    if (rating === 2) return "2 estrellas";
    if (rating === 3) return "3 estrellas";
    if (rating === 4) return "4 estrellas";
    if (rating === 5) return "5 estrellas";
    return "Todos";
  };

  const renderStars = (value: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= value ? "star" : "star-outline"}
          size={18}
          color="#FF6B2C"
          style={{ marginHorizontal: 1 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderReviewCard = ({ item }: { item: Review }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() =>
        router.push({
          pathname: "/(drawer)/(tabs)/stackprofile/doctor",
          params: { doctorIdParam: item.doctorId },
        })
      }
    >
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewDoctorName}>{item.doctorName}</Text>
        {renderStars(item.rating)}
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reseñas..."
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

      {/* Fila combinada: Ordenar por y Filtrar por rating */}
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
          style={[
            styles.filterButton,
            { flex: 0.48, backgroundColor: defColor },
          ]}
          onPress={toggleRatingOptions}
        >
          <Ionicons name="filter" size={16} color="#FFF" />
          <Text style={[styles.filterButtonText, { color: "#FFF" }]}>
            {getRatingLabel(ratingFilter)}
          </Text>
          <AntDesign name={showRatingOptions ? "up" : "down"} size={12} color="#FFF" />
        </TouchableOpacity>
      </View>

      {showSortOptions && (
        <View style={styles.optionsContainer}>
          <ScrollView style={[styles.scrollableOptions, { height: 120 }]} showsVerticalScrollIndicator={true}>
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
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "ratingHigh" && styles.selectedOption]}
              onPress={() => handleSort("ratingHigh")}
            >
              <Text style={[styles.optionText, sortBy === "ratingHigh" && styles.selectedOptionText]}>
                Estrellas (Alta-Baja)
              </Text>
              {sortBy === "ratingHigh" && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionItem, sortBy === "ratingLow" && styles.selectedOption]}
              onPress={() => handleSort("ratingLow")}
            >
              <Text style={[styles.optionText, sortBy === "ratingLow" && styles.selectedOptionText]}>
                Estrellas (Baja-Alta)
              </Text>
              {sortBy === "ratingLow" && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {showRatingOptions && (
        <View style={styles.optionsContainer}>
          <ScrollView style={[styles.scrollableOptions, { height: 135 }]} showsVerticalScrollIndicator={true}>
            <TouchableOpacity
              style={[styles.optionItem, ratingFilter === null && styles.selectedOption]}
              onPress={() => handleRatingFilter(null)}
            >
              <Text style={[styles.optionText, ratingFilter === null && styles.selectedOptionText]}>
                Todos
              </Text>
              {ratingFilter === null && <Ionicons name="checkmark" size={18} color={defColor} />}
            </TouchableOpacity>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={[styles.optionItem, ratingFilter === star && styles.selectedOption]}
                onPress={() => handleRatingFilter(star)}
              >
                <Text style={[styles.optionText, ratingFilter === star && styles.selectedOptionText]}>
                  {star} {star === 1 ? "estrella" : "estrellas"}
                </Text>
                {ratingFilter === star && <Ionicons name="checkmark" size={18} color={defColor} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewCard}
        contentContainerStyle={styles.reviewsList}
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
            <FontAwesome5 name="comment-slash" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No se encontraron reseñas</Text>
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
  reviewsList: {
    padding: 16,
    gap: 16,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewDoctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f0b2e",
  },
  reviewComment: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
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

export { ReviewsScreen };