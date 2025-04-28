import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SobreNosotrosScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        
        <View style={styles.headerSection}>
          <View >
            <Image
            source={require("../../assets/images/logo/Medical_Cluster_Logotipo_nbg.png")}
            style={{ width: 300, height: 300, alignSelf: "center", margin:-90}}
            resizeMode="contain"
            />
          </View>
          {/* <Text style={styles.title}>Medical Cluster SLRC</Text> */}
          {/* <Text style={styles.subtitle}>Conectando pacientes con profesionales de la salud</Text> */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra Misión</Text>
          <Text style={styles.sectionText}>
            Medical Cluster SLRC nace con el propósito de facilitar el acceso a servicios médicos de calidad en San Luis Río Colorado, 
            conectando a pacientes con profesionales de la salud de diversas especialidades a través de una plataforma digital intuitiva y eficiente.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Qué ofrecemos?</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="doctor" size={28} color="#ffffff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Directorio Médico Completo</Text>
              <Text style={styles.featureText}>
                Accede a información detallada de médicos de todas las especialidades en San Luis Río Colorado.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="calendar-check" size={28} color="#ffffff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Agenda de Citas</Text>
              <Text style={styles.featureText}>
                Programa citas médicas directamente desde la aplicación de manera rápida y sencilla.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="star" size={28} color="#ffffff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Calificaciones y Reseñas</Text>
              <Text style={styles.featureText}>
                Consulta y comparte experiencias con otros pacientes para elegir el profesional adecuado.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="map-marker" size={28} color="#ffffff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Ubicación y Contacto</Text>
              <Text style={styles.featureText}>
                Localiza consultorios médicos y obtén información de contacto para comunicarte directamente.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="medical-bag" size={28} color="#ffffff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Servicios Médicos</Text>
              <Text style={styles.featureText}>
                Conoce los servicios específicos que ofrece cada profesional de la salud.
              </Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Médicos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>30+</Text>
            <Text style={styles.statLabel}>Especialidades</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5000+</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios</Text>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#4f0c2e" />
            <Text style={styles.benefitText}>Ahorra tiempo al encontrar médicos especializados</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#4f0c2e" />
            <Text style={styles.benefitText}>Toma decisiones informadas basadas en calificaciones reales</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#4f0c2e" />
            <Text style={styles.benefitText}>Agenda citas sin llamadas telefónicas</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#4f0c2e" />
            <Text style={styles.benefitText}>Accede a toda la información médica de la ciudad en un solo lugar</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#4f0c2e" />
            <Text style={styles.benefitText}>Recibe recordatorios de tus citas programadas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra Historia</Text>
          <Text style={styles.sectionText}>
            Medical Cluster SLRC fue fundado con la visión de transformar el acceso a la atención médica en San Luis Río Colorado. 
            Identificamos la necesidad de una plataforma que centralizara la información de los profesionales de la salud en nuestra ciudad 
            y facilitara la conexión entre médicos y pacientes.
          </Text>
          <Text style={styles.sectionText}>
            Nos enorgullece ser un directorio médico que contribuye a mejorar la experiencia de atención médica para miles de ciudadanos.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>¿Tienes alguna pregunta?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Contáctanos</Text>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    maxWidth: '80%',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f0c2e',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6f1b46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    textAlign: 'justify',

  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#4f0c2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#f4ced4',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
    flex: 1,
    
  },
  contactSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f0c2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f0c2e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    marginTop: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6f1b46',
    textAlign: 'center',
  },
});