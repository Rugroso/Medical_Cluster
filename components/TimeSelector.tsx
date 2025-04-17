"use client"

import React, { useState } from "react"
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import DateTimePicker from "@react-native-community/datetimepicker"

interface TimeSelectorProps {
  value: string
  onChange: (timeString: string) => void
  label?: string
}

export default function TimeSelector({ value, onChange, label = "Horario" }: TimeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [selectedMode, setSelectedMode] = useState<"start" | "end">("start")
  const [showIosPicker, setShowIosPicker] = useState(false)

  React.useEffect(() => {
    if (value) {
      try {
        const parts = value.split("-")
        if (parts.length === 2) {
          const startPart = parts[0].trim().toLowerCase()
          const endPart = parts[1].trim().toLowerCase()

          const startDate = new Date()
          const endDate = new Date()

          const parseTimeString = (timeStr: string, date: Date) => {
            const isPM = timeStr.includes("pm")
            const timeValue = timeStr.replace(/am|pm/i, "").trim()
            const [hours, minutes] = timeValue.split(":").map((n) => Number.parseInt(n, 10))

            date.setHours(isPM && hours < 12 ? hours + 12 : hours, minutes || 0, 0, 0)
            return date
          }

          setStartTime(parseTimeString(startPart, startDate))
          setEndTime(parseTimeString(endPart, endDate))
        }
      } catch (error) {
        console.error("Error parsing time:", error)
        const defaultStart = new Date()
        defaultStart.setHours(8, 0, 0, 0)

        const defaultEnd = new Date()
        defaultEnd.setHours(17, 0, 0, 0)

        setStartTime(defaultStart)
        setEndTime(defaultEnd)
      }
    }
  }, [])

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setModalVisible(true)
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    const ampm = hours >= 12 ? "pm" : "am"

    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const formatTimeForDisplay = () => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowIosPicker(false)
    }

    if (selectedDate) {
      if (selectedMode === "start") {
        setStartTime(selectedDate)
      } else {
        setEndTime(selectedDate)
      }
    }
  }

  const handleDone = () => {
    onChange(formatTimeForDisplay())
    setModalVisible(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const showTimePicker = (mode: "start" | "end") => {
    setSelectedMode(mode)
    if (Platform.OS === "ios") {
      setShowIosPicker(true)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={openModal}>
        <Text style={styles.inputText}>{value || "Seleccionar horario"}</Text>
        <Feather name="clock" size={20} color="#4f0b2e" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Horario</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#4f0b2e" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeSelectors}>
              <View style={styles.timeSelector}>
                <Text style={styles.timeSelectorLabel}>Hora de apertura</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => showTimePicker("start")}>
                  <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                  <Feather name="clock" size={20} color="#4f0b2e" />
                </TouchableOpacity>
              </View>

              <View style={styles.timeSelector}>
                <Text style={styles.timeSelectorLabel}>Hora de cierre</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => showTimePicker("end")}>
                  <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                  <Feather name="clock" size={20} color="#4f0b2e" />
                </TouchableOpacity>
              </View>
            </View>

            {Platform.OS === "android" && selectedMode === "start" && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleTimeChange}
              />
            )}

            {Platform.OS === "android" && selectedMode === "end" && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleTimeChange}
              />
            )}

            {Platform.OS === "ios" && showIosPicker && (
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={selectedMode === "start" ? startTime : endTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              </View>
            )}

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Vista previa:</Text>
              <Text style={styles.previewText}>{formatTimeForDisplay()}</Text>
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  timeSelectors: {
    marginBottom: 20,
  },
  timeSelector: {
    marginBottom: 16,
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  previewContainer: {
    backgroundColor: "#f9e6ee",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    color: "#4f0b2e",
    marginBottom: 4,
  },
  previewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4f0b2e",
  },
  doneButton: {
    backgroundColor: "#4f0b2e",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  iosPickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 20,
  },
})

