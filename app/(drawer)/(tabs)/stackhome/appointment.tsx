import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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

    // Una vez que se llegue a la sección "invitees", asumimos que la cita ya fue seleccionada.
    if (currentUrl.includes("invitees")) {
      console.log("Fecha extraída:", appointmentData.date);
      console.log("Hora extraída:", appointmentData.time);
      console.log("Zona horaria extraída:", appointmentData.timeZone);

      if (appointmentData.date && appointmentData.time && appointmentData.timeZone && user?.uid) {
        const isoString = `${appointmentData.date}T${appointmentData.time}${appointmentData.timeZone}`;
        const appointmentDate = new Date(isoString);
        const firebaseTimestamp = Timestamp.fromDate(appointmentDate);

        // Actualizamos el documento del usuario agregando el nuevo objeto de cita al arreglo "appointments"
        updateDoc(doc(db, "users", user.uid), {
          appointments: arrayUnion({
            appointment: firebaseTimestamp,
            doctorId: doctorIdParam
          })
        })
          .then(() => {
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
          {appointmentData.date !== "" && appointmentData.time !== "" && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Datos de la cita:</Text>
              <Text>Fecha: {appointmentData.date}</Text>
              <Text>Hora: {appointmentData.time}</Text>
              <Text>Zona horaria: {appointmentData.timeZone}</Text>
            </View>
          )}
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