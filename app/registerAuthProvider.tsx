import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import DatePicker from "react-native-date-picker";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
export default function RegisterScreen() {

  const { registerwithGoogle } = useAuth();
  const [lastName, setLastName] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [gender, setGender] = useState("");

  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const genderOptions = ["Masculino", "Femenino", "Otro"];
  const route = useRoute();
  const { nameParam, emailParam, imageUrlParam, uidParam } = route.params as { nameParam: string, emailParam: string, imageUrlParam:string, uidParam: string };

  const [name, setName] = useState(nameParam);
  const [email, setEmail] = useState(emailParam);
  const [uid, setUid] = useState(uidParam);
  const [imageUrl, setImageUrl] = useState(imageUrlParam);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
  
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Activa los permisos de ubicación en la configuración.");
        setLoadingLocation(false);
        return;
      }
  
      let locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;
  
      console.log(`Obteniendo ciudad para: Lat ${latitude}, Lon ${longitude}`);
  
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
      console.log("URL de la solicitud:", url);
  
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error en la API: ${response.status}`);
  
      const data = await response.json();
      console.log("Respuesta de la API:", data);
  
      const city = data.address?.city || data.address?.town || data.address?.village || "Ubicación desconocida";
      const state = data.address?.state || "Estado desconocido";
      const country = data.address?.country || "País desconocido";

      const fullLocation = `${city}, ${state}, ${country}`;
      setLocation(fullLocation);
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      const errorMessage = (error as Error).message;
      Alert.alert("Error", `No se pudo obtener la ubicación: ${errorMessage}`);
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput label="Correo Electrónico" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput label="Teléfono Celular" value={cellphone} onChangeText={setCellphone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
      <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Apellidos" value={lastName} onChangeText={setLastName} mode="outlined" style={styles.input} />

      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput label="Fecha de Nacimiento" value={birthDate.toLocaleDateString()} mode="outlined" style={styles.input} editable={false} pointerEvents="none" />
      </TouchableOpacity>

      <DatePicker
        modal
        open={showDatePicker}
        date={birthDate}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setBirthDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <TouchableOpacity onPress={() => setShowGenderPicker(true)}>
        <TextInput label="Género" value={gender} mode="outlined" style={styles.input} editable={false} pointerEvents="none" />
      </TouchableOpacity>

      <Modal transparent animationType="slide" visible={showGenderPicker} onRequestClose={() => setShowGenderPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={gender} onValueChange={(itemValue) => {
              setGender(itemValue);
              setShowGenderPicker(false);
            }}>
              {genderOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>

      <TextInput label="Ubicación" value={location} onChangeText={setLocation} mode="outlined" style={styles.input} />
      
      <TouchableOpacity style={{ marginTop: -6 }} onPress={getCurrentLocation} disabled={loadingLocation}>
        <Text style={{ color: "#007bff", textAlign: "left", marginBottom: 10 }}>
          {loadingLocation ? "Obteniendo ubicación..." : "Usar ubicación actual"}
        </Text>
      </TouchableOpacity>

      <Button mode="contained" onPress={() => {registerwithGoogle(email, name, lastName, birthDate.toISOString(), gender, location, imageUrl, uid)}} style={styles.button}>Registrarse</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    borderColor: "#f4ced4",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4f0c2e",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 10,
  },
});