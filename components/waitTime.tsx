import { useEffect, useState} from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WaitTime() {
  const [loading, setLoading] = useState(true);
  const [timeAvailable, setTimeAvailable] = useState(false);
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    fetch( 
      "https://bwt.cbp.gov/api/waittimes"
    )
      .then((response) => response.json())
      .then((data) => {
        data.map((item: any) => {
            if (item.port_number === '260801') {
                console.log('encontrado');
                setTimeAvailable(true);
                setWaitTime(item.passenger_vehicle_lanes.standard_lanes.delay_minutes);
            }
        });
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error obteniendo el tiempo de cruce a USA:", error);
        setTimeAvailable(false);
        setLoading(false);
      });
  }, [loading]);
  
  
  return (
    <View 
    style={{ padding: 6, marginTop:2, borderRadius: 50, marginBottom: 10, flexDirection: "row", alignItems: "center" }}
  >
    {loading  && (
      <Text>Cargando...</Text>
    )}
    {!loading && (
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <TouchableOpacity onPress={() => setLoading(true)} style={{marginRight:5}}>
          <MaterialCommunityIcons name='refresh' size={16}/>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "column", alignItems: "flex-end" }} onPress={() => {Linking.openURL('https://bwt.cbp.gov/details/08260801/POV')}} >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 5 }}>
                <MaterialCommunityIcons name='car' size={18} color="#333" />
              </View>
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