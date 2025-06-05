import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ImageBackground,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { db } from '@/config/Firebase_Conf';
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const defColor = '#4f0b2e'

type Specialties = {
  id: string;
  title: string;
  icon: string;
  path: string;
  params: string;
};


export default function App() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<Specialties[]>([]);
  const [loading, setLoading] = useState(true);

  const getSpecialties = async () => {
    console.log('Fetching specialties...');
    const specialtiesRef = collection(db, "specialties");
    const q = query(specialtiesRef, orderBy("title"));
    const specialtiesData = await getDocs(q);
    return specialtiesData.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Specialties[];
  };

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const specialtiesData = await getSpecialties();
        setLoading(false);
        setSpecialties(specialtiesData);
      } catch (error) {
        setLoading(false);
        setSpecialties([]);
        console.error('Error fetching specialties:', error);
      }
    };
    fetchSpecialties();
  }, [loading]);

  const handleNavigation = (path: string, params: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(drawer)/(tabs)/stackhome/categorias/medicos',
      params: { specialty: params }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
        <FlatList
          onRefresh={() => {setLoading(true)}}
          refreshing={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          ListHeaderComponent={
            <ImageBackground
              source={require('../../../../assets/images/SLRC_Cat.jpg')}
              style={styles.header}
            >
              <View style={styles.overlay} />
              <Text style={styles.headerText}>
                Conoce San Luis Río Colorado, Sonora
              </Text>
            </ImageBackground>
          }
            data={specialties}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}
            columnWrapperStyle={{ justifyContent: 'space-between', marginTop: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => handleNavigation(item.path, item.params)}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={32}
                  color={defColor}
                />
                <Text style={styles.categoryText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scrollView: {
    paddingBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  header: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 90,
    marginHorizontal: '-5%',
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
    width: '47%',
    height: 100,
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
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