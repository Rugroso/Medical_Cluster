"use client"

import { useState } from "react"
import { StyleSheet, View, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native"
import { db } from "../../../../config/Firebase_Conf"
import { collection, addDoc } from "firebase/firestore"
import * as Haptics from "expo-haptics"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import { TextInput, Button, Text } from "react-native-paper"

export default function RegisterDoctor() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [description, setDescription] = useState("")
  const [completeDescription, setCompleteDescription] = useState("")
  const [opening, setOpening] = useState("")
  const [services, setServices] = useState("")
  const [tags, setTags] = useState("")
  const [image, setImage] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name || !description || !completeDescription || !opening || !address || !phone || !tags || !services) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios")
      return
    }

    setLoading(true)

    try {
      const doctorData = {
        doctorId: uuidv4(),
        name,
        address,
        phone,
        description,
        completeDescription,
        rating: 0,
        opening,
        services: services.split(", "),
        tags: tags.split(", "),
        image: image || "",
        latitude,
        longitude,
      }

      await addDoc(collection(db, "doctors"), doctorData)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert("Éxito", "Doctor registrado correctamente")
      setName("")
      setAddress("")
      setPhone("")
      setDescription("")
      setCompleteDescription("")
      setOpening("")
      setServices("")
      setImage("")
      setTags("")
      setLatitude(null)
      setLongitude(null)
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al registrar el doctor")
      console.error("Error al registrar el doctor: ", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.title} variant="headlineMedium">
              Registrar Doctor
            </Text>

            <TextInput
              label="Nombre"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <View style={styles.googlePlacesContainer}>
              <Text style={styles.label}>Dirección</Text>
              <GooglePlacesAutocomplete
                placeholder="Buscar dirección"
                onPress={(data, details ) => {
                  if (details) {
                    setAddress(data.description)
                    setLatitude(details.geometry.location.lat)
                    setLongitude(details.geometry.location.lng)
                    console.log("Coordinates:", details.geometry.location)
                  } else {
                    setAddress(data.description)
                  }
                }}
                query={{
                  key: "AIzaSyByOcLdvb_LXz8Yak0RO8BkXAeo-hPu1EA",
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
                    color: "#5d5d5d",
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#f4ced4",
                    borderRadius: 4,
                    backgroundColor: "#fffbfe",
                  },
                  listView: {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#f4ced4",
                    borderRadius: 4,
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
              />
            </View>

            <TextInput
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <TextInput
              label="Descripción corta"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <TextInput
              label="Descripción completa"
              value={completeDescription}
              onChangeText={setCompleteDescription}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <TextInput
              label="Horario (ej. 8:00 am - 18:00 pm)"
              value={opening}
              onChangeText={setOpening}
              mode="outlined"
              style={styles.input}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <TextInput
              label="URL de imagen"
              value={image}
              onChangeText={setImage}
              mode="outlined"
              style={styles.input}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <TextInput
              label="Servicios (separados por comas)"
              value={services}
              onChangeText={setServices}
              mode="outlined"
              style={styles.input}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <TextInput
              label="Tags (separados por comas)"
              value={tags}
              onChangeText={setTags}
              mode="outlined"
              style={styles.input}
              outlineColor="#f4ced4"
              activeOutlineColor="#4f0c2e"
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Registrar Doctor
            </Button>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  innerContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fffbfe",
  },
  googlePlacesContainer: {
    marginBottom: 16,
    zIndex: 1000,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4f0c2e",
    paddingVertical: 8,
  },
})

