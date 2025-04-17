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
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as Haptics from "expo-haptics"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import "react-native-get-random-values"
import { storage } from "../../../../config/Firebase_Conf"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../../../config/Firebase_Conf"
import { SaveFormat, useImageManipulator } from "expo-image-manipulator"
import { MultipleSelectList } from "react-native-dropdown-select-list"
import TimeSelector from "@/components/TimeSelector"





export default function EditDoctor() {
  const params = useLocalSearchParams()
  const doctorId = params.doctorId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [completeDescription, setCompleteDescription] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [address, setAddress] = useState("")
  const [opening, setOpening] = useState("8:00AM-5:00PM")
  const [phone, setPhone] = useState("")
  const [rating, setRating] = useState(0.0)
  const [services, setServices] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [latitude, setLatitude] = useState(32.4499982)
  const [longitude, setLongitude] = useState(-114.768663592)
  const [tags, setTags] = useState<string[]>([])
  const [gallery, setGallery] = useState<string[]>([])
  const [calendly, setCalendly] = useState('')
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newService, setNewService] = useState("")
  const [newTag, setNewTag] = useState("")
  const [originalSpecialties, setOriginalSpecialties] = useState<string[]>([])
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [x , setX] = useState ('')
  const [tiktok, setTiktok] = useState('')
  const [website, SetWebsite] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const context = useImageManipulator(image || '');
  

const dataSpecialties = [
  { key: '1', value: 'Cardiología' },
  { key: '2', value: 'Dermatología' },
  { key: '3', value: 'Endocrinología' },
  { key: '4', value: 'Gastroenterología' },
  { key: '5', value: 'Hematología' },
  { key: '6', value: 'Infectología' },
  { key: '7', value: 'Nefrología' },
  { key: '8', value: 'Neumología' },
  { key: '9', value: 'Neurología' },
  { key: '10', value: 'Oftalmología' },
  { key: '11', value: 'Oncología' },
  { key: '12', value: 'Ortopedia' },
  { key: '13', value: 'Pediatría' },
  { key: '14', value: 'Psiquiatría' },
  { key: '15', value: 'Radiología' },
  { key: '16', value: 'Reumatología' },
  { key: '17', value: 'Urología' },
  { key: '18', value: 'Ginecología y Obstetricia' },
  { key: '19', value: 'Cirugía General' },
  { key: '20', value: 'Anestesiología' },
  { key: '21', value: 'Odontología' },
];

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true)
        const docRef = doc(db, "doctors", doctorId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const doctorData = docSnap.data()

          setName(doctorData.name || "")
          setDescription(doctorData.description || "")
          setCompleteDescription(doctorData.completeDescription || "")
          setSpecialties([])
          setOriginalSpecialties(doctorData.specialties || [])
          setAddress(doctorData.address || "")
          setOpening(doctorData.opening || "8:00AM-5:00PM")
          setPhone(doctorData.phone || "")
          setRating(doctorData.rating || 0.0)
          setServices(doctorData.services || [])
          setTags(doctorData.tags || [])
          setLatitude(doctorData.latitude || 32.4499982)
          setLongitude(doctorData.longitude || -114.768663592)
          setGallery(doctorData.gallery || [])
          setCalendly(doctorData.calendly || '')
          setBackgroundImage(doctorData.backgroundImage || null)
          setFacebook(doctorData.facebook || '')
          setInstagram(doctorData.instagram || '')
          setX(doctorData.x || '')
          setTiktok(doctorData.tiktok || '')
          SetWebsite(doctorData.website || '')

          if (doctorData.image) {
            setImage(doctorData.image)
            setOriginalImageUrl(doctorData.image)
          }
        } else {
          Alert.alert("Error", "No se encontró el doctor")
          router.back()
        }
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos del doctor")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchDoctorData()
    }
  }, [doctorId])

  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()])
      setNewService("")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    const generateNewImage = async () => { 
      context.resize({ width: 1000, height: 1000 });
      const image = await context.renderAsync();
      const result = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.5,
      });
      return result;
    };

    const pickGallery = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          aspect: [1, 1],
          quality: 0.3,
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
      setSubmitting(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      let imageUrl = originalImageUrl

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
        latitude,
        longitude,
        gallery: galleryUrls,
        calendly,
        facebook,
        instagram,
        x,
        tiktok,
        website,
        backgroundImage,
        updatedAt: new Date(),
      }

      const docRef = doc(db, "doctors", doctorId)
      await updateDoc(docRef, doctorData)

      setSubmitting(false)
      Alert.alert("Éxito", `Doctor ${name} actualizado correctamente`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      setSubmitting(false)
      Alert.alert("Error", "No se pudo actualizar el doctor")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f0b2e" />
          <Text style={styles.loadingText}>Cargando datos del doctor...</Text>
        </View>
      </SafeAreaView>
    )
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
              placeholderTextColor={"#999"}
              onChangeText={(text) => setName(text.slice(0, 30))}
              />
              <Text style={{color:'gray', marginTop:8}}>{name.length}/30</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción Corta</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardiólogo especialista en..."
                value={description}
                placeholderTextColor={"#999"}
                onChangeText={(text) => setDescription(text.slice(0, 40))}
              />
            <Text style={{color:'gray', marginTop:8}}>{description.length}/200</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción Completa</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Información detallada sobre el doctor..."
                value={completeDescription}
                onChangeText={(text) => setCompleteDescription(text.slice(0, 40))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={{color:'gray', marginTop:8}}>{completeDescription.length}/200</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Especialidades</Text>
              <Text style = {{marginBottom:8, color:'gray'}}>Nota: Debes seleccionar de nuevo las especialidades del doctor</Text>
              <MultipleSelectList 
                setSelected={(val: any) => setSpecialties(val)} 
                label="Especialidades Seleccionadas" 
                labelStyles={{ fontWeight: '400' }}
                data={dataSpecialties} 
                save="value"
                placeholder="Selecciona las especialidades del médico"
                inputStyles={{ width: '94%' }}
                dropdownStyles={{ width: 350 }}
                maxHeight={300}
                searchPlaceholder="Buscar Especialidad"
              />
              <Text style = {{marginBottom:8, color:'black'}}>Especialidades previamente seleccionadas:</Text>
              <View style={{flexDirection: 'column', flexWrap: 'wrap'}}>
              {originalSpecialties.map((specialty, index) => (
                <View key={index}>
                  <Text style={{color:'gray'}}>{specialty}</Text>
                </View>
              ))} 
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección</Text>
              <View style={styles.googlePlacesContainer}>
                <GooglePlacesAutocomplete
                  placeholder="Buscar dirección"
                  onPress={(data, details) => {
                    if (details) {
                      setAddress(data.description)
                      setLatitude(details.geometry.location.lat)
                      setLongitude(details.geometry.location.lng)

                    } else {
                      setAddress(data.description)
                    }
                  }}
                  query={{
                    key:  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
                    language: "es",
                  }}
                  styles={{
                    container: {
                      flex: 0,
                      width: "100%",
                      zIndex: 1,
                    },
                    textInputContainer: {
                      width: "100%",
                    },
                    textInput: {
                      height: 46,
                      color: "#333",
                      fontSize: 16,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    },
                    listView: {
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "#e0e0e0",
                      borderRadius: 8,
                      position: "absolute",
                      top: 46,
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                    },
                    description: {
                      fontSize: 14,
                    },
                    row: {
                      padding: 13,
                      height: 50,
                    },
                  }}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  minLength={2}
                  debounce={300}
                  textInputProps={{
                    defaultValue: address,
                  }}
                />
              </View>
              {latitude && longitude && (
                <Text style={styles.coordinatesText}>
                  Lat: {latitude}, Lng: {longitude}
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
                  placeholder="https://calendly.com/drjuanperez/consulta"
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

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Actualizar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
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
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  googlePlacesContainer: {
    marginBottom: 8,
    zIndex: 1000,
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
})

