"use client"

import { useState, useEffect } from "react"
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
  ActivityIndicator,
} from "react-native"
import { Text, TextInput, Button } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, getDoc, arrayRemove } from "firebase/firestore"
import { db } from "../../../../config/Firebase_Conf"
import { useAuth } from "@/context/AuthContext"
import { useLocalSearchParams, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

interface Doctor {
  doctorId: string
  name: string
  description: string
  rating: number
  address: string
  completeDescription: string
  opening: string
  tags: string[]
  isOpen: boolean
  openingFormat: string
  services: string[]
  phone: string
  image: string
  facebook: string
  instagram: string
  tiktok: string
  youtube: string
  x: string
  website: string
  gallery: string[]
  ratings?: Rating[]
}

interface Rating {
  userId: string
  rating: number
  comment: string
  userName?: string
  createdAt?: string
}

export default function RatingScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [existingRating, setExistingRating] = useState<Rating | null>(null)

  const doctorIdParam = params.doctorIdParam as string

  useEffect(() => {
    getDoctorById(doctorIdParam)
  }, [doctorIdParam])

  const getDoctorById = async (doctorId: string) => {
    try {
      const q = query(collection(db, "doctors"), where("doctorId", "==", doctorId))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]
        const doctorData = docSnap.data() as Doctor

        const ratingsWithUserNames = await getRatingsWithUserNames(docSnap.data().ratings || [])

        setDoctor({
          ...doctorData,
          ratings: ratingsWithUserNames,
        })

        if (user && ratingsWithUserNames.length > 0) {
          const userRating = ratingsWithUserNames.find((r) => r.userId === user.uid)
          if (userRating) {
            setExistingRating(userRating)
            setRating(userRating.rating)
            setComment(userRating.comment)
            setIsEditing(true)
          }
        }
      }
    } catch (error) {
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await getDoctorById(doctorIdParam)
    setRefreshing(false)
  }

  const getRatingsWithUserNames = async (ratings: Rating[]): Promise<Rating[]> => {
    setLoadingRatings(true)
    try {
      const enrichedRatings = await Promise.all(
        ratings.map(async (ratingObj) => {
          try {
            const userDoc = await getDoc(doc(db, "users", ratingObj.userId))
            const userData = userDoc.exists() ? userDoc.data() : null
            return {
              ...ratingObj,
              userName: userData ? `${userData.name} ${userData.lastName}` : "Usuario desconocido",
            }
          } catch (error) {
            return {
              ...ratingObj,
              userName: "Usuario desconocido",
            }
          }
        }),
      )
      return enrichedRatings
    } catch (error) {
      return ratings
    } finally {
      setLoadingRatings(false)
    }
  }

  const handleRatingSubmit = async () => {
    if (!user || !doctor) {
      Alert.alert("Error", "Usuario o doctor no encontrados.")
      return
    }

    if (rating < 1 || rating > 5) {
      Alert.alert("Calificación requerida", "Selecciona un número de estrellas (mínimo 1).")
      return
    }

    setLoading(true)

    const timestamp = new Date().toISOString()

    try {
      const userRef = doc(db, "users", user.uid)
      const doctorRef = doc(db, "doctors", doctor.doctorId)

      if (isEditing && existingRating) {
        await updateDoc(userRef, {
          ratings: arrayRemove({
            doctorId: doctor.doctorId,
            rating: existingRating.rating,
            comment: existingRating.comment,
            createdAt: existingRating.createdAt,
          }),
        })

        await updateDoc(doctorRef, {
          ratings: arrayRemove({
            userId: user.uid,
            rating: existingRating.rating,
            comment: existingRating.comment,
            createdAt: existingRating.createdAt,
          }),
        })
      }

      await updateDoc(userRef, {
        ratings: arrayUnion({
          doctorId: doctor.doctorId,
          rating: rating,
          comment: comment,
          createdAt: timestamp,
        }),
      })

      await updateDoc(doctorRef, {
        ratings: arrayUnion({
          userId: user.uid,
          rating: rating,
          comment: comment,
          createdAt: timestamp,
        }),
      })

      Alert.alert("Éxito", isEditing ? "Tu reseña se ha actualizado." : "Tu reseña se ha enviado.")

      setExistingRating({
        userId: user.uid,
        rating: rating,
        comment: comment,
        createdAt: timestamp,
      })
      setIsEditing(true)

      getDoctorById(doctor.doctorId)
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar tu reseña.")
    }

    setLoading(false)
  }

  const handleDeleteReview = async () => {
    if (!user || !doctor || !existingRating) {
      Alert.alert("Error", "No se puede eliminar la reseña.")
      return
    }

    setDeleting(true)

    try {
      const userRef = doc(db, "users", user.uid)
      const doctorRef = doc(db, "doctors", doctor.doctorId)

      await updateDoc(userRef, {
        ratings: arrayRemove({
          doctorId: doctor.doctorId,
          rating: existingRating.rating,
          comment: existingRating.comment,
          createdAt: existingRating.createdAt,
        }),
      })

      await updateDoc(doctorRef, {
        ratings: arrayRemove({
          userId: user.uid,
          rating: existingRating.rating,
          comment: existingRating.comment,
          createdAt: existingRating.createdAt,
        }),
      })

      Alert.alert("Éxito", "Tu reseña ha sido eliminada.")
      
      setRating(0)
      setComment("")
      setIsEditing(false)
      setExistingRating(null)
      
      getDoctorById(doctor.doctorId)
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar tu reseña.")
    } finally {
      setDeleting(false)
    }
  }

  const confirmDeleteReview = () => {
    Alert.alert(
      "Eliminar Reseña",
      "¿Estás seguro de que deseas eliminar esta reseña?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          onPress: handleDeleteReview,
          style: "destructive" 
        }
      ]
    )
  }

  const renderStars = (value: number) => {
    const stars = []
    for (let index = 1; index <= 5; index++) {
      stars.push(
        <Icon
          key={index}
          name={index <= value ? "star" : "star-outline"}
          size={20}
          color="#FF6B2C"
          style={{ marginHorizontal: 1 }}
        />,
      )
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>
  }

  const renderDate = (dateString?: string) => {
    if (!dateString) return null

    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString()
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return (
      <Text style={styles.reviewDate}>
        {formattedDate} - {formattedTime}
      </Text>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f0c2e"]} />}
      >
        <Text style={styles.title}>{isEditing ? "Edita tu opinión" : "Da una opinión sobre tu médico"}</Text>

        {doctor ? (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: doctor.image }} style={styles.doctorImage} resizeMode="cover" />
            </View>

            <Text style={styles.subtitle}>{doctor.name}</Text>

            {isEditing && (
              <View style={styles.editingBanner}>
                <Icon name="pencil-circle" size={24} color="#4f0c2e" />
                <Text style={styles.editingText}>Estás editando tu reseña anterior</Text>
              </View>
            )}

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
              selectionColor="#4f0c2e"
              underlineColor="#4f0c2e"
              activeUnderlineColor="#4f0c2e"
              activeOutlineColor="#4f0c2e"
              outlineColor="#4f0c2e"
              onChangeText={(text) => setComment(text.slice(0, 100))}
              mode="outlined"
              multiline
              style={styles.input}
              placeholder="Comparte tu experiencia con este doctor..."
              placeholderTextColor="#666"
            />
            <Text style={{ textAlign: "left", color: "#666" }}>{comment.length}/100</Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleRatingSubmit}
                loading={loading}
                disabled={loading || deleting}
                style={[styles.button, { width: '80%' }]}
              >
                {isEditing ? "Actualizar Reseña" : "Enviar Reseña"}
              </Button>
              
              {isEditing && (
                <Button
                  mode="outlined"
                  onPress={confirmDeleteReview}
                  disabled={loading || deleting}
                  style={styles.deleteButton}
                  textColor="#D32F2F"
                >
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <MaterialIcons name="delete-outline" size={18} color="#D32F2F" />
                    <Text style={{ marginLeft: 5, color: "#D32F2F", fontWeight: "500" }}>
                      Eliminar Reseña
                    </Text>
                  </View>
                </Button>
              )}
            </View>

            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>Reseñas de otros pacientes </Text>
                <Text style={styles.reviewTitleNumber}>({doctor?.ratings?.length ?? 0})</Text>
              </View>

              {loadingRatings ? (
                <ActivityIndicator animating={true} color="#4f0c2e" />
              ) : (
                <ScrollView style={styles.reviewsScroll} nestedScrollEnabled={true}>
                  {doctor.ratings && doctor.ratings.length > 0 ? (
                    doctor.ratings.map((item, index) => (
                      <View key={index} style={[styles.reviewCard, item.userId === user?.uid && styles.userReviewCard]}>
                        <Text style={styles.reviewUser}>
                          {item.userName} {item.userId === user?.uid && "(Tú)"}
                        </Text>
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
  )
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
  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9e6ee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  editingText: {
    marginLeft: 8,
    color: "#4f0c2e",
    fontWeight: "500",
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
    marginBottom: 8,
    borderColor: "#f4ced4",
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#4f0c2e",
    
  },
  deleteButton: {
    borderColor: "#D32F2F",
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 10,
    width: '80%',
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
  userReviewCard: {
    borderColor: "#4f0c2e",
    borderWidth: 2,
    backgroundColor: "#f9f5f7",
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
  }
})