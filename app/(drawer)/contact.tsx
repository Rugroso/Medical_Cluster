import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ContactoScreen() {
  interface HandleContactPressParams {
    action: 'phone' | 'email' | 'maps' | 'website' | 'social';
    value: string;
  }

  const handleContactPress = (action: HandleContactPressParams['action'], value: HandleContactPressParams['value']): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch(action) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'website':
        Linking.openURL(value);
        break;
      case 'social':
        Linking.openURL(value);
        break;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          
          {/* <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('phone', '+526535551234')}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="phone" size={24} color="#ffffff" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Teléfono</Text>
              <Text style={styles.contactValue}>+52 (653) 555-1234</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#4f0c2e" />
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('email', 'contacto@medicalclusterslrc.com')}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="email-outline" size={24} color="#ffffff" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Correo Electrónico</Text>
              <Text style={styles.contactValue}>contacto@medicalclusterslrc.com</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#4f0c2e" />
          </TouchableOpacity>
          
          {/* <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('maps', '')}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#ffffff" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Dirección</Text>
              <Text style={styles.contactValue}>Av. Principal #123, Col. Centro, San Luis Río Colorado, Sonora, México</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#f4ced4" />
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('website', 'https://medicalclusterslrc.com')}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="web" size={24} color="#ffffff" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Sitio Web</Text>
              <Text style={styles.contactValue}>www.medicalclusterslrc.com</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#f4ced4" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario de Atención de la App</Text>
          
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Lunes - Viernes</Text>
              <Text style={styles.scheduleHours}>8:00 AM - 3:00 PM (GMT-7)</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Sábado y Domingo</Text>
              <Text style={styles.scheduleHours}>Sin Servicio</Text>
            </View>
          </View>
        </View>
        
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociales</Text>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleContactPress('social', 'https://facebook.com/medicalclusterslrc')}
            >
              <MaterialCommunityIcons name="facebook" size={28} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleContactPress('social', 'https://instagram.com/medicalclusterslrc')}
            >
              <MaterialCommunityIcons name="instagram" size={28} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleContactPress('social', 'https://twitter.com/medicalclusterslrc')}
            >
              <MaterialCommunityIcons name="twitter" size={28} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleContactPress('social', 'https://youtube.com/medicalclusterslrc')}
            >
              <MaterialCommunityIcons name="youtube" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View> */}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos Directamente</Text>
          
          {/* <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactPress('phone', '+526535551234')}
          >
            <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Llamar Ahora</Text>
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            style={[styles.contactButton, styles.emailButton]}
            onPress={() => handleContactPress('email', 'contacto@medicalclusterslrc.com')}
          >
            <MaterialCommunityIcons name="email-outline" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Enviar </Text>
          </TouchableOpacity>

         
          <TouchableOpacity 
            style={[styles.contactButton, styles.emailButton]}
            onPress={() => handleContactPress('website', 'http://medicalclusterslrc.com/ayuda')}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Enviar Formulario</Text>
          </TouchableOpacity>
        </View>
        
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
  section: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f0c2e',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6f1b46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#000',
  },
  contactValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  scheduleContainer: {
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    padding: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  scheduleDay: {
    fontSize: 15,
    color: 'black',
    fontWeight: '500',
  },
  scheduleHours: {
    fontSize: 15,
    color: 'black',
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4f0c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f0c2e',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  emailButton: {
    backgroundColor: '#6f1b46',
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6f1b46',
    textAlign: 'center',
  },
});