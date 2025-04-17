import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { db } from '@/config/Firebase_Conf';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

export default function ConfiguracionScreen() {
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [crossingType, setCrossingType] = useState<'sentri' | 'readyline' | 'general' | 'pedestrian'>('general');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferences) {
          const preferences = userDoc.data().preferences;
          if (preferences.temperatureUnit) {
            setTemperatureUnit(preferences.temperatureUnit);
          }
          if (preferences.crossingType) {
            setCrossingType(preferences.crossingType);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }

    try {
      setLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          'preferences.temperatureUnit': temperatureUnit,
          'preferences.crossingType': crossingType,
          'preferences.updatedAt': new Date()
        });
      } else {
        await setDoc(userDocRef, {
          preferences: {
            temperatureUnit: temperatureUnit,
            crossingType: crossingType,
            updatedAt: new Date()
          }
        });
      }
      
      Alert.alert('Éxito', 'Preferencias guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleTemperatureChange = (unit: 'celsius' | 'fahrenheit') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTemperatureUnit(unit);
  };

  const handleCrossingChange = (type: 'sentri' | 'readyline' | 'general' | 'pedestrian') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCrossingType(type);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="cog" size={40} color="#4f0c2e" />
          <Text style={styles.headerSubtitle}>Personaliza tu experiencia en la aplicación</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="eye-outline" size={24} color="#4f0c2e" />
            <Text style={styles.sectionTitle}>Preferencias de Visualización</Text>
          </View>
          
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Unidad de Temperatura</Text>
            <Text style={styles.settingDescription}>Selecciona tu unidad de temperatura preferida</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                temperatureUnit === 'celsius' && styles.optionButtonSelected
              ]}
              onPress={() => handleTemperatureChange('celsius')}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={temperatureUnit === 'celsius' ? "radiobox-marked" : "radiobox-blank"} 
                size={22} 
                color={temperatureUnit === 'celsius' ? "#4f0c2e" : "#6f1b46"} 
              />
              <Text style={[
                styles.optionText,
                temperatureUnit === 'celsius' && styles.optionTextSelected
              ]}>Celsius (°C)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.optionButton, 
                temperatureUnit === 'fahrenheit' && styles.optionButtonSelected
              ]}
              onPress={() => handleTemperatureChange('fahrenheit')}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={temperatureUnit === 'fahrenheit' ? "radiobox-marked" : "radiobox-blank"} 
                size={22} 
                color={temperatureUnit === 'fahrenheit' ? "#4f0c2e" : "#6f1b46"} 
              />
              <Text style={[
                styles.optionText,
                temperatureUnit === 'fahrenheit' && styles.optionTextSelected
              ]}>Fahrenheit (°F)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker-path" size={24} color="#4f0c2e" />
            <Text style={styles.sectionTitle}>Preferencias de Cruce Fronterizo</Text>
          </View>
          
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Tipo de Cruce Preferido</Text>
            <Text style={styles.settingDescription}>Selecciona tu tipo de cruce fronterizo preferido</Text>
          </View>

          <View style={styles.optionsContainer}>

          <TouchableOpacity 
              style={[
                styles.optionButton, 
                crossingType === 'general' && styles.optionButtonSelected
              ]}
              onPress={() => handleCrossingChange('general')}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={crossingType === 'general' ? "radiobox-marked" : "radiobox-blank"} 
                size={22} 
                color={crossingType === 'general' ? "#4f0c2e" : "#6f1b46"} 
              />
              <Text style={[
                styles.optionText,
                crossingType === 'general' && styles.optionTextSelected
              ]}>General</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.optionButton, 
                crossingType === 'readyline' && styles.optionButtonSelected
              ]}
              onPress={() => handleCrossingChange('readyline')}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={crossingType === 'readyline' ? "radiobox-marked" : "radiobox-blank"} 
                size={22} 
                color={crossingType === 'readyline' ? "#4f0c2e" : "#6f1b46"} 
              />
              <Text style={[
                styles.optionText,
                crossingType === 'readyline' && styles.optionTextSelected
              ]}>Ready Lane</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.optionButton, 
                crossingType === 'sentri' && styles.optionButtonSelected
              ]}
              onPress={() => handleCrossingChange('sentri')}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={crossingType === 'sentri' ? "radiobox-marked" : "radiobox-blank"} 
                size={22} 
                color={crossingType === 'sentri' ? "#4f0c2e" : "#6f1b46"} 
              />
              <Text style={[
                styles.optionText,
                crossingType === 'sentri' && styles.optionTextSelected
              ]}>SENTRI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.optionButton, 
                crossingType === 'pedestrian' && styles.optionButtonSelected
              ]}
              onPress={() => handleCrossingChange('pedestrian')}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={crossingType === 'pedestrian' ? "radiobox-marked" : "radiobox-blank"} 
                size={22} 
                color={crossingType === 'pedestrian' ? "#4f0c2e" : "#6f1b46"} 
              />
              <Text style={[
                styles.optionText,
                crossingType === 'pedestrian' && styles.optionTextSelected
              ]}>Peatonal</Text>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.infoSection}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#6f1b46" />
          <Text style={styles.infoText}>
            Haz clic en "Guardar Preferencias" para aplicar los cambios.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveUserPreferences}
          disabled={loading}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>Guardar Preferencias</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f0c2e',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f0c2e',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4ced4',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#000',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#f4ced4',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  optionTextSelected: {
    color: '#4f0c2e',
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#f4ced4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6f1b46',
    marginLeft: 12,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f0c2e',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});