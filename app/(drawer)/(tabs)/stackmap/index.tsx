"use client"

import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
} from "react-native"
import MapView, { Marker, Callout, type Region } from "react-native-maps"
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { db } from "../../../../config/Firebase_Conf"
import { collection, query, getDocs } from "firebase/firestore"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import { useRoute } from "@react-navigation/native"

interface Rating {
  userId: string
  rating: number
  comment: string
  createdAt: string
}

interface Doctor {
  doctorId: string
  name: string
  description: string
  ratings?: Rating[]
  opening: string
  specialties?: string[]
  isOpen?: boolean
  openingFormat?: string
  image: string
  latitude: number
  longitude: number
}

interface MapViewRef {
  animateToRegion: (region: Region, duration: number) => void
}

export default function DoctorMap() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [initialRegion, setInitialRegion] = useState<Region>({
    latitude: 32.4499982,
    longitude: -114.768663592,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [modalDoctores, setModalDoctores] = useState(true)
  const translateY = useRef(new Animated.Value(0)).current
  const [showOnlyOpen, setShowOnlyOpen] = useState(false)
  
  const mapRef = useRef<MapViewRef>(null)
  const markerRefs = useRef<{ [doctorId: string]: any }>({});
  const router = useRouter()
  const route = useRoute()
  const defColor = "#4f0b2e"
  let doctorIdParam = "i"

  if (route.params === undefined) {
    // console.log("No hay parametros")
  } else {
    doctorIdParam = (route?.params as { doctorIdParam: string }).doctorIdParam
  }

  const computeRating = (doctor: Doctor): number => {
    if (doctor.ratings && doctor.ratings.length > 0) {
      return Number.parseFloat(
        (doctor.ratings.reduce((acc, curr) => acc + curr.rating, 0) / doctor.ratings.length).toFixed(1),
      )
    }
    return 0
  }

  const handleModalDoctores = () => {
    setModalDoctores(!modalDoctores)
    Animated.timing(translateY, {
      toValue: modalDoctores ? 190 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          setErrorMsg("Se requiere permiso para acceder a la ubicación")
          return
        }
        const location = await Location.getCurrentPositionAsync({})
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      } catch (error) {
        console.error("Error obteniendo ubicación:", error)
        setErrorMsg("No se pudo obtener la ubicación")
      }
    })()
  }, [])

  const getFormattedHour = (hour: string, pm: boolean) => {
    const parsedHour: number = Number.parseInt(hour.slice(0, -3))
    return pm ? (parsedHour + 12).toString() : parsedHour.toString()
  }

   const fetchDoctors = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, "doctors"))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const doctorsData: Doctor[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data() as any
            if (data.latitude && data.longitude) {
              doctorsData.push({
                ...data,
                doctorId: doc.id,
                latitude: Number.parseFloat(data.latitude),
                longitude: Number.parseFloat(data.longitude),
              })
            }
          })

          const processedDoctors = doctorsData.map((doc) => {
            const openingHours = doc.opening.split("-")
            const formattedAm: string = getFormattedHour(openingHours[0], false)
            const formattedPm: string = getFormattedHour(openingHours[1], true)
            const newHour: string = formattedAm.concat(" - ", formattedPm)

            const [openingTime, closingTime] = newHour.split(" - ").map((time) => Number.parseInt(time))
            const currentHour = new Date().getHours()
            const isOpen = currentHour >= openingTime && currentHour < closingTime

            return {
              ...doc,
              openingFormat: newHour,
              isOpen: isOpen,
            }
          })

          setDoctors(shuffleArray(processedDoctors))

          if (doctorIdParam) {
            const selectedDoc = processedDoctors.find((doc) => doc.doctorId === doctorIdParam)
            if (selectedDoc) {
              setSelectedDoctor(selectedDoc)
              setTimeout(() => {
                mapRef.current?.animateToRegion(
                  {
                    latitude: selectedDoc.latitude,
                    longitude: selectedDoc.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  1000,
                )
              }, 500)
            }
          }
        }
      } catch (error) {
        console.error("Error obteniendo doctores:", error)
        setErrorMsg("Error al cargar los datos de los doctores")
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchDoctors()
  }, [doctorIdParam])

  const handleMarkerPress = (doctor: Doctor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedDoctor(doctor)
  }

  const navigateToDoctor = (doctorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({ pathname: "/(drawer)/(tabs)/stackmap/doctor", params: { doctorIdParam: doctorId } })
  }

  const centerMapOnDoctor = (doctor: Doctor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    mapRef.current?.animateToRegion(
      {
        latitude: doctor.latitude,
        longitude: doctor.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    )
  }

  const centerMapOnUser = () => {
    if (userLocation) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      )
    }
  }

  const filteredDoctors = showOnlyOpen ? doctors.filter((doc) => doc.isOpen) : doctors

  const hasOpenDoctors = doctors.some((doc) => doc.isOpen)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={defColor} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    )
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef as any}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={true}
        showsIndoors={true}
      >
        {filteredDoctors.map((doctor) => (
          <Marker
            ref={(ref) => {
              if (ref) {
                markerRefs.current[doctor.doctorId] = ref;
              }
            }}
            key={doctor.doctorId}
            coordinate={{
              latitude: doctor.latitude,
              longitude: doctor.longitude,
            }}
            onPress={() => {
              handleMarkerPress(doctor)
              if (Platform.OS === "android") {
                // For Android, show doctor info in bottom sheet instead of callout
                setSelectedDoctor(doctor)
                // Make sure bottom panel is visible on Android when marker is pressed
                if (!modalDoctores) {
                  setModalDoctores(true)
                  Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start()
                }
              }
            }}
          >
            {Platform.OS === "ios" ? (
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.markerImageContainer,
                    selectedDoctor?.doctorId === doctor.doctorId && styles.selectedMarker,
                  ]}
                >
                  {doctor.image ? (
                    <Image source={{ uri: doctor.image }} style={styles.markerImage} resizeMode="cover" />
                  ) : (
                    <FontAwesome5 name="user-md" size={20} color="#FFF" />
                  )}
                </View>
                <View style={[styles.statusDot, { backgroundColor: doctor.isOpen ? "#4CAF50" : "#F44336" }]} />
              </View>
            ) : (
              <View style={styles.markerContainerAndroid}>
                <View
                  style={[
                    styles.markerImageContainerAndroid,
                    selectedDoctor?.doctorId === doctor.doctorId && styles.selectedMarkerAndroid,
                  ]}
                >
                  {doctor.image ? (
                    <Image source={{ uri: doctor.image }} style={styles.markerImageAndroid} resizeMode="cover" />
                  ) : (
                    <FontAwesome5 name="user-md" size={20} color="#FFF" />
                  )}
                </View>
              </View>
            )}

            {Platform.OS === "ios" && (
              <Callout onPress={() => navigateToDoctor(doctor.doctorId)}>
                <View style={styles.calloutContainer}>
                  <View style={styles.calloutHeader}>
                    <Image source={{ uri: doctor.image || "" }} style={styles.calloutImage} />
                    <View style={styles.calloutHeaderText}>
                      <Text style={styles.calloutTitle}>{doctor.name}</Text>
                      {doctor.specialties && doctor.specialties.length > 0 && (
                        <Text style={styles.calloutSpecialty}>{doctor.specialties[0]}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.calloutBody}>
                    <Text style={styles.calloutDescription} numberOfLines={2}>
                      {doctor.description || "Sin descripción disponible"}
                    </Text>

                    <View style={styles.calloutRating}>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <MaterialCommunityIcons
                            key={i}
                            name="star"
                            size={12}
                            color={i < Math.floor(computeRating(doctor)) ? "#FF6B2C" : "#E0E0E0"}
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      <Text style={styles.calloutRatingText}>{computeRating(doctor)}</Text>
                    </View>

                    <View style={styles.calloutStatus}>
                      <View
                        style={[styles.statusIndicator, { backgroundColor: doctor.isOpen ? "#4CAF50" : "#F44336" }]}
                      />
                      <Text style={styles.calloutStatusText}>{doctor.isOpen ? "Abierto ahora" : "Cerrado"}</Text>
                      <Text style={styles.calloutHours}>{doctor.opening}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.calloutButton}>
                    <Text style={styles.calloutButtonText}>Ver perfil</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>

      {Platform.OS === "android" && selectedDoctor && (
        <View style={styles.androidDoctorInfoContainer}>
          <TouchableOpacity
            style={styles.androidDoctorInfoCard}
            onPress={() => navigateToDoctor(selectedDoctor.doctorId)}
          >
            <View style={styles.androidDoctorInfoHeader}>
              <Image source={{ uri: selectedDoctor.image || "" }} style={styles.androidDoctorInfoImage} />
              <View style={styles.androidDoctorInfoHeaderText}>
                <Text style={styles.androidDoctorInfoTitle}>{selectedDoctor.name}</Text>
                {selectedDoctor.specialties && selectedDoctor.specialties.length > 0 && (
                  <Text style={styles.androidDoctorInfoSpecialty}>{selectedDoctor.specialties[0]}</Text>
                )}

                <View style={styles.androidDoctorInfoRating}>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name="star"
                        size={14}
                        color={i < Math.floor(computeRating(selectedDoctor)) ? "#FF6B2C" : "#E0E0E0"}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  <Text style={styles.androidDoctorInfoRatingText}>{computeRating(selectedDoctor)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.androidDoctorInfoCloseButton} onPress={() => setSelectedDoctor(null)}>
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.androidDoctorInfoBody}>
              <Text style={styles.androidDoctorInfoDescription} numberOfLines={2}>
                {selectedDoctor.description || "Sin descripción disponible"}
              </Text>

              <View style={styles.androidDoctorInfoStatus}>
                <View
                  style={[styles.statusIndicator, { backgroundColor: selectedDoctor.isOpen ? "#4CAF50" : "#F44336" }]}
                />
                <Text style={styles.androidDoctorInfoStatusText}>
                  {selectedDoctor.isOpen ? "Abierto ahora" : "Cerrado"}
                </Text>
                <Text style={styles.androidDoctorInfoHours}>{selectedDoctor.opening}</Text>
              </View>
            </View>

            <View style={styles.androidDoctorInfoFooter}>
              <Text style={styles.androidDoctorInfoButtonText}>Ver perfil</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#4f0b2e" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mapControls}>
        {userLocation && (
          <TouchableOpacity style={styles.controlButton} onPress={centerMapOnUser}>
            <MaterialIcons name="my-location" size={24} color="#4f0b2e" />
          </TouchableOpacity>
        )}

        {selectedDoctor && (
          <TouchableOpacity style={styles.controlButton} onPress={() => centerMapOnDoctor(selectedDoctor)}>
            <FontAwesome5 name="map-marker-alt" size={24} color="#4f0b2e" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, showOnlyOpen && styles.activeControlButton]}
          onPress={() => setShowOnlyOpen(!showOnlyOpen)}
        >
          <MaterialCommunityIcons name="clock-outline" size={24} color={showOnlyOpen ? "#FFF" : "#4f0b2e"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton]}
          onPress={() => fetchDoctors()}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#4f0b2e"/>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.bottomPanel, { transform: [{ translateY }] }]}>
        <View style={styles.bottomPanelHeader}>
          <Text style={styles.bottomPanelTitle}>
            {showOnlyOpen ? "Consultorios Abiertos" : "Todos los Consultorios"}
          </Text>
          <View style={styles.bottomPanelActions}>
            <TouchableOpacity
              style={[styles.filterButton, showOnlyOpen && styles.activeFilterButton]}
              onPress={() => setShowOnlyOpen(!showOnlyOpen)}
            >
              <Text style={[styles.filterButtonText, showOnlyOpen && styles.activeFilterButtonText]}>
                {showOnlyOpen ? "Mostrar todos" : "Solo abiertos"}
              </Text>
            </TouchableOpacity>

            {modalDoctores ? (
              <TouchableOpacity style={styles.toggleButton} onPress={handleModalDoctores}>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#333" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.toggleButton} onPress={handleModalDoctores}>
                <MaterialIcons name="keyboard-arrow-up" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {filteredDoctors.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.doctorsList}>
            {filteredDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.doctorId}
                style={[styles.doctorCard, selectedDoctor?.doctorId === doctor.doctorId && styles.selectedDoctorCard]}
                onPress={() => {
                  handleMarkerPress(doctor)
                  centerMapOnDoctor(doctor)
                  setSelectedDoctor(doctor)
                  if (Platform.OS === "ios") {
                    setTimeout(() => {
                      markerRefs.current[doctor.doctorId]?.showCallout();
                    }, 1100);
                  }
                }}
              >
                <View style={{ overflow: "hidden", height: 80 }}>
                  <Image
                    source={{ uri: doctor.image || "" }}
                    style={{ width: "100%", height: undefined, aspectRatio: 1 }}
                    resizeMode="cover"
                  />
                </View> 
                <View style={styles.doctorCardContent}>
                  <Text style={styles.doctorCardName} numberOfLines={1}>
                    {doctor.name}
                  </Text>
                  {doctor.specialties && doctor.specialties.length > 0 && (
                    <Text style={styles.doctorCardSpecialty} numberOfLines={1}>
                      {doctor.specialties[0]}
                    </Text>
                  )}
                  <View style={styles.doctorCardRating}>
                    <MaterialCommunityIcons name="star" size={16} color="#FF6B2C" />
                    {computeRating(doctor) === 0 ? (
                      <Text style={styles.doctorCardRatingText}>Sin Reseñas</Text>
                    ) : (
                      <Text style={styles.doctorCardRatingText}>{computeRating(doctor)}</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.doctorCardStatus, { backgroundColor: doctor.isOpen ? "" : "#F44336" }]}>
                  <Text style={styles.doctorCardStatusText}>{!doctor.isOpen && "Cerrado"}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="clock-time-eight-outline" size={50} color="#4f0b2e" />
            <Text style={styles.emptyStateTitle}>No hay consultorios abiertos</Text>
            <Text style={styles.emptyStateDescription}>En este momento todos los consultorios están cerrados.</Text>
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4f0b2e",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  markerImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f0b2e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  selectedMarker: {
    borderColor: "#FFD700",
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFF",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  markerContainerAndroid: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  markerImageContainerAndroid: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#4f0b2e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  selectedMarkerAndroid: {
    borderColor: "#FFD700",
    borderWidth: 1.5,
    transform: [{ scale: 1.0 }],
  },
  markerImageAndroid: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  statusDotAndroid: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFF",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  calloutContainer: {
    width: width * 0.6,
    padding: 12,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  calloutImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  calloutHeaderText: {
    flex: 1,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  calloutSpecialty: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  calloutBody: {
    marginBottom: 10,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  calloutRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  calloutRatingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  calloutStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  calloutStatusText: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  calloutHours: {
    fontSize: 12,
    color: "#666",
  },
  calloutButton: {
    backgroundColor: "#4f0b2e",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  calloutButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  mapControls: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "column",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeControlButton: {
    backgroundColor: "#4f0b2e",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPanelHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomPanelTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  bottomPanelActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#4f0b2e",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#333",
  },
  activeFilterButtonText: {
    color: "#FFF",
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorsList: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  doctorCard: {
    width: 140,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 4,
    marginTop: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDoctorCard: {
    borderColor: "#4f0b2e",
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  doctorCardImage: {
    width: "100%",
    height: 80,
    alignSelf: "flex-start"
  },
  doctorCardContent: {
    padding: 8,
  },
  doctorCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  doctorCardSpecialty: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  doctorCardRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorCardRatingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  doctorCardStatus: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  doctorCardStatusText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: "#4f0b2e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  androidDoctorInfoContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  androidDoctorInfoCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  androidDoctorInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  androidDoctorInfoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  androidDoctorInfoHeaderText: {
    flex: 1,
  },
  androidDoctorInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  androidDoctorInfoSpecialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  androidDoctorInfoRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  androidDoctorInfoRatingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  androidDoctorInfoCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  androidDoctorInfoBody: {
    marginBottom: 12,
  },
  androidDoctorInfoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  androidDoctorInfoStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  androidDoctorInfoStatusText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
    marginLeft: 6,
  },
  androidDoctorInfoHours: {
    fontSize: 14,
    color: "#666",
  },
  androidDoctorInfoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  androidDoctorInfoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f0b2e",
    marginRight: 4,
  },
})
