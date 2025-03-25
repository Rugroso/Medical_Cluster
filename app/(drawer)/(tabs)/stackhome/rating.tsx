import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  getDoc
} from "firebase/firestore";
import { db } from "../../../../config/Firebase_Conf";
import { useAuth } from "../../../../context/AuthContext";
import { useRoute } from "@react-navigation/native";

interface Doctor {
  doctorId: string;
  name: string;
  description: string;
  rating: number;
  address: string;
  completeDescription: string;
  opening: string;
  tags: string[];
  isOpen: boolean;
  openingFormat: string;
  services: string[];
  phone: string;
  image: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
  website: string;
  gallery: string[];
  ratings?: Rating[];
}


interface Rating {
  userId: string;
  rating: number;
  comment: string;
  userName?: string;
  createdAt?: string;
}

export default function RatingScreen() {
  const route = useRoute();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const { doctorIdParam } = route.params as { doctorIdParam: string };

  useEffect(() => {
    getDoctorById(doctorIdParam);
  }, [doctorIdParam]);

  const getDoctorById = async (doctorId: string) => {
    try {
      const q = query(collection(db, "doctors"), where("doctorId", "==", doctorId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const doctorData = docSnap.data() as Doctor;

        const ratingsWithUserNames = await getRatingsWithUserNames(docSnap.data().ratings || []);

        setDoctor({
          ...doctorData,
          ratings: ratingsWithUserNames,
        });
      }
    } catch (error) {
      console.error("Error obteniendo el doctor:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getDoctorById(doctorIdParam);
    setRefreshing(false);
  };

  const getRatingsWithUserNames = async (ratings: Rating[]): Promise<Rating[]> => {
    setLoadingRatings(true);
    try {
      const enrichedRatings = await Promise.all(
        ratings.map(async (ratingObj) => {
          try {
            const userDoc = await getDoc(doc(db, "users", ratingObj.userId));
            const userData = userDoc.exists() ? userDoc.data() : null;
            return {
              ...ratingObj,
              userName: userData ? `${userData.name} ${userData.lastName}` : "Usuario desconocido",
            };
          } catch (error) {
            console.error("Error fetching user for rating:", error);
            return {
              ...ratingObj,
              userName: "Usuario desconocido",
            };
          }
        })
      );
      return enrichedRatings;
    } catch (error) {
      console.error("Error enriqueciendo ratings:", error);
      return ratings;
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!user || !doctor) {
      Alert.alert("Error", "Usuario o doctor no encontrados.");
      return;
    }
  
    if (rating < 1 || rating > 5) {
      Alert.alert("Calificación requerida", "Selecciona un número de estrellas (mínimo 1).");
      return;
    }
  
    setLoading(true);
  
    const timestamp = new Date().toISOString();
  
    try {
      const userRef = doc(db, "users", user.uid);
  
      await updateDoc(userRef, {
        ratings: arrayUnion({
          doctorId: doctor.doctorId,
          rating: rating,
          comment: comment,
          createdAt: timestamp,
        }),
      });
  
      const doctorRef = doc(db, "doctors", doctor.doctorId);
  
      await updateDoc(doctorRef, {
        ratings: arrayUnion({
          userId: user.uid,
          rating: rating,
          comment: comment,
          createdAt: timestamp,
        }),
      });
  
      Alert.alert("Éxito", "Tu reseña se ha enviado.");
      setRating(0);
      setComment("");
  
      getDoctorById(doctor.doctorId);
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
      Alert.alert("Error", "No se pudo enviar tu reseña.");
    }
  
    setLoading(false);
  };

  const renderStars = (value: number) => {
    const stars = [];
    for (let index = 1; index <= 5; index++) {
      stars.push(
        <Icon
          key={index}
          name={index <= value ? "star" : "star-outline"}
          size={20}
          color="#FF6B2C"
          style={{ marginHorizontal: 1 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderDate = (dateString?: string) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Text style={styles.reviewDate}>
        {formattedDate} - {formattedTime}
      </Text>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f0c2e"]} />
        }
      >
        <Text style={styles.title}>Da una opinión sobre tu médico</Text>

        {doctor ? (
          <>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: doctor.image }}
                style={styles.doctorImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.subtitle}>{doctor.name}</Text>

            <Text style={styles.label}>Selecciona tu calificación:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity key={index} onPress={() => setRating(index)}>
                  <Icon
                    name={index <= rating ? "star" : "star-outline"}
                    size={40}
                    color="#FF6B2C"
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              label="Escribe tu reseña"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleRatingSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Enviar Reseña
            </Button>

            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>Reseñas de otros pacientes  </Text>
                <Text style={styles.reviewTitleNumber}>
                  ({doctor?.ratings?.length ?? 0})
                </Text>
              </View>

              {loadingRatings ? (
                <ActivityIndicator animating={true} color="#4f0c2e" />
              ) : (
                <ScrollView style={styles.reviewsScroll} nestedScrollEnabled={true}>
                  {doctor.ratings && doctor.ratings.length > 0 ? (
                    doctor.ratings.map((item, index) => (
                      <View key={index} style={styles.reviewCard}>
                        <Text style={styles.reviewUser}>{item.userName}</Text>
                        <View style={styles.reviewRating}>{renderStars(item.rating)}</View>
                        <Text style={styles.reviewComment}>{item.comment}</Text>
                        {renderDate(item.createdAt)}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noReviews}>No hay reseñas todavía.</Text>
                  )}
                </ScrollView>
              )}
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color="#4f0b2e" />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  doctorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fff",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    borderColor: "#f4ced4",
    backgroundColor: "#fffbfe",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4f0c2e",
  },
  reviewsContainer: {
    marginTop: 30,
    height: 300,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderRadius: 12,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  reviewTitleNumber: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "300",
  },
  reviewsScroll: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: "#fffbfe",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f4ced4",
  },
  reviewUser: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  noReviews: {
    textAlign: "center",
    color: "#888",
  },
});