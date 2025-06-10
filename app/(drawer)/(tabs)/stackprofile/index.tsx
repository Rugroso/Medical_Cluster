import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { db } from "../../../../config/Firebase_Conf";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, updateDoc, doc} from "firebase/firestore";
import * as Haptics from "expo-haptics";
import MedCardSM from "@/components/MedCardSM";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker"
import { storage } from "../../../../config/Firebase_Conf"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

interface User {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  profilePicture: string;
  location: string;
  favoriteDoctors?: string[];
  ratings: {
    comment: string;
    rating: number;
    doctorId: string;
    createdAt?: string;
  }[];
  appointments?: {
    appointment: any; 
    doctorId: string;
  }[];
}

interface Doctor {
  doctorId: string;
  name: string;
  description: string;
  rating: number;
  opening: string;
  tags: string[];
  isOpen: boolean;
  openingFormat: string;
  image: string;
  ratings: {
    comment: string;
    rating: number;
    userId: string;
    createdAt?: string;
  }[];
  address?: string;
}

interface AppointmentDisplay {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAddress: string;
  date: string;
  time: string;
  timestamp: number;
  status: string;
}

interface Review {
  doctorName: string;
  doctorId: string;
  rating: number;
  comment: string;
  date: string;
  timestamp: number; 
}

type Section = "favorites" | "appointments" | "reviews";

const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const doctorsRef = collection(db, "doctors");
    const q = query(doctorsRef, where("doctorId", "==", doctorId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const doctorData = docSnap.data() as Doctor;
      const address = doctorData.address ? doctorData.address : "Dirección no disponible";
      const openingHours = doctorData.opening.split("-");
      const formattedAm = getFormattedHour(openingHours[0], false);
      const formattedPm = getFormattedHour(openingHours[1], true);
      const newHour = formattedAm.concat(" - ", formattedPm);
      const [openingTime, closingTime] = newHour.split(" - ").map((time) => Number.parseInt(time));
      const hour = new Date().getHours();
      const isOpen = hour >= openingTime && hour < closingTime;
      let sum = 0;
      doctorData.ratings.map((rating) => {
        sum = sum + rating.rating;
      });
      let average = sum / doctorData.ratings.length;
      if (isNaN(average)) {
        average = 0;
      }
      return {
        ...doctorData,
        address,
        openingFormat: newHour,
        isOpen,
        rating: average,
      };
    } else {
      // console.log("No se encontró el doctor con ID:", doctorId);
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo el doctor:", error);
    return null;
  }
};

const getFormattedHour = (hour: string, pm: boolean) => {
  const parsedHour: number = Number.parseInt(hour.slice(0, -3));
  return pm ? (parsedHour + 12).toString() : parsedHour.toString();
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [userData, setUserData] = useState<User>();
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [location, setLocation] = useState("");
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("favorites");
  const defColor = "#4f0b2e";

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const fetchedUserData = { ...(querySnapshot.docs[0].data() as User) };
        setUserData(fetchedUserData);
        // console.log("Usuario encontrado:", fetchedUserData);
        return fetchedUserData;
      } else {
        // console.log("No se encontró ningún usuario con ese ID.");
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo el usuario:", error);
      return null;
    }
  };

  const fetchReviews = async (userData: User) => {
    const promises = userData.ratings.map(async (rating) => {
      const doctorData = await getDoctorById(rating.doctorId);
      if (doctorData) {
        return {
          doctorName: doctorData.name,
          doctorId: rating.doctorId,
          rating: rating.rating,
          comment: rating.comment,
          date: rating.createdAt || "",
          timestamp: rating.createdAt ? new Date(rating.createdAt).getTime() : 0,
        };
      }
      return null;
    });
    const results = await Promise.all(promises);
    let data = results.filter((item) => item !== null) as Review[];
    data.sort((a, b) => b.timestamp - a.timestamp);
    setReviews(data);
  };

  const renderDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <Text style={styles.dateText}>
        {formattedDate} - {formattedTime}
      </Text>
    );
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

  const openDoctor = (doctorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/(drawer)/(tabs)/stackprofile/doctor", params: { doctorIdParam: doctorId } });
  };

  const handleSectionPress = (section: Section) => {
    setActiveSection(section);
  };

  const navigateToFullSection = (section: Section) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    //@ts-ignore
    router.push({ pathname: `/(drawer)/(tabs)/stackprofile/${section}` });
  };

  const loadData = async () => {
    setLoading(true);
    if (user?.uid) {
      const fetchedUserData = await getUserById(user.uid);
      if (fetchedUserData) {
        setName(fetchedUserData.name);
        setLastName(fetchedUserData.lastName);
        setLocation(fetchedUserData.location || "");
        fetchReviews(fetchedUserData);
        setProfilePicture(fetchedUserData.profilePicture || "");
        if (fetchedUserData.favoriteDoctors && fetchedUserData.favoriteDoctors.length > 0) {
          const doctorsPromises = fetchedUserData.favoriteDoctors.map((id) => getDoctorById(id));
          const doctorsResults = await Promise.all(doctorsPromises);
          const validDoctors = doctorsResults.filter((doc) => doc !== null) as Doctor[];
          setFavoriteDoctors([...validDoctors]);
        } else {
          setFavoriteDoctors([]);
        }
        if (fetchedUserData.appointments) {
          const appointmentPromises = fetchedUserData.appointments.map(async (app: any, index: number) => {
            const dateObj = app.appointment.toDate();
            const doctorData = await getDoctorById(app.doctorId);
            if (!doctorData) {
              return null;
            }
            return {
              id: index.toString(),
              doctorId: app.doctorId,
              doctorName: doctorData ? doctorData.name : "Doctor desconocido",
              doctorAddress: doctorData && doctorData.address ? doctorData.address : "Dirección no disponible",
              date: dateObj.toLocaleDateString(),
              time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              timestamp: dateObj.getTime(),
              status: "pendiente"
            };
          });
          let appointmentDisplay = await Promise.all(appointmentPromises);
          const filtered = appointmentDisplay.filter((r): r is AppointmentDisplay => r !== null);
          filtered.sort((a, b) => b.timestamp - a.timestamp);
          setAppointments(filtered);
        } else {
          setAppointments([]);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await loadData();
    } catch (error) {
      console.error("Error al refrescar datos:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

    const pickImage = async () => {
      let resultSucceed = false;
      let newProfilePicture = ''
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3,
        })
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          resultSucceed = true;
          newProfilePicture = result.assets[0].uri
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
      } catch (error) {
        console.error("Error picking image:", error)
        Alert.alert("Error", "No se pudo seleccionar la imagen")
      }

      if (resultSucceed === true) {

        const response = fetch(newProfilePicture)
        
        const blob = await (await response).blob()

        const imageName = `users/${userData?.userId}.jpg`
        const storageRef = ref(storage, imageName)

        const uploadTask = uploadBytesResumable(storageRef, blob)
        let imageUrl:string = ''
        // console.log(imageName)
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // console.log(`Upload is ${progress}% done`)
            },
            (error) => {
              console.error("Error uploading image:", error)
              reject(error)
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
              // console.log("Image uploaded, URL:", imageUrl)
              setProfilePicture (imageUrl)
              Alert.alert("Foto de Perfil", "La foto de Perfil ha sido actualizada con éxito")
              resolve(null)
            },
          )
        })
      const userProfilePicture = {
        profilePicture: imageUrl
      }
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, userProfilePicture);
      } else {
        console.error("User ID is undefined");
      }
      }
    }

  const renderSectionContent = () => {
    switch (activeSection) {
      case "favorites":
        return favoriteDoctors.length > 0 ? (
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Favoritos</Text>
            </View>
            <View style={styles.contentContainer}>
              <ScrollView style={styles.favoritesScroll} nestedScrollEnabled={true}>
                {favoriteDoctors.map((doctor, index) => (
                  <TouchableOpacity key={index} style={styles.cardItem} onPress={() => openDoctor(doctor.doctorId)}>
                    <MedCardSM
                      name={doctor.name}
                      description={doctor.description}
                      rating={doctor.rating}
                      opening={doctor.opening}
                      image={doctor.image}
                      isOpen={doctor.isOpen}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {favoriteDoctors.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.sectionTitle}>Mis Favoritos</Text>
                  <FontAwesome5 name="heart-broken" size={40} color="#ccc" />
                  <Text style={styles.emptyStateText}>No tienes favoritos</Text>
                  <Text style={styles.emptyStateSubtext}>Agrega médicos a tus favoritos para verlos aquí</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Mis Favoritos</Text>
            <View style={styles.emptyState}>
              <FontAwesome5 name="heart-broken" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No tienes favoritos</Text>
              <Text style={styles.emptyStateSubtext}>Agrega médicos a tus favoritos para verlos aquí</Text>
            </View>
          </View>
        );

      case "appointments":
        return (
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Citas</Text>
              {appointments.length > 0 && (
                <TouchableOpacity onPress={() => navigateToFullSection("appointments")} style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>Ver todo</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={defColor} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={{ fontSize: 16, color:'gray', marginBottom:12, marginTop:-8}}>Si deseas cancelar una cita, haz una llamada con el doctor</Text>

            <View style={styles.contentContainer}>
              {appointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="calendar-times" size={40} color="#ccc" />
                  <Text style={styles.emptyStateText}>No tienes citas</Text>
                  <Text style={styles.emptyStateSubtext}>Programa una cita con un médico para verla aquí</Text>
                </View>
              ) : (
                <ScrollView nestedScrollEnabled={true} style={styles.appointmentsScroll}>
                  {appointments.map((appointment, index) => (
                    <TouchableOpacity key={index} onPress={() => openDoctor(appointment.doctorId)}>
                      <View style={styles.appointmentCard}>
                        <Text style={styles.appointmentTitle}>{appointment.doctorName}</Text>
                        <Text style={styles.appointmentAddress}>{appointment.doctorAddress}</Text>
                        <View style={styles.appointmentDateTime}>
                          <Text style={styles.appointmentDate}>{appointment.date}</Text>
                          <Text style={styles.appointmentTime}>{appointment.time}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        );

      case "reviews":
        return (
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Reseñas</Text>
              {reviews.length > 0 && (
                <TouchableOpacity onPress={() => navigateToFullSection("reviews")} style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>Ver todo</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={defColor} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.contentContainer}>
              {reviews.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="comment-slash" size={40} color="#ccc" />
                  <Text style={styles.emptyStateText}>No tienes reseñas</Text>
                </View>
              ) : (
                <ScrollView nestedScrollEnabled={true} style={styles.reviewsScroll}>
                  {reviews.map((review, index) => (
                    <TouchableOpacity key={index} onPress={() => openDoctor(review.doctorId)}>
                      <View style={styles.appointmentCard}>
                        <Text style={styles.appointmentTitle}>{review.doctorName}</Text>
                        <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
                        <Text style={styles.appointmentAddress}>{review.comment}</Text>
                        {renderDate(review.date)}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
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
    >
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            <View style={{ position: "absolute", bottom: 5, right: -10, zIndex: 10, backgroundColor: "#FFF", borderRadius: 50, padding: 5 }}>
              <MaterialCommunityIcons name="pencil" size={25} color={defColor} />
            </View>
            <View>
              <View style={styles.profileImageContainer}>
                {profilePicture === "" ? (
                  <FontAwesome5 name="user-circle" size={100} color="#333" />
                ) : (
                  <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.username}>
            {name} {lastName}
          </Text>
          {location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#777" />
              <Text style={styles.location}>{location}</Text>
            </View>
          )}
            <TouchableOpacity onPress={() => router.push("/(drawer)/(tabs)/stackprofile/editprofile")}>
              <View style={{ borderRadius: 8, padding: 10, flexDirection: "row", alignItems: "center", justifyContent:'flex-start' ,marginBottom: -20 }}>
                <MaterialCommunityIcons name="account-edit" size={20} color={defColor} />
                <Text style={styles.filterButtonText}>Editar Perfil</Text>
              </View>
            </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statItem, activeSection === "favorites" && styles.activeStatItem]}
            onPress={() => handleSectionPress("favorites")}
          >
            <View style={styles.statIconContainer}>
              <FontAwesome5 name="heart" size={18} color={activeSection === "favorites" ? "#FFF" : "#FF6B6B"} />
            </View>
            <Text style={[styles.statNumber, activeSection === "favorites" && styles.activeStatText]}>
              {favoriteDoctors.length}
            </Text>
            <Text style={[styles.statLabel, activeSection === "favorites" && styles.activeStatText]}>
              Favoritos
            </Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={[styles.statItem, activeSection === "appointments" && styles.activeStatItem]}
            onPress={() => handleSectionPress("appointments")}
          >
            <View style={styles.statIconContainer}>
              <FontAwesome5 name="calendar-check" size={18} color={activeSection === "appointments" ? "#FFF" : "#3498DB"} />
            </View>
            <Text style={[styles.statNumber, activeSection === "appointments" && styles.activeStatText]}>
              {appointments.length}
            </Text>
            <Text style={[styles.statLabel, activeSection === "appointments" && styles.activeStatText]}>
              Citas
            </Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={[styles.statItem, activeSection === "reviews" && styles.activeStatItem]}
            onPress={() => handleSectionPress("reviews")}
          >
            <View style={styles.statIconContainer}>
              <FontAwesome5 name="star" size={18} color={activeSection === "reviews" ? "#FFF" : "#FF6B2C"} />
            </View>
            <Text style={[styles.statNumber, activeSection === "reviews" && styles.activeStatText]}>
              {reviews.length}
            </Text>
            <Text style={[styles.statLabel, activeSection === "reviews" && styles.activeStatText]}>
              Reseñas
            </Text>
          </TouchableOpacity>
        </View>
        {renderSectionContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 40,
  },
  profileHeader: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  profileImageContainer: {
    overflow: "hidden",
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: "#777",
    marginLeft: 4,
  },
  statsContainer: {
    width: "90%",
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  activeStatItem: {
    backgroundColor: "#4f0b2e",
  },
  statIconContainer: {
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f0b2e",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  activeStatText: {
    color: "#FFF",
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#E0E0E0",
  },
  sectionContent: {
    width: "90%",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  contentContainer: {
    width: "100%",
    marginBottom: -30,
  },
  cardItem: {
    width: "100%",
    marginBottom: 15,
  },
  emptyState: {
    width: "100%",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 5,
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
  favoritesScroll: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    height: 400,
  },
  appointmentsScroll: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    height: 400,
  },
  reviewsScroll: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    height: 400,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
});