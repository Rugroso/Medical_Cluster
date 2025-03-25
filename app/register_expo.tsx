import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [birthdate, setbirthdate] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null);
  const [items, setItems] = useState([
    { label: "Masculino", value: "Masculito" },
    { label: "Femenino", value: "Femenino" },
    { label: "Otro", value: "Otro" },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        label="Correo Electrónico"
        value={email}
        autoComplete="email"
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Teléfono Celular"
        value={cellphone}
        autoComplete="tel"
        onChangeText={setCellphone}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Nombre"
        value={name}
        autoComplete="name"
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Apellidos"
        value={lastName}
        autoComplete="family-name"
        onChangeText={setLastName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Edad"
        value={birthdate}
        onChangeText={setbirthdate}
        mode="outlined"
        style={styles.input}
      />

      <DropDownPicker
        open={open}
        value={gender}
        items={items}
        setOpen={setOpen}
        setValue={setGender}
        setItems={setItems}
        placeholder="Selecciona tu género"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <TextInput
        label="Contraseña"
        value={password}
        autoComplete="password"
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Confirmar Contraseña"
        value={confirmPassword}
        autoComplete="password"
        onChangeText={setConfirmPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={() => {
          register(email, password, confirmPassword, name, lastName, birthdate, cellphone, gender || "");
        }}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Registrarse
      </Button>

      <Text style={styles.loginText}>
        ¿Ya tienes cuenta?{" "}
        <Text style={styles.loginLink} onPress={() => router.replace("/login")}>
          Inicia sesión
        </Text>
      </Text>
    </View>
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
  dropdown: {
    marginBottom: 16,
    borderColor: 'grey',
    backgroundColor: "#fffbfe",
  },
  dropdownContainer: {
    borderColor: 'grey',
    backgroundColor: "#fffbfe",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4f0c2e",
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  loginLink: {
    color: "#007bff",
    fontWeight: "bold",
  },
});
