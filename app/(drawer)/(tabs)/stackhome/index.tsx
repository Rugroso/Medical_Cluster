"use client"

import React from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Vibration } from "react-native"
import { router, useNavigation } from "expo-router";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { Provider as PaperProvider, Searchbar } from "react-native-paper"
import { useAuth } from "@/context/AuthContext";
import { db } from "../../../../config/Firebase_Conf";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as Haptics from 'expo-haptics';
import MedCard from "@/components/MedCard";


interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
}

interface Doctor {
  doctorId: string;
  name: string;
  description: string;
  rating: number;
  opening: string;
  tags: string[];
  isOpen:boolean;
  openingFormat:string
}

export default function App() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [name, setName] = React.useState("")
  const [hour, setHour] = React.useState(0)
  const [doctor, setDoctor] = React.useState<Doctor[]>([])
  const navigation = useNavigation();
  const defColor = '#4f0b2e'
  const { user } = useAuth();
  

  const categories = [
    { name: "Médicos", icon: "medkit", type: "Ionicons" },
    { name: "Restaurantes", icon: "restaurant", type: "Ionicons" },
    { name: "Educación", icon: "school", type: "MaterialCommunityIcons" },
    { name: "Comercio", icon: "shopping", type: "MaterialCommunityIcons" },
    { name: "Deportes", icon: "football", type: "MaterialCommunityIcons" },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // @ts-ignore
    navigation.openDrawer()
  }

  const openDoctor = (doctorId:string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // @ts-ignore
    router.push({ pathname: "/(drawer)/(tabs)/stackhome/doctor", params: { doctorIdParam: doctorId } });
  }

  const getFormattedHour = (hour: string, pm:boolean) => {
    let parsedHour:number = parseInt(hour.slice(0,-3));
    if (pm) {
      return (parsedHour +12).toString();
    } else {
      return parsedHour.toString();
    }
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(drawer)/(tabs)/stackhome/categorias');
  };


  const getUserById = async (userId: string): Promise <User | null> => {
    try {
          const q = query(collection(db, "users"), where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
      
          if (!querySnapshot.empty) {
            const userData: User = {
              ...querySnapshot.docs[0].data() as User,
            };
            console.log("Usuario encontrado:", userData);
            return userData;
          } else {
            console.log("No se encontró ningún usuario con ese ID.");
            return null;
          }
        } catch (error) {
          console.error("Error obteniendo el usuario:", error);
          return null;
        }
    };
  
    const getDoctors = async (): Promise<Doctor[]> => {
      try {
        const q = query(collection(db, "doctors"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doctors: Doctor[] = querySnapshot.docs.map(doc => ({
            ...doc.data() as Doctor,
          }));
          console.log("Doctores encontrados");
          return doctors;
        } else {
          console.log("No se encontró ningún doctor.");
          return [];
        }
      } catch (error) {
        console.error("Error obteniendo doctores:", error);
        return [];
      }
    };
     
      
    React.useEffect(() => {
      console.log('doctor: ',doctor)
    },[doctor]);
  
  React.useEffect(() => {
    if (user?.uid) {
      getUserById(user.uid).then(userData => {
        if (userData) {
          console.log(userData.name);
          setName(userData.name)
        }
      });
    }
  }, [user]);

  React.useEffect(() => {
    getDoctors().then(userData => { 
      if (userData) {
        const updatedDoctors = userData.map((doc) => {
          const openingHours = doc.opening.split('-');
          let formattedAm: string = getFormattedHour(openingHours[0], false);
          let formattedPm: string = getFormattedHour(openingHours[1], true);
          let newHour: string = formattedAm.concat(' - ', formattedPm);
          return { ...doc, openingFormat: newHour };
        });
        setDoctor(updatedDoctors);
        setDoctor(prevDoctors => 
          prevDoctors.map(doc => {
            const [openingTime, closingTime] = doc.openingFormat.split(' - ').map(time => parseInt(time));
            const hour = new Date().getHours();
            return {
              ...doc,
              isOpen: (hour >= openingTime && hour < closingTime)
            };
          })
        );
     }});
  }, []);

  React.useEffect(() => {
    if (!user?.emailVerified) {
      console.log('Email sin verificar')
    }
  }, []);



  const renderIcon = (icon: string, type: string) => {
    switch (type) {
      case "FontAwesome5":
        return <FontAwesome5 name={icon} size={24} color={defColor} />
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={icon as any} size={24} color={defColor} />
      default:
        return <Ionicons name={icon as any} size={24} color={defColor} />
    }
  }

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
                <MaterialCommunityIcons name="menu" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>{getGreeting()}, {name}!</Text>

          <Searchbar
            placeholder="Médicos, Restaurantes, Servicios, etc."
            onChangeText={setSearchQuery}
            placeholderTextColor={'grey'}
            value={searchQuery}
            style={styles.searchBar}
          />

            {searchQuery.length > 0 && (
              <View>
                <View style={{marginBottom: 16}}>
                  <Text style={styles.sectionTitle}>Resultados de la búsqueda</Text>
                </View>
                 <View style={styles.medCardContainer}>
                  {doctor
                    .filter(doc => 
                      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((filteredDoctor, index) => (
                      <TouchableOpacity key={index} style={{width:"47%"}}  onPress={() => openDoctor(filteredDoctor.doctorId)}>
                        <MedCard 
                          name={filteredDoctor.name} 
                          description={filteredDoctor.description} 
                          rating={filteredDoctor.rating} 
                          opening={filteredDoctor.opening} 
                          image={""} 
                          isOpen={filteredDoctor.isOpen}
                        />
                        </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
          {searchQuery.length === 0 && (
            <View>
              <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todas las Categorías</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handlePress} >
              <Text style={styles.seeAllText}>Ver todos</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryCard} onPress={handlePress}>
                <View style={styles.categoryIcon}>{renderIcon(category.icon, category.type)}</View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Consultorios Abiertos</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={handlePress}>
                <Text style={styles.seeAllText}>Ver todos</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            </View> 

            <View style={styles.medCardContainer}>
            {doctor.filter(doc => {
              const hour = new Date().getHours();
              const [openingTime, closingTime] = doc.openingFormat.split(' - ').map(time => parseInt(time));
              return hour >= openingTime && hour < closingTime;
            }).map((filteredDoctor, index) => (
              <TouchableOpacity key={index} style={{width:"47%"}}  onPress={() => { 
                console.log('doctor seleccionado: ',filteredDoctor.doctorId)
                openDoctor(filteredDoctor.doctorId);
                }}>
                <MedCard 
                  name={filteredDoctor.name} 
                  description={filteredDoctor.description} 
                  rating={filteredDoctor.rating} 
                  opening={filteredDoctor.opening} 
                  image={""}
                  isOpen={true}
                />
              </TouchableOpacity>
            ))}
            </View>
            </View>
          )}
          
          <View style={styles.medCardContainer}>
            {/* <View style={{width:"48%"}}>
              <MedCard name={"Dr. Raul Cardenas"} description={"Dentista - Maxilofacial"} rating={4.7} opening={"7:00 am - 6:00 pm"} image={"dsad"}></MedCard>
            </View>
            <View style={{width:"48%"}}>
              <MedCard name={"Dr. Raul Payan"} description={"Cirujano General"} rating={4.5} opening={"7:00 am - 6:00 pm"} image={"dsad"}></MedCard>
            </View>
            <View style={{width:"48%"}}>
              <MedCard name={"Dr. Gabriel Ramos"} description={"Cirujano Oncólogo - Cirugía General"} rating={0} opening={"7:00 am - 6:00 pm"} image={"dsad"}></MedCard>
            </View> */}
          </View>
        </ScrollView>
      </SafeAreaView>
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
    marginBottom: 24,
  },
  medCardContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
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
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    elevation: 0,
    borderWidth: 0,
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
  }
})

