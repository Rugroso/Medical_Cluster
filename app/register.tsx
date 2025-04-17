"use client"

import React, { useEffect, useState } from "react"
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native"
import { TextInput, Button } from "react-native-paper"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import * as Haptics from "expo-haptics"
import DatePicker from "react-native-date-picker"
import * as Location from "expo-location"
import { useAuth } from "../context/AuthContext"

export default function RegisterScreen() {
  const { register } = useAuth()
  const router = useRouter()

  const [profilePicture, setProfilePicture] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [countryCode, setCountryCode] = useState("+52")
  const [cellphone, setCellphone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthdate, setBirthdate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [gender, setGender] = useState(null)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false)
  const genderOptions = ["Masculino", "Femenino", "Otro"]
  const countryCodeOptions = [
    { code: "+52", country: "México" },
    { code: "+1", country: "Estados Unidos" },
  ]

  const [loading, setLoading] = useState(false)

  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("El correo electrónico es obligatorio")
      return false
    } else if (!emailRegex.test(email)) {
      setEmailError("Ingresa un correo electrónico válido")
      return false
    } else {
      setEmailError("")
      return true
    }
  }

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-()]/g, "")
    
    if (!cleanPhone) {
      setPhoneError("El número de teléfono es obligatorio")
      return false
    } else if (countryCode === "+52" && !/^[0-9]{10}$/.test(cleanPhone)) {
      setPhoneError("El número debe tener 10 dígitos para México")
      return false
    } else if (countryCode === "+1" && !/^[0-9]{10}$/.test(cleanPhone)) {
      setPhoneError("El número debe tener 10 dígitos para EE.UU.")
      return false
    } else {
      setPhoneError("")
      return true
    }
  }

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePicture(result.assets[0].uri)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la foto de perfil")
    }
  }

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Activa los permisos de ubicación en la configuración.")
        setLoadingLocation(false)
        return
      }
      const locationData = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = locationData.coords
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error en la API: ${response.status}`)
      const data = await response.json()
      const city = data.address?.city || data.address?.town || data.address?.village || "Ubicación desconocida"
      const state = data.address?.state || "Estado desconocido"
      const country = data.address?.country || "País desconocido"
      const fullLocation = `${city}, ${state}, ${country}`
      setLocation(fullLocation)
      setLatitude(latitude)
      setLongitude(longitude)
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación")
    } finally {
      setLoadingLocation(false)
    }
  }

  const handleRegister = async () => {
    const isEmailValid = validateEmail(email)
    const isPhoneValid = validatePhone(cellphone)

    if (
      !isEmailValid ||
      !isPhoneValid ||
      !name.trim() ||
      !lastName.trim() ||
      !birthdate ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !gender ||
      !location.trim()
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios y deben ser válidos")
      return
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }
    
    try {
      setLoading(true)
      const fullPhoneNumber = `${countryCode}${cellphone.replace(/[\s\-()]/g, "")}`
      
      await register(
        email,
        password,
        confirmPassword,
        name,
        lastName,
        birthdate.toISOString(),
        fullPhoneNumber, 
        gender,
        location,
        profilePicture
      )
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Registro</Text>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickProfileImage}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={32} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Foto de Perfil</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={{ textAlign: "center", color: "#666" }}>Selecciona una foto de perfil para tu cuenta.</Text>
            <Text style={{ marginBottom: 16, textAlign: "center", color: "#666" }}>
              Puedes cambiarla más tarde o seleccionarla después.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  validateEmail(text)
                }}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono Celular</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryCodePicker(true)}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <Feather name="chevron-down" size={16} color="#333" />
                </TouchableOpacity>
                <TextInput
                  style={[styles.phoneInput, phoneError ? styles.inputError : null]}
                  placeholder="1234567890"
                  placeholderTextColor="#666"
                  value={cellphone}
                  onChangeText={(text) => {
                    let limitedText = text.slice(0, 10);
                    setCellphone(limitedText);
                    validatePhone(limitedText);
                  }}
                  onBlur={() => validatePhone(cellphone)}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={{marginLeft:'21%', marginTop:4}}> {cellphone.length}/10</Text>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            <Modal
              transparent
              animationType="slide"
              visible={showCountryCodePicker}
              onRequestClose={() => setShowCountryCodePicker(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerTitle}>Selecciona el código de país</Text>
                  {countryCodeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.code}
                      onPress={() => {
                        setCountryCode(option.code)
                        setShowCountryCodePicker(false)
                        validatePhone(cellphone)
                      }}
                      style={styles.pickerItem}
                    >
                      <Text style={styles.pickerItemText}>
                        {option.country} ({option.code})
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCountryCodePicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor="#666"
                value={name}
                onChangeText={(text) => {setName(text.slice(0, 20));}}
              />
            <Text style={{marginTop:4}}> {name.length}/20</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                placeholderTextColor="#666"
                value={lastName}
                onChangeText={setLastName}
              />
              <Text style={{marginTop:4}}> {name.length}/40</Text>

            </View>
            <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                value={birthdate.toLocaleDateString()}
                mode="outlined"
                style={styles.input}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {/* <DatePicker
              modal
              open={showDatePicker}
              date={birthdate}
              mode="date"
              maximumDate={new Date()}
              onConfirm={(date) => {
                setShowDatePicker(false);
                setBirthdate(date);
              }}
              onCancel={() => setShowDatePicker(false)}
            /> */}
            <View style={{ marginTop: 16 }} />

            <Text style={styles.inputLabel}>Género</Text>
            <TouchableOpacity onPress={() => setShowGenderPicker(true)}>
              <TextInput
                value={gender || ""}
                mode="outlined"
                style={styles.input}
                placeholder="Selecciona tu género"
                placeholderTextColor="#666"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            <Modal
              transparent
              animationType="slide"
              visible={showGenderPicker}
              onRequestClose={() => setShowGenderPicker(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerTitle}>Selecciona tu género</Text>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setGender(option as any)
                        setShowGenderPicker(false)
                      }}
                      style={styles.pickerItem}
                    >
                      <Text style={styles.pickerItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowGenderPicker(false)}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={[styles.inputGroup, { marginTop: 16 }]}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmar Contraseña"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Ingresa tu ubicación"
                placeholderTextColor="#666"
                style={styles.input}
              />
              <TouchableOpacity onPress={getCurrentLocation}>
                <Text style={styles.linkText}>
                  {loadingLocation ? "Obteniendo ubicación..." : "Obtener ubicación automáticamente"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Registrarse</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.loginLink} onPress={() => router.replace("/login")}>
              Inicia sesión
            </Text>
          </Text>
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
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
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
    paddingVertical: 6,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 32,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 6,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 32,
  },
  dropdown: {
    borderColor: "grey",
    backgroundColor: "#fffbfe",
  },
  inputContent: {
    height: 40,
    paddingVertical: 0,
  },
  dropdownContainer: {
    borderColor: "grey",
    backgroundColor: "#fffbfe",
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
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  registerButton: {
    backgroundColor: "#4f0b2e",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  loginLink: {
    color: "#007bff",
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#4f0b2e",
    textAlign: "center",
    fontWeight: "600",
  },
  linkText: {
    color: "#007bff",
    textAlign: "left",
    fontSize: 14,
    marginTop: 8,
  },
})
