"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { db } from "../../../config/Firebase_Conf"
import { collection, getDocs } from "firebase/firestore"
import * as Haptics from "expo-haptics"


export default function SendNotifications() {
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [userTokens, setUserTokens] = useState<string[]>([])
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    fetchUserTokens()
  }, [])

  const fetchUserTokens = async () => {
    setLoading(true)
    try {
      const usersRef = collection(db, "users")
      const querySnapshot = await getDocs(usersRef)
  
      const tokens: string[] = []
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
  
        const userTokens: string[] = userData?.expoPushTokens ?? []
  
        userTokens.forEach((token) => {
          if (!tokens.includes(token)) {
            tokens.push(token)
          }
        })
      })
  
      setUserTokens(tokens)
      setUserCount(tokens.length)
  
      if (tokens.length === 0) {
        Alert.alert("Sin tokens disponibles", "No se encontraron usuarios con tokens de notificación registrados.")
      }
    } catch (error) {
      console.error("Error al obtener tokens de usuarios:", error)
      Alert.alert("Error", "No se pudieron obtener los tokens de notificación de los usuarios.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título de la notificación es obligatorio")
      return false
    }

    if (!body.trim()) {
      Alert.alert("Error", "El cuerpo de la notificación es obligatorio")
      return false
    }

    if (userTokens.length === 0) {
      Alert.alert("Error", "No hay usuarios a quienes enviar la notificación")
      return false
    }

    return true
  }

  const sendNotifications = async () => {
    if (!validateForm()) return

    setSending(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      const messages = userTokens.map((token) => (
        {
        to: token,
        sound: "default",
        title: title,
        body: body,
        data: { data: "goes here" },
      }))

      const chunks = chunkArray(messages, 100) 
      for (const chunk of chunks) {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        })

        const result = await response.json()
      }

      Alert.alert("Éxito", `Notificación enviada a ${userTokens.length} usuarios`, [
        {
          text: "OK",
          onPress: () => {
            setTitle("")
            setBody("")
          },
        },
      ])
    } catch (error) {
      console.error("Error al enviar notificaciones:", error)
      Alert.alert("Error", "No se pudieron enviar las notificaciones. Por favor, intenta de nuevo.")
    } finally {
      setSending(false)
    }
  }

  const chunkArray = (array: any[], size: number) => {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4f0b2e" />
              <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Feather name="info" size={24} color="#4f0b2e" />
                </View>
                <Text style={styles.infoTitle}>Información</Text>
                <Text style={styles.infoText}>
                  Esta notificación se enviará a {userCount} dispositivos que tienen la aplicación instalada.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título de la notificación</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ej: Nuevos Médicos Registrados"
                  placeholderTextColor="#666"
                  value={title}
                  onChangeText={setTitle}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={40}
                />
                <Text style={styles.charCount}>{title.length}/40</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mensaje de la notificación</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ej: Hemos añadido nuevos médicos a nuestra plataforma. ¡Visítalos ahora!"
                  placeholderTextColor="#666"
                  value={body}
                  onChangeText={setBody}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text style={styles.charCount}>{body.length}/200</Text>
              </View>

              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Vista previa</Text>
                <View style={styles.notificationPreview}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.appName}>Medical Cluster SLRC</Text>
                    <Text style={styles.notificationTime}>ahora</Text>
                  </View>
                  <Text style={styles.notificationTitle}>{title || "Título de la notificación"}</Text>
                  <Text style={styles.notificationBody}>{body || "Cuerpo de la notificación"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.sendButton, (!title || !body || sending) && styles.disabledButton]}
                onPress={sendNotifications}
                disabled={!title || !body || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="send" size={20} color="#fff" />
                    <Text style={styles.sendButtonText}>Enviar Notificación</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#f9e6ee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4f0b2e",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4f0b2e",
    lineHeight: 20,
  },
  inputGroup: {
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  notificationPreview: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: "#4f0b2e",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
})

