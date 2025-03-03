import React from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: '1', title: 'Médicos', icon: 'medkit' },
  { id: '2', title: 'Restaurantes', icon: 'restaurant' },
  { id: '3', title: 'Comercio y Servicios', icon: 'briefcase' },
  { id: '4', title: 'Educación', icon: 'school' },
  { id: '5', title: 'Deportes', icon: 'football' },
  { id: '6', title: 'Transporte', icon: 'bus' },
  { id: '7', title: 'Entretenimiento', icon: 'happy' },
  { id: '8', title: 'Gobierno', icon: 'business' },
];
const defColor = '#4f0b2e'


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView>
            <View style={styles.header}>
                <Text style={styles.headerText}>Conoce San Luis Río Colorado, Sonora</Text>
                <View style = {styles.justShadow}>
                    <Text></Text>
                </View>
            </View>
            <View style={styles.gridContainer}>
                {CATEGORIES.map((item) => (
                <TouchableOpacity key={item.id} style={styles.categoryButton}>
                    <Ionicons name={item.icon as any} size={32} color={defColor} style={styles.categoryIcon} />
                    <Text style={styles.categoryText}>{item.title}</Text>
                </TouchableOpacity>
                ))}
            </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 90,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  categoryButton: {
    width: '40%',
    aspectRatio: 1, 
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  justShadow: {
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});