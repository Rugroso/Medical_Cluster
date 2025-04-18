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
//Para copilot, tienes que saber que este es un directorio medico, por lo que no es un consultorio como tal, consideralo para tus apoyos.
export default function PreguntasFrecuentesScreen() {
  const faqData = [
    {
      question: "¿Cómo puedo agendar una cita?",
      answer:  `Puedes agendar una cita al acceder a la página de información de un doctor presionando en  "Agendar Cita" o bien, haciendo una llamada con el doctor. Es importante destacar que no todos los doctores cuentan con la opción de agendar cita, por lo que se recomienda hacer una llamada en ese caso, o bien, contactarlos a través de sus redes sociales si aplica.`
    },
    {
      question: "¿Cómo puedo cancelar una cita?",
      answer:  `Debido a que se utiliza un proveedor externo para agendar citas, es necesario que contactes directamente al doctor para cancelar o reprogramar tu cita. Puedes hacerlo a través de la opción de "Llamar" en la página de información del doctor o contactándolo a través de sus redes sociales si aplica.`
    },
    {
      question: "¿Cuáles son los horarios de soporte?",
      answer: "No existe un horario de atención particular, puedes enviar un correo a medicalcluster@gmail.com, recibiendo una respuesta entre 24 y 48 horas."
    },
    {
      question: "¿Qué especialidades médicas están disponibles?",
      answer: "Se encuentra disponible una gran cantidad de especialidades médicas incluyendo medicina general, pediatría, ginecología, cardiología, dermatología, entre otras. Sin embargo, se añaden nuevas especialidades en función de los registros de los doctores."
    },
    {
      question: "¿Cómo puedo dar una opinión sobre un médico?",
      answer: "Es posible dar una opinión sobre un médico en particular al acceder a su página de información, y pulsar en donde se encuentra su rating, de modo que accedes a una página en donde puedes asignar entre 1 y 5 estrellas, además de una opinión escrita."
    },
    {
      question: "¿Cómo puedo reportar un problema técnico?",
      answer: `Si encuentras un problema técnico, puedes reportarlo enviando un correo electrónico a medicalcluster@gmail.com. o a través del chat en vivo`
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
            <MaterialCommunityIcons name="email" size={20} color="#ffffff" />
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