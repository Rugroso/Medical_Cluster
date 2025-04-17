import { useEffect, useState} from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { db } from "@/config/Firebase_Conf";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function WaitTime() {
  const [loading, setLoading] = useState(true);
  const [timeAvailable, setTimeAvailable] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [crossingType, setCrossingType] = useState<null | 'none' | 'general' | 'sentri' | 'readyline' | 'pedestrian'>(null);
  const { user } = useAuth()

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferences) {
          const preferences = userDoc.data().preferences;
          if (preferences.crossingType) {
            console.log('Tipo de cruce:', preferences.crossingType);
            setCrossingType(preferences.crossingType);
          }
        }          
        else {
          setCrossingType('none');
        }
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      loadUserPreferences()
    }
  }, [user, loading]);

  const fetchLoadingTimes = async () => {
      fetch( 
        "https://bwt.cbp.gov/api/waittimes"
      )
        .then((response) => response.json())
        .then((data) => {
          data.map((item: any) => {
              if (item.port_number === '260801') {
                  if (item.passenger_vehicle_lanes.standard_lanes.delay_minutes === '') {
                    setTimeAvailable(false);
                  } else {
                  setTimeAvailable(true);
                  if (crossingType === 'general') {
                    setWaitTime(item.passenger_vehicle_lanes.standard_lanes.delay_minutes);
                  } else if (crossingType === 'sentri') {
                    setWaitTime(item.passenger_vehicle_lanes.NEXUS_SENTRI_lanes.delay_minutes);
                  } else if (crossingType === 'readyline') {
                    setWaitTime(item.passenger_vehicle_lanes.ready_lanes.delay_minutes);
                  } else if (crossingType === 'pedestrian') {
                    setWaitTime(item.pedestrian_lanes.standard_lanes.delay_minutes);
                  } else {
                    setWaitTime(item.passenger_vehicle_lanes.standard_lanes.delay_minutes);
                  }
                  }
              }
          });
          
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error obteniendo el tiempo de cruce a USA:", error);
          setTimeAvailable(false);
          setLoading(false);
        });
  }

  useEffect(() => {
    if (crossingType || crossingType === 'none') {
      fetchLoadingTimes()
    }
  }, [loading, crossingType]);
  
  
  return (
    <View 
    style={{ padding: 6, marginTop:2, borderRadius: 50, marginBottom: 10, flexDirection: "row", alignItems: "center" }}
  >
    {loading  && (
      <Text style={{marginBottom:-5}}>Cargando...</Text>
    )}
    {!loading && (
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:-5}}>
        <TouchableOpacity onPress={() => setLoading(true)} style={{marginRight:5}}>
          <MaterialCommunityIcons name='refresh' size={16}/>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "column", alignItems: "flex-end" }} onPress={() => {Linking.openURL('https://bwt.cbp.gov/details/08260801/POV')}} >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {crossingType === 'pedestrian' ? (
              <View style={{ marginRight: 5 }}>
                <MaterialCommunityIcons name='walk' size={18} color="#333" />
              </View>
            ) : (
              <View style={{ marginRight: 5 }}>
                <MaterialCommunityIcons name='car' size={18} color="#333" />
              </View>
            )}
            {timeAvailable ? (
              <Text>{waitTime} min</Text>
            ): (
              <Text>Sin datos</Text>
            )}
            
          </View>
          <View>
            <Text style={{color:'gray', fontSize:11}}>Cruce a U.S.A.</Text>
          </View>
        </TouchableOpacity>
      </View>
    )}
  </View>
  );
}