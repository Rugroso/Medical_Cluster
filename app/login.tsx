import React, { useState } from "react";
import { View, StyleSheet, Image} from "react-native";
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
      <View>
          <Image
            source={require("../assets/images/logo/medicalclus.png")}
            style={{ width: 80, height: 80, alignSelf: "center", marginBottom: 15 }}
            resizeMode="contain"
          />
      </View>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        label="Correo Electrónico"
        selectionColor="#4f0c2e"
        underlineColor="#4f0c2e"
        activeUnderlineColor="#4f0c2e"
        activeOutlineColor="#4f0c2e"
        outlineColor="#4f0c2e"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={styles.input}
      />

      <TextInput
        label="Contraseña"
        selectionColor="#4f0c2e"
        underlineColor="#4f0c2e"
        activeUnderlineColor="#4f0c2e"
        activeOutlineColor="#4f0c2e"
        outlineColor="#4f0c2e"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
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
    backgroundColor: "#fff",
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