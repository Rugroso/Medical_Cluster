import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native"
import { router } from "expo-router"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import "react-native-get-random-values"
import { storage } from "../../../../config/Firebase_Conf"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { setDoc, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "../../../../config/Firebase_Conf"
import TimeSelector from "@/components/TimeSelector"
import * as ImagePicker from "expo-image-picker"
import { v4 as uuidv4 } from "uuid"
import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
import { MultipleSelectList } from 'react-native-dropdown-select-list'



export default function AddDoctor() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [completeDescription, setCompleteDescription] = useState("")
  const [address, setAddress] = useState("")
  const [opening, setOpening] = useState("8:00 am - 5:00 pm")
  const [phone, setPhone] = useState("")
  const [rating] = useState(0.0)
  const [services, setServices] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newService, setNewService] = useState("")
  const [newTag, setNewTag] = useState("")
  const [gallery, setGallery] = useState<string[]>([])
  const [calendly, setCalendly] = useState("")
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [x , setX] = useState ('')
  const [tiktok, setTiktok] = useState('')
  const [website, SetWebsite] = useState('')
  const [backgroundImage, setBackgroundImage] = useState('')

  const context = useImageManipulator(image || '');

  const [specialties, setSpecialties] = useState<string[]>([])
  
  const [dataSpecialties, setDataSpecialties] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const q = query(collection(db, "specialties"), orderBy("title"));
        const snapshot = await getDocs(q);
        const specialtiesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            key: doc.id,
            value: data.title,
          };
        });
        setDataSpecialties(specialtiesList);
      } catch (error) {
        console.error("Error fetching specialties:", error);
      }
    };
  
    fetchSpecialties();
  }, []);

  const generateNewImage = async () => { 
    context.resize({ width: 1000, height: 1000 });
    const image = await context.renderAsync();
    const result = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8,
    });
    return result;
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()])
      setNewService("")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services]
    updatedServices.splice(index, 1)
    setServices(updatedServices)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleRemoveTag = (index: number) => {
    const updatedTags = [...tags]
    updatedTags.splice(index, 1)
    setTags(updatedTags)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen")
    }
  }

  const pickBackgroundImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBackgroundImage(result.assets[0].uri)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen")
    }
  }

  const pickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        aspect: [3, 4],
        quality: 0.5,
        allowsMultipleSelection: true,
      })
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setGallery(result.assets.map((asset) => asset.uri))
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen")
    }
  }

  const getGallery = async () => {
      let galleryUrls: string[] = []
      await Promise.all(gallery.map(async (uri, index) => {
      const response = fetch(uri)
      const blob = await (await response).blob()
      const imageName = `doctors/${name}_gallery${index}.jpg`
      const storageRef = ref(storage, imageName)
      const uploadTask = uploadBytesResumable(storageRef, blob)
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          },
          (error) => {
            reject(error)
          },
          async () => {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
            galleryUrls.push(imageUrl)
            resolve(null)
          },
        )
      })
    }))
    if (galleryUrls.length === 0) { 
      return []
    }

    return galleryUrls
  }


  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del doctor es obligatorio")
      return false
    }

    if (!description.trim()) {
      Alert.alert("Error", "La descripción corta es obligatoria")
      return false
    }

    if (!address.trim()) {
      Alert.alert("Error", "La dirección es obligatoria")
      return false
    }

    if (!phone.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio")
      return false
    }

    if (specialties.length === 0) {
      Alert.alert("Error", "Debe agregar al menos una especialidad")
      return false
    }

    if (tags.length === 0) {
      Alert.alert("Error", "Debe agregar al menos un tag")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      let imageUrl = ""

      if (image) {

        const newImage = await generateNewImage()

        const response = fetch(newImage.uri)
        
        const blob = await (await response).blob()

        const imageName = `doctors/${name}.jpg`
        const storageRef = ref(storage, imageName)

        const uploadTask = uploadBytesResumable(storageRef, blob)

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            },
            (error) => {
              reject(error)
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
              resolve(null)
            },
          )
        })
      }

      let galleryUrls: string[] = await getGallery()
      
      const doctorData = {
        doctorId: uuidv4(),
        name,
        description,
        completeDescription,
        address,
        phone,
        opening,
        rating,
        specialties,
        services,
        tags,
        image: imageUrl,
        gallery: galleryUrls,
        latitude,
        longitude,
        ratings:[],
        calendly,
        facebook,
        instagram,
        x,
        tiktok,
        website,
        backgroundImage,
        createdAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "doctors"), doctorData)
      const updatedDoctorData = { ...doctorData, doctorId: docRef.id }
      await setDoc(docRef, updatedDoctorData)

      setLoading(false)
      Alert.alert("Éxito", `Doctor ${name} agregado correctamente`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      setLoading(false)
      Alert.alert("Error", "No se pudo agregar el doctor")
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Información Básica</Text>

            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.doctorImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={32} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Agregar foto</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Doctor</Text>
              <TextInput 
              style={styles.input} 
              placeholder="Dr. Juan Pérez" 
              value={name} 
              onChangeText={(text) => setName(text.slice(0, 30))}
              placeholderTextColor={"#999"}

              />
              <Text style={{color:'gray', marginTop:8}}>{name.length}/30</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción Corta</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardiólogo especialista en..."
                value={description}
                onChangeText={(text) => setDescription(text.slice(0, 40))}
                placeholderTextColor={"#999"}
              />
              <Text style={{color:'gray', marginTop:8}}>{description.length}/40</Text>
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción Completa</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Información detallada sobre el doctor..."
                value={completeDescription}
                onChangeText={(text) => setCompleteDescription(text.slice(0, 200))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={"#999"}
              />
              <Text style={{color:'gray', marginTop:8}}>{completeDescription.length}/200</Text>

            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Especialidades</Text>
              <View style={styles.tagInputContainer}>
              <MultipleSelectList 
                  setSelected={(val:any) => setSpecialties(val)} 
                  label="Especialidades Seleccionadas" 
                  labelStyles={{fontWeight:400}}
                  data={dataSpecialties} 
                  save="value"
                  placeholder="Selecciona las especialides del médico"
                  inputStyles={{width:'94%'}}
                  dropdownStyles={{width:350}}
                  maxHeight={300}
              />
              </View>

            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección</Text>
              <TouchableOpacity style={styles.addressInput} onPress={() => setAddressModalVisible(true)}>
                <Text style={address ? styles.addressText : styles.addressPlaceholder}>
                  {address || "Buscar dirección"}
                </Text>
                <Feather name="map-pin" size={20} color="#4f0b2e" />
              </TouchableOpacity>

              {latitude && longitude && (
                <Text style={styles.coordinatesText}>
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="123-456-7890"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor={"#999"}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.facebook.com/medico"
                value={facebook}
                placeholderTextColor={"#999"}
                onChangeText={setFacebook}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.instagram.com/medico"
                value={instagram}
                placeholderTextColor={"#999"}
                onChangeText={setInstagram}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>X (Twitter)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://x.com/medico"
                value={x}
                placeholderTextColor={"#999"}
                onChangeText={setX}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TitTok</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.tiktok.com/medico"
                value={tiktok}
                placeholderTextColor={"#999"}
                onChangeText={setTiktok}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Página Web</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.medico.com"
                value={website}
                placeholderTextColor={"#999"}
                onChangeText={SetWebsite}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL de Calendly</Text>
              <TextInput
                style={styles.input}
                placeholder="https://calendly.com/medico/consulta"
                value={calendly}
                placeholderTextColor={"#999"}
                onChangeText={setCalendly}
              />
            </View>
            
            <TimeSelector value={opening} onChange={setOpening} label="Horario" />
            

          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Galería</Text>

            <View style={styles.tagInputContainer}>
              <View>
                {gallery.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                    {gallery.map((uri, index) => (
                      <View key={index}>
                        <View style={{ position: "absolute", top: 6, right: 12, zIndex: 1 }}>
                          <TouchableOpacity onPress={() => {
                            const updatedGallery = [...gallery]
                            updatedGallery.splice(index, 1)
                            setGallery(updatedGallery)
                          }
                          }>
                            <View style={{ borderRadius: 60, backgroundColor: "#f5f5f5", justifyContent: "center", alignItems: "center", width: 22, height: 22}}>
                                <Feather name="x" size={16} color={'gray'}></Feather>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <Image key={index} source={{ uri }} style={styles.galleryPlacholder} />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ width: "100%" }}>
                    <TouchableOpacity onPress={pickGallery}>
                      <View style={styles.galleryPlacholder}>
                        <Feather name="image" size={32} color="#999" />
                        <Text style={styles.imagePlaceholderText}>Agregar fotos</Text>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                )}
               
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Foto de Portada</Text>

            <View style={styles.tagInputContainer}>
              <View>
                {backgroundImage ? (
                  <View>
                    <View style={{ position: "absolute", top: 6, right: 12, zIndex: 1 }}>
                      <TouchableOpacity onPress={() => setBackgroundImage('')}>
                        <View style={{ borderRadius: 60, backgroundColor: "#f5f5f5", justifyContent: "center", alignItems: "center", width: 22, height: 22}}>
                            <Feather name="x" size={16} color={'gray'}></Feather>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <Image source={{ uri: backgroundImage }} style={styles.galleryPlacholder} />
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity onPress={pickBackgroundImage}>
                      <View style={styles.galleryPlacholder}>
                        <Feather name="image" size={32} color="#999" />
                        <Text style={styles.imagePlaceholderText}>Agregar foto</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
               
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Servicios</Text>

            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Agregar servicio"
                value={newService}
                placeholderTextColor={"#999"}
                onChangeText={setNewService}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddService}>
                <Feather name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {services.map((service, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{service}</Text>
                  <TouchableOpacity onPress={() => handleRemoveService(index)}>
                    <Feather name="x" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Tags</Text>

            <View style={styles.tagInputContainer}>
              <TextInput 
              style={styles.tagInput} 
              placeholder="Agregar tag" 
              value={newTag} 
              placeholderTextColor={"#999"}
              onChangeText={setNewTag} 
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                <Feather name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                    <Feather name="x" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAddressModalVisible(false)}
      >
         <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalBackButton} onPress={() => setAddressModalVisible(false)}>
                <MaterialIcons name="arrow-back" size={24} color="#4f0b2e" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Buscar dirección</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.googlePlacesContainer}>
              <GooglePlacesAutocomplete
                placeholder="Search"
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
                  language: 'es',
                }}
                autoFillOnNotFound={false}
                currentLocation={false}
                currentLocationLabel="Current location"
                debounce={0}
                disableScroll={false}
                enableHighAccuracyLocation={true}
                enablePoweredByContainer={true}
                fetchDetails={true}
                filterReverseGeocodingByTypes={[]}
                GooglePlacesDetailsQuery={{}}
                GoogleReverseGeocodingQuery={{}}
                isRowScrollable={true}
                keyboardShouldPersistTaps="always"
                listUnderlayColor="#c8c7cc"
                listViewDisplayed="auto"
                keepResultsAfterBlur={false}
                minLength={1}
                nearbyPlacesAPI="GooglePlacesSearch"
                numberOfLines={1}
                onFail={() => {}}
                onNotFound={() => {}}
                onPress={(data, details = null) => {
                  setAddress(data.description)
                  if (details && details.geometry && details.geometry.location) {
                    setLatitude(details.geometry.location.lat)
                  }
                  if (details?.geometry?.location?.lng) {
                    setLongitude(details.geometry.location.lng)
                  }
                  setAddressModalVisible(false)
                }}
                onTimeout={() =>
                  console.warn('google places autocomplete: request timeout')
                }
                predefinedPlaces={[]}
                predefinedPlacesAlwaysVisible={false}
                styles={{}}
                suppressDefaultStyles={false}
                textInputHide={false}
                textInputProps={{
                  defaultValue: address,
                }}
                timeout={20000}
              />
            </View>
          </SafeAreaView>
              </Modal>
            </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#4f0b2e",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  doctorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  galleryPlacholder: {
    width: 120,
    height: 120,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    marginRight: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width:'100%'
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#4f0b2e",
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9e6ee",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#4f0b2e",
    marginRight: 6,
  },
  addressInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  addressPlaceholder: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  googlePlacesContainer: {
    flex: 1,
    padding: 16,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#4f0b2e",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalBackButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
})

