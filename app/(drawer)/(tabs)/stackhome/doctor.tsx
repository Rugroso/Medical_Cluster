import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../../../config/Firebase_Conf";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { Linking, Alert } from "react-native";
import { router } from "expo-router";
import { useRouter } from "expo-router";
import * as Calendar from "expo-calendar";



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
  phone: string
}

const DoctorDetailScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();

    const { doctorIdParam } = route.params as { doctorIdParam: string };
    getDoctorById(doctorIdParam).then((doctor) => {
      setDoctor(doctor);
      setLoading(false);
    });
  }, []);

  const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
    try {
      const q = query(collection(db, "doctors"), where("doctorId", "==", doctorId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Doctor;
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo el doctor:", error);
      return null;
    }
  };


const handleScheduleAppointment = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso al calendario para agendar la cita.");
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.allowsModifications);

    if (!defaultCalendar) {
      Alert.alert("Error", "No se encontró un calendario válido en tu dispositivo.");
      return;
    }

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: `Cita con ${doctor?.name}`,
      location: doctor?.address,
      notes: `Cita médica con ${doctor?.name}.`,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      timeZone: "America/Mexico_City",
    });

    if (eventId) {
      Alert.alert("Cita agendada", "Tu cita se ha agregado al calendario.");
    }
  } catch (error) {
    console.error("Error al agendar la cita:", error);
    Alert.alert("Error", "No se pudo agendar la cita.");
  }
};

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.imagePlaceholder} />
          <View style={styles.skeletonContainer}>
            <Animated.View style={[styles.skeletonText, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.skeletonSubText, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.skeletonRow, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.skeletonRow, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.skeletonDescription, { opacity: shimmerAnim }]} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Icon name="account" size={80} color="#94A3B8" />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{doctor?.name}</Text>
          <Text style={styles.specialty}>{doctor?.description}</Text>

          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color="#FF6B2C" />
            <Text style={styles.rating}>{doctor?.rating}</Text>
            <Text style={styles.reviews}>(128 reseñas)</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="clock-outline" size={20} color="#6B7280" />
            <Text style={styles.detailText}>{doctor?.opening}</Text>
          </View>

          <View style={styles.detailRow}>
          <TouchableOpacity style={{display:'flex', flexDirection:'row'}} onPress={() => {router.push('../stackmap');}}>
              <Icon name="map-marker-outline" size={20} color="#6B7280" />
              <Text style={styles.detailTextMap}>{
                doctor?.address}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Acerca del doctor</Text>
            <Text style={styles.aboutText}>{doctor?.completeDescription}</Text>
          </View>

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Servicios</Text>
            <View style={styles.servicesList}>
              {doctor?.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.aboutText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity style={styles.mapButton}>
              <View style={{marginLeft: 10}}>
                <Icon name="map-marker-outline" size={20} color="#6f1b46" />
              </View>
              <Text style={styles.mapButtonText}>Ver en mapa</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.appointmentButton} onPress={() => router.push('/(drawer)/(tabs)/stackhome/appointment')}>
              <Text style={styles.appointmentButtonText}>Agendar cita</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => {
                
                const phoneNumber = "tel:" + doctor?.phone;
                Linking.openURL(phoneNumber);
              }}>
                <View>
                  <Icon name="phone" size={20} color="#FFFFFF" />
                </View>
              <Text style={styles.callButtonText}>Llamar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoContainer: {
    padding: 16,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonText: {
    width: "60%",
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubText: {
    width: "40%",
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonRow: {
    width: "80%",
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDescription: {
    width: "100%",
    height: 50,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
    color: "#111827",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  detailTextMap: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
  aboutSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },
  servicesList: {
    marginVertical: 10,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  bullet: {
    fontSize: 16,
    marginRight: 5,
  },
  serviceText: {
    fontSize: 16,
  },
  reviews: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  servicesSection: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginLeft: -4,
  },
  mapButton: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6f1b46",
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 5,
    
  },
  mapButtonText: {
    flex: 1,
    color: "#4f0c2e",
    fontWeight: "600",
    fontSize: 14,
  },
  appointmentButton: {
    flex: 1,
    backgroundColor: "#4f0c2e",
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  callButton: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 5,
  },
  callButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  
});

export default DoctorDetailScreen;