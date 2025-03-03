import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from "../../../../config/Firebase_Conf";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { useRoute } from '@react-navigation/native';


interface Doctor {
  doctorId: string;
  name: string;
  description: string;
  rating: number;
  address: string;
  completeDescription: string;
  opening: string;
  tags: string[];
  isOpen:boolean;
  openingFormat:string
  services: string[];
}

const DoctorDetailScreen = () => {
  const route = useRoute();
  const [doctor, setDoctor] = React.useState<Doctor | null>(null);
  const getDoctorById = async (doctorId: string): Promise <Doctor | null> => {
    try {
          const q = query(collection(db, "doctors"), where("doctorId", "==", doctorId));
          const querySnapshot = await getDocs(q);
      
          if (!querySnapshot.empty) {
            const userData: Doctor = {
              ...querySnapshot.docs[0].data() as Doctor,
            };
            console.log("Doctor encontrado:", userData);
            return userData;
          } else {
            console.log("No se encontró ningún doctor con ese ID.");
            return null;
          }
        } catch (error) {
          console.error("Error obteniendo el doctor:", error);
          return null;
        }
    };
    
  React.useEffect(() => {
    const { doctorIdParam } = route.params as { doctorIdParam: string };
    console.log("doctorIdParam:", doctorIdParam);
    getDoctorById(doctorIdParam).then((doctor) => {
      if (doctor) {
        setDoctor(doctor);
      } else {
        console.log("No se encontró ningún doctor con ese ID.");
      }
    }
    );
  }
  , []);

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
            <Icon name="map-marker-outline" size={20} color="#6B7280" />
            <Text style={styles.detailText}>
              {doctor?.address}
            </Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Acerca del doctor</Text>
            <Text style={styles.aboutText}>
                {doctor?.completeDescription}
            </Text>
          </View>

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Servicios</Text>
            <View style={styles.servicesList}>
              {doctor?.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.bullet}>  •</Text>
                  <Text style={styles.aboutText}>{service}</Text>
              </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.mapButton}>
          <Icon name="map-outline" size={20} color="#4f0c2e" />
          <Text style={styles.mapButtonText}>Ver en mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appointmentButton}>
          <Text style={styles.appointmentButtonText}>Agendar cita</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
    color: '#111827',
  },
  reviews: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  aboutSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  servicesSection: {
    marginBottom: 100,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4f0c2e',
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4f0c2e',
  },
  appointmentButton: {
    flex: 2,
    backgroundColor: "#4f0c2e",
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
});

export default DoctorDetailScreen;