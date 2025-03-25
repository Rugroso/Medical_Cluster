import React from 'react';
import { useRouter } from 'expo-router';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";

const categories = [
  { id: '1', title: 'Anestesiología', icon: 'bed', path: './especialidades/anestesiologia' },
  { id: '2', title: 'Cardiología', icon: 'heart', path: './especialidades/cardiologia' },
  { id: '3', title: 'Cirugía General', icon: 'doctor', path: './especialidades/cirugia-general' },
  { id: '4', title: 'Dermatología', icon: 'brush', path: './especialidades/dermatologia' },
  { id: '5', title: 'Endocrinología', icon: 'flask', path: './especialidades/endocrinologia' },
  { id: '6', title: 'Gastroenterología', icon: 'stomach', path: './especialidades/gastroenterologia' },
  { id: '7', title: 'Ginecología y Obstetricia', icon: 'human-female', path: './especialidades/ginecologia-obstetricia' },
  { id: '8', title: 'Hematología', icon: 'water', path: './especialidades/hematologia' },
  { id: '9', title: 'Infectología', icon: 'virus', path: './especialidades/infectologia' },
  { id: '10', title: 'Nefrología', icon: 'water-outline', path: './especialidades/nefrologia' },
  { id: '11', title: 'Neumología', icon: 'lungs', path: './especialidades/neumologia' },
  { id: '12', title: 'Neurología', icon: 'brain', path: './especialidades/neurologia' },
  { id: '13', title: 'Odontología', icon: 'tooth', path: './especialidades/odontologia' },
  { id: '14', title: 'Oftalmología', icon: 'eye', path: './especialidades/oftalmologia' },
  { id: '15', title: 'Oncología', icon: 'alert-circle', path: './especialidades/oncologia' },
  { id: '16', title: 'Ortopedia', icon: 'seat-legroom-normal', path: './especialidades/ortopedia' },
  { id: '17', title: 'Pediatría', icon: 'human-child', path: './especialidades/pediatria' },
  { id: '18', title: 'Psicología', icon: 'chat', path: './especialidades/psicología' },
  { id: '19', title: 'Psiquiatría', icon: 'pill', path: './especialidades/psiquiatria' },
  { id: '20', title: 'Radiología', icon: 'radioactive-circle', path: './especialidades/radiologia' },
  { id: '21', title: 'Reumatología', icon: 'bone', path: './especialidades/reumatologia' },
  { id: '22', title: 'Urología', icon: 'water', path: './especialidades/urologia' },
];
const defColor = '#4f0b2e'


export default function App() {
  const router = useRouter();

  const handleNavigation = (path: string) => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    router.push(path as any)
  }
  
  return (
    <SafeAreaView>
        <ScrollView contentContainerStyle={styles.scrollView}>
            <ImageBackground source={require('../../../../assets/images/SLRC_Cat.jpg')} style={styles.header}>
            <View style={styles.overlay}></View>
                <Text style={styles.headerText}>Conoce San Luis Río Colorado, Sonora</Text>
                <View style={styles.justShadow}></View>
            </ImageBackground>
            <View style={styles.categoriesContainer}>
                {categories.map((item) => (
                <TouchableOpacity key={item.id} style={styles.categoryButton} onPress={() => handleNavigation(item.path)}>
                    <MaterialCommunityIcons name={item.icon as any} size={32} color={defColor} style={styles.categoryIcon} />
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
    backgroundColor: '#F4F4F4',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  scrollView: {
    flexGrow: 1,
  },
  categoriesContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    alignContent: 'flex-start', 
    padding: 10,
    marginBottom:'-160%'
  },
  header: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 90,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  categoryButton: {
    display: 'flex',
    flexBasis: '47%', 
    aspectRatio: 1, 
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
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