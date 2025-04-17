import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={24} 
            color="#6f1b46" 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function PreguntasFrecuentesScreen() {
  const faqData = [
    {
      question: "¿Cuáles son los horarios de atención?",
      answer: "Nuestros horarios de atención son de lunes a viernes de 8:00 AM a 8:00 PM, sábados de 9:00 AM a 2:00 PM, y domingos cerrado."
    },
    {
      question: "¿Cómo puedo agendar una cita?",
      answer: "Puedes agendar una cita llamando a nuestro número telefónico, a través de nuestra aplicación móvil o visitando nuestras instalaciones."
    },
    {
      question: "¿Qué especialidades médicas ofrecen?",
      answer: "Ofrecemos una amplia gama de especialidades médicas incluyendo medicina general, pediatría, ginecología, cardiología, dermatología, entre otras."
    },
    {
      question: "¿Aceptan seguros médicos?",
      answer: "Sí, trabajamos con las principales aseguradoras. Te recomendamos verificar la cobertura específica de tu póliza antes de tu visita."
    },
    {
      question: "¿Qué debo llevar a mi primera consulta?",
      answer: "Para tu primera consulta, te recomendamos traer tu identificación oficial, tarjeta del seguro médico (si aplica), historial médico relevante y lista de medicamentos que estés tomando actualmente."
    },
    {
      question: "¿Ofrecen servicios de emergencia?",
      answer: "Sí, contamos con servicios de atención de urgencias durante nuestro horario de operación. Para emergencias que pongan en riesgo la vida, recomendamos acudir al servicio de emergencias más cercano."
    },
    {
      question: "¿Cómo puedo obtener los resultados de mis estudios?",
      answer: "Los resultados de tus estudios estarán disponibles a través de nuestra aplicación móvil, o puedes recogerlos personalmente en nuestras instalaciones."
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.introSection}>
          <MaterialCommunityIcons name="frequently-asked-questions" size={40} color="#4f0c2e" />
          {/* <Text style={styles.introTitle}>Preguntas Frecuentes</Text> */}
          <Text style={styles.introText}>
            Encuentra respuestas a las preguntas más comunes sobre nuestros servicios, horarios y procedimientos.
          </Text>
        </View>
        
        <View style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <FAQItem 
              key={index} 
              question={item.question} 
              answer={item.answer} 
            />
          ))}
        </View>
        
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>¿No encontraste lo que buscabas?</Text>
          <Text style={styles.contactText}>
            Si tienes alguna pregunta adicional, no dudes en contactarnos directamente.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Contactar</Text>
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
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f0c2e',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  faqContainer: {
    marginBottom: 30,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    padding: 16,
    backgroundColor: '#e6e6e6',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  answerText: {
    fontSize: 15,
    color: 'black',
    lineHeight: 22,
    textAlign: 'justify',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
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