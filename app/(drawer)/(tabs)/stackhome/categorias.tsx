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
  { id: '1', title: 'Anestesiología', icon: 'bed', path: './especialidades/anestesiologia', params: 'Anestesiología' },
  { id: '2', title: 'Cardiología', icon: 'heart', path: './especialidades/cardiologia', params: 'Cardiología' },
  { id: '3', title: 'Cirugía General', icon: 'doctor', path: './especialidades/cirugia-general', params: 'Cirugía General' },
  { id: '4', title: 'Dermatología', icon: 'brush', path: './especialidades/dermatologia', params: 'Dermatología' },
  { id: '5', title: 'Endocrinología', icon: 'flask', path: './especialidades/endocrinologia', params: 'Endocrinología' },
  { id: '6', title: 'Gastroenterología', icon: 'stomach', path: './especialidades/gastroenterologia', params: 'Gastroenterología' },
  { id: '7', title: 'Ginecología y Obstetricia', icon: 'human-female', path: './especialidades/ginecologia-obstetricia', params: 'Ginecología y Obstetricia' },
  { id: '8', title: 'Hematología', icon: 'water', path: './especialidades/hematologia', params: 'Hematología' },
  { id: '9', title: 'Infectología', icon: 'virus', path: './especialidades/infectologia', params: 'Infectología' },
  { id: '10', title: 'Nefrología', icon: 'water-outline', path: './especialidades/nefrologia', params: 'Nefrología' },
  { id: '11', title: 'Neumología', icon: 'lungs', path: './especialidades/neumologia', params: 'Neumología' },
  { id: '12', title: 'Neurología', icon: 'brain', path: './especialidades/neurologia', params: 'Neurología' },
  { id: '13', title: 'Odontología', icon: 'tooth', path: './especialidades/odontologia', params: 'Odontología' },
  { id: '14', title: 'Oftalmología', icon: 'eye', path: './especialidades/oftalmologia', params: 'Oftalmología' },
  { id: '15', title: 'Oncología', icon: 'alert-circle', path: './especialidades/oncologia', params: 'Oncología' },
  { id: '16', title: 'Ortopedia', icon: 'seat-legroom-normal', path: './especialidades/ortopedia', params: 'Ortopedia' },
  { id: '17', title: 'Pediatría', icon: 'human-child', path: './especialidades/pediatria', params: 'Pediatría' },
  { id: '18', title: 'Psicología', icon: 'chat', path: './especialidades/psicología', params: 'Psicología' },
  { id: '19', title: 'Psiquiatría', icon: 'pill', path: './especialidades/psiquiatria', params: 'Psiquiatría' },
  { id: '20', title: 'Radiología', icon: 'radioactive-circle', path: './especialidades/radiologia', params: 'Radiología' },
  { id: '21', title: 'Reumatología', icon: 'bone', path: './especialidades/reumatologia', params: 'Reumatología' },
  { id: '22', title: 'Urología', icon: 'water', path: './especialidades/urologia', params: 'Urología' },
];
const defColor = '#4f0b2e'


export default function App() {
  const router = useRouter();

  const handleNavigation = (path: string, params:string) => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({pathname:'/(drawer)/(tabs)/stackhome/categorias/medicos', params: {specialty: params}});
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
                <TouchableOpacity key={item.id} style={styles.categoryButton} onPress={() => handleNavigation(item.path, item.params)}>
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
    marginBottom:'-170%'
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