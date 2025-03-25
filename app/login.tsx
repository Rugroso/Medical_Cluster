import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        label="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Button mode="contained" onPress={() => {login(email, password)}} loading={loading} disabled={loading} style={styles.button}>
        Iniciar Sesión
      </Button>

      <Button mode="contained" icon="google" onPress={signInWithGoogle} style={styles.button}>
        Iniciar sesión con Google
      </Button>

      {/* <Button mode="contained" icon="facebook" onPress={signInWithFacebook} style={styles.button}>
        Iniciar sesión con Facebook
      </Button> */}

      <Text style={styles.registerText}>
        ¿No tienes cuenta?{" "}
        <Text style={styles.registerLink} onPress={() => router.replace("/register")}>
          Regístrate
        </Text>
      </Text>
      <Text style={styles.passwordText}>
        ¿Olvidaste tu contraseña?{" "}
        <Text style={styles.registerLink} onPress={() => router.replace("/reset-password")}>
          Recupérala
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
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4f0c2e",
  },
  registerText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  passwordText: {
    textAlign: "center",
    marginTop: 10,
    fontSize:14
  },
  registerLink: {
    color: "#007bff",
    fontWeight: "bold",
  },
});