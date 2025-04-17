import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/Firebase_Conf";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const genderOptions = ["Masculino", "Femenino", "Otro"];

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmail(data.email || "");
          setName(data.name || "");
          setLastName(data.lastName || "");
          setCellphone(data.cellphone || "");
          setBirthDate(new Date(data.birthdate));
          setGender(data.gender || "");
          setLocation(data.location || "");
          setProfileImage(data.profilePicture || "");
        }
      };
      loadUserData();
    }
  }, [user]);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Activa los permisos de ubicación en la configuración."
        );
        return;
      }
      let locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;
  
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
      const response = await fetch(url);
      const data = await response.json();
  
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "Ubicación desconocida";
      const state = data.address?.state || "Estado desconocido";
      const country = data.address?.country || "País desconocido";
      const fullLocation = `${city}, ${state}, ${country}`;
      setLocation(fullLocation);
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
    });
    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!name || !lastName || !cellphone || !birthDate || !gender || !location) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user!.uid), {
        name,
        lastName,
        cellphone,
        birthdate: birthDate.toISOString(),
        gender,
        location,
        profilePicture: profileImage,
      });
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={64}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.formSection}>
            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickProfileImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Foto de Perfil</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput 
            label="Correo Electrónico" 
            selectionColor="#4f0c2e"
            underlineColor="#4f0c2e"
            activeUnderlineColor="#4f0c2e"
            activeOutlineColor="#4f0c2e"
            outlineColor="#4f0c2e"
            value={email} mode="outlined" 
            disabled 
            style={styles.input} />
            <TextInput 
            label="Nombre"
            selectionColor="#4f0c2e"
            underlineColor="#4f0c2e"
            activeUnderlineColor="#4f0c2e"
            activeOutlineColor="#4f0c2e"
            outlineColor="#4f0c2e"
            value={name} 
            onChangeText={setName} 
            mode="outlined" 
            style={styles.input} />
            <TextInput label="Apellidos" 
            value={lastName} 
            selectionColor="#4f0c2e"
            underlineColor="#4f0c2e"
            activeUnderlineColor="#4f0c2e"
            activeOutlineColor="#4f0c2e"
            outlineColor="#4f0c2e"
            onChangeText={setLastName}
            mode="outlined" 
            style={styles.input} />
            <TextInput 
            label="Teléfono Celular" 
            selectionColor="#4f0c2e"
            underlineColor="#4f0c2e"
            activeUnderlineColor="#4f0c2e"
            activeOutlineColor="#4f0c2e"
            outlineColor="#4f0c2e"
            value={cellphone} 
            onChangeText={setCellphone} 
            keyboardType="phone-pad" 
            mode="outlined" 
            style={styles.input} 
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput label="Fecha de Nacimiento" value={birthDate.toLocaleDateString()} mode="outlined" style={styles.input} editable={false} pointerEvents="none" />
            </TouchableOpacity>
            {/* <DatePicker modal open={showDatePicker} date={birthDate} mode="date" maximumDate={new Date()} onConfirm={(date) => { setShowDatePicker(false); setBirthDate(date); }} onCancel={() => setShowDatePicker(false)} /> */}

            <TouchableOpacity onPress={() => setShowGenderPicker(true)}>
              <TextInput label="Género" value={gender} mode="outlined" style={styles.input} editable={false} pointerEvents="none" />
            </TouchableOpacity>
            <Modal transparent animationType="slide" visible={showGenderPicker} onRequestClose={() => setShowGenderPicker(false)}>
              <View style={styles.modalBackground}>
                <View style={styles.pickerContainer}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity key={option} onPress={() => { setGender(option); setShowGenderPicker(false); }} style={styles.pickerItem}>
                      <Text style={styles.pickerItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ubicación</Text>
                <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Ingresa tu ubicación"
                    style={styles.input}
                />
                <TouchableOpacity onPress={getCurrentLocation}>
                    <Text style={styles.linkText}>
                        {loadingLocation ? "Obteniendo ubicación..." : "Obtener ubicación automáticamente"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.registerButton} onPress={handleUpdate} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: "#fff" 
},
  container: { 
    flexGrow: 1, 
    padding: 0, 
    backgroundColor: "#fff" 
},
  title: { fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 20 
},
  formSection: { 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 2 
},
  imagePickerContainer: { 
    alignItems: "center", 
    marginBottom: 16 
},
  profileImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60 
},
  imagePlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: "#f5f5f5", 
    justifyContent: "center", 
    alignItems: "center" 
},
  imagePlaceholderText: { 
    color: "#999", 
    fontSize: 14 
},
  input: { 
    marginBottom: 16, 
    backgroundColor: "#f5f5f5" 
},
  centerText: { 
    textAlign: "center", 
    color: "#666", 
    marginBottom: 16 
},
  modalBackground: { 
    flex: 1, 
    justifyContent: "flex-end", 
    backgroundColor: "rgba(0,0,0,0.5)" 
},
  pickerContainer: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12 },
  pickerItem: { 
    paddingVertical: 12 
},
  pickerItemText: { 
    fontSize: 16, 
    color: "#333", 
    textAlign: "center" 
},
  addressInput: { 
    backgroundColor: "#f5f5f5", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 16 
},
  addressText: { 
    fontSize: 16, 
    color: "#333", 
    flex: 1 
  },
  addressPlaceholder: { 
    fontSize: 16, 
    color: "#999", 
    flex: 1 }
    ,
  buttonContainer: { 
    marginTop: 16, 
    marginBottom: 32 
},
  registerButton: { 
    backgroundColor: "#4f0b2e", 
    borderRadius: 8, 
    paddingVertical: 12, 
    alignItems: "center", 
    justifyContent: "center" 
},
  registerButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
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
  linkText: {
    color: "#007bff",
    textAlign: "left",
    fontSize: 14,
    marginTop: -4,
  },
});