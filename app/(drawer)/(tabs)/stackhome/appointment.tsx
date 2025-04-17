import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { updateDoc, doc, Timestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../../../config/Firebase_Conf";

export default function App() {
  const route = useRoute();
  const { user } = useAuth();
  const { calendly, doctorIdParam } = (route?.params as { calendly: string, doctorIdParam: string });
  
  const [appointmentData, setAppointmentData] = useState({ date: "", time: "", timeZone: "" });

  async function scheduleNotificationAsync(appointmentDate: Date) {
    const now = new Date();
    const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
    const diffInSeconds = Math.floor((oneHourBefore.getTime() - now.getTime()) / 1000);
  
    if (diffInSeconds <= 0) {
      console.warn("La notificación no se puede programar: falta menos de una hora.");
      return;
    }
  
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cita programada',
        body: `Tu cita con el doctor ${doctorIdParam} comenzará en una hora.`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        seconds: diffInSeconds,
        repeats: false,
      },
    });
  
  }

  const handleNavigationStateChange = (navState: any) => {
    const currentUrl = navState.url;
    console.log("Current URL:", currentUrl);
    console.log("Doctor ID:", doctorIdParam);
    console.log("User ID:", user?.uid);

    if (currentUrl.includes("month") && currentUrl.includes("?")) {
      const regex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/;
      const match = currentUrl.match(regex);
      if (match && match[1]) {
        const appointmentString = match[1];
        const parts = appointmentString.split("T");
        if (parts.length === 2) {
          const date = parts[0];
          let time = "";
          let timeZone = "";
          if (parts[1].includes("-")) {
            const completeTime = parts[1].split("-");
            time = completeTime[0];
            timeZone = `-${completeTime[1]}`;
          } else if (parts[1].includes("+")) {
            const completeTime = parts[1].split("+");
            time = completeTime[0];
            timeZone = `+${completeTime[1]}`;
          }
          setAppointmentData({ date, time, timeZone });
        }
      }
    }

    if (currentUrl.includes("invitees")) {
      console.log("Fecha extraída:", appointmentData.date);
      console.log("Hora extraída:", appointmentData.time);
      console.log("Zona horaria extraída:", appointmentData.timeZone);

      if (appointmentData.date && appointmentData.time && appointmentData.timeZone && user?.uid) {
        const isoString = `${appointmentData.date}T${appointmentData.time}${appointmentData.timeZone}`;
        const appointmentDate = new Date(isoString);
        const firebaseTimestamp = Timestamp.fromDate(appointmentDate);
      
        updateDoc(doc(db, "users", user.uid), {
          appointments: arrayUnion({
            appointment: firebaseTimestamp,
            doctorId: doctorIdParam
          })
        })
          .then(() => {
            Alert.alert(
              "Cita programada",
              "Se ha programado una cita con éxito. ¿Quieres recibir un recordatorio una hora antes?",
              [
                {
                  text: "No",
                  style: "cancel"
                },
                {
                  text: "Sí",
                  onPress: () => scheduleNotificationAsync(appointmentDate)
                }
              ]
            );
            console.log("Datos actualizados en Firebase:", firebaseTimestamp);
          })
          .catch((error) => {
            console.error("Error al actualizar en Firebase:", error);
          });
      }
    }
  };


  

  return (
    <View style={styles.container}>
      {calendly === "sin-cita" ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.infoTitle}>Sin Cita</Text>
          <Text>No hay una cita programada en este momento.</Text>
        </View>
      ) : (
        <>
          <WebView
            style={styles.webview}
            source={{ uri: calendly }}
            onNavigationStateChange={handleNavigationStateChange}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});