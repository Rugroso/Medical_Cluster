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
  ImageBackground,
  Modal,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../../../config/Firebase_Conf";
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { Linking, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useAuth } from "@/context/AuthContext"
import * as Haptics from "expo-haptics"
import Swiper from 'react-native-swiper'

interface Doctor {
  doctorId: string;
  name: string;
  description: string;
  rating: number;
  ratings: [
    {
      userId: string;
      rating: number;
      comment: string;
    }
  ];
  address: string;
  completeDescription: string;
  opening: string;
  tags: string[];
  isOpen: boolean;
  openingFormat: string;
  services: string[];
  phone: string
  image: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
  website: string;
  gallery: string[];
  latitude: number;
  longitude: number;
  calendly: string;
  backgroundImage: string
}

interface User {
  id: string
  name: string
  lastName: string
  email: string
  favoriteDoctors: string[]
}

const DoctorDetailScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingNumbers, setRatingNumbers] = useState(0); 
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const { user } = useAuth()

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
    getUserById().then((user) => {
      if (user) {
        setIsFavorite(user.favoriteDoctors.includes(doctorIdParam));
      }
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

  const getUserById = async (): Promise<User | null> => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", user?.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo al usuario:", error);
      return null;
    }
  };

  const handleFavorites = async () => {
    if (isFavorite) {
      try {

        if (!user?.uid) {
          throw new Error("User ID is undefined");
        }
        const userRef = doc(db, "users", user.uid);
    
        await updateDoc(userRef, {
          favoriteDoctors: arrayRemove(doctor?.doctorId)
        });
    
      } catch (error) {
        console.error("Error al eliminar el doctor de favoritos:", error);
        Alert.alert("Error", "No se pudo eliminar el doctor de favoritos");
      }

      Alert.alert("Favoritos", "Doctor eliminado de favoritos");
    } else {
      try {
        if (!user?.uid) {
          throw new Error("User ID is undefined");
        }
        const userRef = doc(db, "users", user.uid);
    
        await updateDoc(userRef, {
          favoriteDoctors: arrayUnion(doctor?.doctorId)
        });
    
        Alert.alert("Favoritos", "Doctor añadido a favoritos");
      } catch (error) {
        console.error("Error al añadir el doctor de favoritos:", error);
        Alert.alert("Error", "No se pudo añadir el doctor de favoritos");
      }
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    
    setIsFavorite(!isFavorite);
  }

  const handleGallery = (index:number) => {
    setGalleryIndex(index);
    setOpenGallery(!openGallery);
  }

  useEffect (() => {
    if (doctor) {
      let sumRating:number = 0;
      doctor.ratings.map((rating) => {
        sumRating = rating.rating + sumRating
      })
      let averageString:string = (sumRating / doctor.ratings.length).toFixed(1);
      let average:number = parseFloat(averageString);
      setAverageRating(average);
      setRatingNumbers(doctor.ratings.length);
    }
  }, [doctor] )

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
      <View>
        <View style={styles.headerBackground}>
          <Modal
            visible={openProfileModal}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.centeredView}>
              <TouchableOpacity 
                onPress={() => setOpenProfileModal(false)} 
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Image
                source={{ uri: doctor?.image }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          </Modal>
          <ImageBackground style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}} source={
          doctor?.backgroundImage ? { uri: doctor.backgroundImage } : require('../../../../assets/doctors/info_background.jpg')}>
          <ImageBackground style={{backgroundColor:'rgba(0, 0, 0, 0.5)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
          <View style={styles.imageWrapper}>
            <TouchableOpacity onPress={() => setOpenProfileModal(true)} style={styles.imageWrapper}>
              {doctor?.image ? (
                <Image
                  source={{ uri: doctor.image }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="account" size={80} color="#94A3B8" />
                </View>
              )}
            </TouchableOpacity>
          </View>
          </ImageBackground>
          </ImageBackground>
        </View>
      </View>

        <View style={styles.infoContainer}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
            <Text style={styles.name}>{doctor?.name}</Text>
            <TouchableOpacity style={{ marginLeft: 6, marginTop: 0 }} onPress={handleFavorites}>
              {isFavorite ? (
                <MaterialCommunityIcons name="heart" size={22} color="red" />
              ) : (
                <MaterialCommunityIcons name="heart-outline" size={22} color="red" />
              )}

            </TouchableOpacity>
          </View>
          <Text style={styles.specialty}>{doctor?.description}</Text>

          <View style={styles.ratingContainer}>
            <TouchableOpacity onPress={() => {router.push({ pathname: "/(drawer)/(tabs)/stackhome/rating", params: { doctorIdParam: doctor?.doctorId } })}} style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
              <Icon name="star" size={20} color="#FF6B2C" />
              <Text style={styles.rating}>{averageRating ? averageRating : 'Sin Reseñas'}</Text>
              <Text style={styles.reviews}>({ratingNumbers === 1 ?  `${ratingNumbers} reseña` : `${ratingNumbers} reseñas`})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Icon name="clock-outline" size={20} color="#6B7280" />
            <Text style={styles.detailText}>{doctor?.opening}</Text>
          </View>

          <View style={styles.detailRow}>
          <TouchableOpacity style={{display:'flex', flexDirection:'row', alignItems:'center'}} onPress={() => {router.push({pathname: "/stackmap", params: {doctorIdParam:doctor?.doctorId, latitudeParam:doctor?.latitude, longitudeParam:doctor?.longitude}});}}>
              <Icon name="map-marker-outline" size={20} color="#6B7280" />
              <Text style={styles.detailTextMap}>{
                doctor?.address}
              </Text>
            </TouchableOpacity>
          </View>


          <View style = {{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>

            {doctor?.facebook && <TouchableOpacity style={{marginRight:8}} onPress={() => {
              Linking.openURL(doctor?.facebook || "");
            }
            }>
              <Icon name="facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
            }

            {doctor?.instagram && <TouchableOpacity style={{marginRight:8}} onPress={() => {
              Linking.openURL(doctor?.instagram || "");
            }}>
              <Icon name="instagram" size={24} color="#C13584" />
            </TouchableOpacity>
            }

            {doctor?.tiktok && <TouchableOpacity style={{marginRight:8}} onPress={() => {
              Linking.openURL(doctor?.tiktok || "");
            }}>
              <FontAwesome name="tiktok" size={24} color="#000" />
            </TouchableOpacity>
            }

            {doctor?.website && <TouchableOpacity style={{marginRight:8}} onPress={() => {
              Linking.openURL(doctor?.website || "");
            }}>
              <Icon name="web" size={24} color="#0080FF" />
            </TouchableOpacity>
            }

            {doctor?.youtube && <TouchableOpacity style={{marginRight:8}} onPress={() => {
              Linking.openURL(doctor?.website || "");
            }}>
              <Icon name="youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
            }

            {doctor?.x && <TouchableOpacity style={{marginRight:8}} onPress={() => {
              Linking.openURL(doctor?.website || "");
            }}>
              <FontAwesome6 name="x-twitter" size={24} color="#000" />
            </TouchableOpacity>
            }
          </View>

          <View style={{marginTop: 16}}>
            <Text style={styles.sectionTitle}>Galería</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
            {
                doctor?.gallery.length === 0 ? (
                  <Text style={styles.aboutText}>No hay imágenes disponibles</Text>
                ) : (
                  doctor?.gallery?.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ height: 120, width: 120, marginRight: 15 }}
                      onPress={() => handleGallery(index)}
                    >
                      <ImageBackground
                        source={{ uri: image }}
                        imageStyle={{ borderRadius: 6 }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))
                )
              }
            </ScrollView>
          </View>
        
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Acerca del doctor</Text>
            <Text style={styles.aboutText}>{doctor?.completeDescription}</Text>
          </View>

          {openGallery && (
            <Modal
              visible={openGallery}
              animationType="slide"
              transparent={true}
            >
              <View style={styles.centeredView}>
                <TouchableOpacity 
                  onPress={() => setOpenGallery(!openGallery)} 
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                
                <Swiper 
                  style={styles.wrapper} 
                  showsButtons={true}
                  buttonWrapperStyle={styles.buttonWrapper}
                  nextButton={<Text style={styles.buttonText}>›</Text>}
                  prevButton={<Text style={styles.buttonText}>‹</Text>}
                  dotStyle={styles.dot}
                  activeDotStyle={styles.activeDot}
                  index={galleryIndex}
                >
                  {doctor?.gallery?.length === 0 ? (
                    <View style={styles.slideContainer}>
                      <Text style={styles.text}>No hay imágenes disponibles</Text>
                    </View>
                  ) : (
                    doctor?.gallery.map((image, index) => (
                      <View key={index} style={styles.slideContainer}>
                        <Image
                          source={{ uri: image }}
                          style={{width:'100%', height:"100%"}}
                          resizeMode="contain"
                        />
                      </View>
                    ))
                  )}
                  
                </Swiper>
              </View>
            </Modal>
          )}

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
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.appointmentButton} 
          onPress={() => router.push({ pathname:'/(drawer)/(tabs)/stackhome/appointment', params: {calendly: doctor?.calendly || 'sin-cita', doctorIdParam: doctor?.doctorId || 'sin-id' } })}
        >
          <Text style={styles.appointmentButtonText}>Agendar cita</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => {
            const phoneNumber = "tel:" + doctor?.phone;
            Linking.openURL(phoneNumber);
          }}
        >
          <View>
            <Icon name="phone" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.callButtonText}>Llamar ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 50,
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    width: "90%",
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
    textDecorationLine: "underline",
  },
  servicesSection: {
    marginBottom: 0,
  },
  buttonContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginLeft: -4,
    backgroundColor: '#f0f0f0',
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
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
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#fff", 
  },

  headerBackground: {
    backgroundColor: '#dbdbdb',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  }

});

export default DoctorDetailScreen;