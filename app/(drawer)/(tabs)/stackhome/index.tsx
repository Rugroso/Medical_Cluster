"use client"

import * as React from "react"
import type { JSX } from "react"
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Animated, Easing, RefreshControl } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { router, useNavigation } from "expo-router"
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"
import { Searchbar } from "react-native-paper"
import { useAuth } from "@/context/AuthContext"
import { db } from "../../../../config/Firebase_Conf"
import { collection, query, where, getDocs } from "firebase/firestore"
import * as Haptics from "expo-haptics"
import MedCardSM from "@/components/MedCardSM"
import { KeyboardAvoidingView, Platform } from "react-native"
import Weather from "@/components/weather"

interface User {
  id: string
  name: string
  lastName: string
  email: string
}

interface Doctor {
  doctorId: string
  name: string
  description: string
  rating: number
  opening: string
  tags: string[]
  isOpen: boolean
  openingFormat: string
  specialties: string[]
  ratings: {
    comment: string
    createdAt: string
    rating: number
    userId: string
  }[]
  image: string
}

export default function App() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [name, setName] = React.useState("")
  const [doctor, setDoctor] = React.useState<Doctor[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const navigation = useNavigation()
  const defColor = "#4f0b2e"
  const { user } = useAuth()
  const shimmerAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
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
      ]),
    ).start()
  }, [])

  const categories = [
    {
      id: "1",
      title: "Cardiología",
      icon: "heart",
      path: "./especialidades/cardiologia",
      type: "MaterialCommunityIcons",
      params: "Cardiología",
    },
    {
      id: "4",
      title: "Odontologia",
      icon: "tooth",
      path: "./especialidades/gastroenterologia",
      type: "MaterialCommunityIcons",
      params: "Odontología",
    },
    {
      id: "8",
      title: "Neumología",
      icon: "lungs",
      path: "./especialidades/neumologia",
      type: "MaterialCommunityIcons",
      params: "Neumología",
    },
    {
      id: "10",
      title: "Oftalmología",
      icon: "eye",
      path: "./especialidades/oftalmologia",
      type: "MaterialCommunityIcons",
      params: "Oftalmología",
    },
    {
      id: "9",
      title: "Neurología",
      icon: "brain",
      path: "./especialidades/neurologia",
      type: "MaterialCommunityIcons",
      params: "Neurología",
    },
    {
      id: "14",
      title: "Psicología",
      icon: "chat",
      path: "./especialidades/psicología",
      type: "MaterialCommunityIcons",
      params: "Psicología",
    },
    {
      id: "10",
      title: "Oftalmología",
      icon: "eye",
      path: "./especialidades/oftalmologia",
      type: "MaterialCommunityIcons",
      params: "Oftalmología",
    },
    {
      id: "12",
      title: "Ortopedia",
      icon: "seat-legroom-normal",
      path: "./especialidades/ortopedia",
      type: "MaterialCommunityIcons",
      params: "Ortopedia",
    },
    {
      id: "13",
      title: "Pediatría",
      icon: "human-child",
      path: "./especialidades/pediatria",
      type: "MaterialCommunityIcons",
      params: "Pediatría",
    },
    {
      id: "19",
      title: "Cirugía General",
      icon: "doctor",
      path: "./especialidades/cirugia-general",
      type: "MaterialCommunityIcons",
      params: "Cirugía General",
    },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Buenos días"
    if (hour >= 12 && hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // @ts-ignore
    navigation.openDrawer()
  }

  const openDoctor = (doctorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({ pathname: "/(drawer)/(tabs)/stackhome/doctor", params: { doctorIdParam: doctorId } })
  }

  const getFormattedHour = (hour: string, pm: boolean) => {
    const parsedHour: number = Number.parseInt(hour.slice(0, -3))
    if (pm) {
      return (parsedHour + 12).toString()
    } else {
      return parsedHour.toString()
    }
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push("/(drawer)/(tabs)/stackhome/categorias")
  }

  const handlePressSingleCat = (category: string, params: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({ pathname: "/(drawer)/(tabs)/stackhome/categorias/medicos", params: { specialty: params } })
  }

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userData: User = {
          ...(querySnapshot.docs[0].data() as User),
        }
        return userData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  const getDoctors = async (): Promise<Doctor[]> => {
    try {
      const q = query(collection(db, "doctors"))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doctors: Doctor[] = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Doctor),
        }))
        return doctors
      } else {
        return []
      }
    } catch (error) {
      return []
    }
  }

  const loadData = async (): Promise<void> => {
    setLoading(true)
    try {
      if (user?.uid) {
        const userData = await getUserById(user.uid)
        if (userData) {
          setName(userData.name)
        }
      }

      const doctorsData = await getDoctors()
      if (doctorsData.length > 0) {
        const updatedDoctors = doctorsData.map((doc) => {
          const openingHours = doc.opening.split("-")
          const formattedAm: string = getFormattedHour(openingHours[0], false)
          const formattedPm: string = getFormattedHour(openingHours[1], true)
          const newHour: string = formattedAm.concat(" - ", formattedPm)
          return { ...doc, openingFormat: newHour }
        })

        const doctorsWithOpenStatus = updatedDoctors.map((doc) => {
          const [openingTime, closingTime] = doc.openingFormat.split(" - ").map((time) => Number.parseInt(time))
          const hour = new Date().getHours()
          return {
            ...doc,
            isOpen: hour >= openingTime && hour < closingTime,
          }
        })

        const completeDoctor = doctorsWithOpenStatus.map((doc) => {
          let sum = 0
          doc.ratings.map((rating) => {
            sum = sum + rating.rating
          })
          let average = sum / doc.ratings.length
          if (isNaN(average)) {
            average = 0
          }
          return {
            ...doc,
            rating: average,
          }
        })

        const shuffledDoctors = [...completeDoctor].sort(() => Math.random() - 0.5)
        setDoctor(shuffledDoctors)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = React.useCallback(async (): Promise<void> => {
    setRefreshing(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    try {
      await loadData()
    } catch (error) {
    } finally {
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [])

  const placeholderData: string = `¿Qué sientes hoy? | Doctor | Especialidad`

  const renderIcon = (icon: string, type: string): JSX.Element => {
    switch (type) {
      case "FontAwesome5":
        return <FontAwesome5 name={icon} size={24} color={defColor} />
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={icon as any} size={24} color={defColor} />
      default:
        return <Ionicons name={icon as any} size={24} color={defColor} />
    }
  }

  const openDoctors = doctor.filter((doc) => {
    const hour = new Date().getHours()
    const [openingTime, closingTime] = doc.openingFormat.split(" - ").map((time) => Number.parseInt(time))
    return hour >= openingTime && hour < closingTime
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
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
          <View style={styles.header}></View>
          <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
            <Text style={styles.greeting}>
              {getGreeting()}, {name}
            </Text>
            <View style={{ alignItems: "flex-end", marginTop: -15, width: "30%" }}>
              <Weather loading={loading} setLoading={setLoading} />
            </View>
          </View>

          <Searchbar
            placeholder={placeholderData}
            onChangeText={setSearchQuery}
            placeholderTextColor={"grey"}
            selectionColor={defColor}
            value={searchQuery}
            style={styles.searchBar}
          />

          {searchQuery.length > 0 && (
            <View>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sectionTitle}>Resultados de la búsqueda</Text>
              </View>
              <View style={styles.medCardContainer}>
                {doctor
                  .filter(
                    (doc) =>
                      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.specialties.some((specialty) =>
                        specialty.toLowerCase().includes(searchQuery.toLowerCase()),
                      ) ||
                      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                  )
                  .map((filteredDoctor, index) => (
                    <View key={index} style={{ width: "100%" }}>
                      <TouchableOpacity
                        key={index}
                        style={{ width: "100%" }}
                        onPress={() => openDoctor(filteredDoctor.doctorId)}
                      >
                        <MedCardSM
                          name={filteredDoctor.name}
                          description={filteredDoctor.description}
                          rating={filteredDoctor.rating}
                          opening={filteredDoctor.opening}
                          image={filteredDoctor.image}
                          isOpen={filteredDoctor.isOpen}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                {doctor.filter(
                  (doc) =>
                    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.specialties.some((specialty) => specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                ).length === 0 && (
                  <View style={{ alignItems: "center", justifyContent: "center", flex: 1, width: "100%" }}>
                    <Ionicons name="help-circle" size={80} color="#ccc" />
                    <Text style={{ flex: 1, width: "100%", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
                      No se encontraron resultados
                    </Text>
                    <Text style={{ flex: 1, width: "100%", textAlign: "center" }}>
                      Intenta con otros filtros o términos de búsqueda
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          {searchQuery.length === 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Especialidades</Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={handlePress}>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoryCard}
                    onPress={() => handlePressSingleCat(category.path, category.params as any)}
                  >
                    <View style={styles.categoryIcon}>{renderIcon(category.icon, category.type)}</View>
                    <Text style={styles.categoryName}>{category.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Consultorios Abiertos</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => handlePressSingleCat("medicos", "noparams")}
                >
                  <Text style={styles.seeAllText}>Ver todos</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={[styles.loadingIndicator, { opacity: shimmerAnim }]} />
                  <Animated.View style={[styles.loadingIndicator, { opacity: shimmerAnim, marginTop: 12 }]} />
                </View>
              ) : openDoctors.length > 0 ? (
                <View style={styles.medCardContainer}>
                  {openDoctors.map((filteredDoctor, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ width: "100%" }}
                      onPress={() => {
                        openDoctor(filteredDoctor.doctorId)
                      }}
                    >
                      <MedCardSM
                        name={filteredDoctor.name}
                        description={filteredDoctor.description}
                        rating={filteredDoctor.rating}
                        opening={filteredDoctor.opening}
                        image={filteredDoctor.image}
                        isOpen={true}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateCard}>
                    <View style={styles.emptyStateIconContainer}>
                      <MaterialCommunityIcons name="clock-time-eight-outline" size={50} color="#4f0b2e" />
                    </View>
                    <Text style={styles.emptyStateTitle}>No hay consultorios abiertos</Text>
                    <Text style={styles.emptyStateDescription}>
                      En este momento todos los consultorios están cerrados. Puedes revisar más tarde o agendar una cita
                      para otro día.
                    </Text>

                    <View style={styles.emptyStateActions}>
                      <TouchableOpacity
                        style={styles.emptyStatePrimaryButton}
                        onPress={() => handlePressSingleCat("medicos", "noparams")}
                      >
                        <Text style={styles.emptyStatePrimaryButtonText}>Ver todos los médicos</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  medCardContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 999,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 24,
    width: "70%",
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    elevation: 0,
    borderWidth: 0,
    paddingRight: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#666",
    marginRight: 4,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: "center",
  },
  categoryIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  loadingContainer: {
    width: "100%",
    padding: 16,
  },
  loadingIndicator: {
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  emptyStateContainer: {
    width: "100%",
    paddingVertical: 16,
    marginBottom: 24,
  },
  emptyStateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f9e6ee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateActions: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyStatePrimaryButton: {
    flex: 1,
    backgroundColor: "#4f0b2e",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  emptyStatePrimaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyStateSecondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4f0b2e",
  },
  emptyStateSecondaryButtonText: {
    color: "#4f0b2e",
    fontWeight: "600",
    fontSize: 14,
  },
  nextOpeningContainer: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextOpeningTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  nextOpeningTime: {
    fontSize: 14,
    color: "#333",
    fontWeight: "700",
  },
})
