import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import * as Calendar from "expo-calendar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute } from "@react-navigation/native";

const AppointmentScreen = () => {
  const route = useRoute();
  const { doctorName, doctorAddress } = route.params as { doctorName: string; doctorAddress: string };

  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere acceso al calendario para agendar la cita.");
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);
      if (defaultCalendar) {
        setCalendarId(defaultCalendar.id);
      } else {
        Alert.alert("Error", "No se encontró un calendario válido en tu dispositivo.");
      }
    })();
  }, []);

  const handleScheduleAppointment = async () => {
    if (!calendarId) {
      Alert.alert("Error", "No se puede acceder al calendario.");
      return;
    }
    if (!patientName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre del paciente.");
      return;
    }

    try {
      const endDate = new Date(date.getTime() + 60 * 60 * 1000); // Duración de 1 hora

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: `Cita con ${doctorName}`,
        location: doctorAddress,
        notes: `Paciente: ${patientName}`,
        startDate: date,
        endDate,
        timeZone: "America/Mexico_City",
        alarms: [{ relativeOffset: -30 }], // ⏰ Recordatorio 30 min antes
      });

      if (eventId) {
        Alert.alert("Cita agendada", "Tu cita se ha agregado al calendario.");
      }
    } catch (error) {
      console.error("Error al agendar la cita:", error);
      Alert.alert("Error", "No se pudo agendar la cita.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar Cita</Text>

      <Text style={styles.label}>Nombre del Paciente</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa el nombre"
        value={patientName}
        onChangeText={setPatientName}
      />

      <Text style={styles.label}>Fecha y Hora</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.datePickerText}>{date.toLocaleString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()} // 📅 No permite fechas pasadas
          onChange={(event:any, selectedDate:any) => {
            setShowPicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleScheduleAppointment}>
        <Text style={styles.buttonText}>Confirmar Cita</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  datePickerButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#4f0c2e",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AppointmentScreen;