import { useEffect, useState} from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { db } from "@/config/Firebase_Conf";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface WeatherProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export default function Weather({ loading, setLoading }: WeatherProps) {
  const [temperature, setTemperature] = useState(0);
  const [actualCode, setActualCode] = useState(0);
  const [weatherAvailable, setWeatherAvailable] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'none' | 'celsius' | 'fahrenheit' | null>(null);
  const { user } = useAuth();

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferences) {
          const preferences = userDoc.data().preferences;
          if (preferences.temperatureUnit) {
            setTemperatureUnit(preferences.temperatureUnit);
          }
        } else {
          setTemperatureUnit('none');
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (loading) {
      loadUserPreferences();
    }
  }, [user, loading]);

  const weatherIcons: { [key: number]: string } = {
    0: "weather-sunny", // Soleado
    1: "weather-partly-cloudy", // Mayormente soleado
    2: "weather-cloudy", // Nublado
    3: "weather-cloudy", // Nublado
    45: "weather-fog", // Niebla
    48: "weather-fog", // Niebla escarchada
    51: "weather-rainy", // Lluvia ligera
    53: "weather-pouring", // Lluvia moderada
    55: "weather-lightning-rainy", // Lluvia fuerte
    61: "weather-rainy", // Lluvia leve
    63: "weather-pouring", // Lluvia fuerte
    65: "weather-lightning-rainy", // Tormenta
    71: "weather-snowy", // Nieve ligera
    73: "weather-snowy-heavy", // Nieve moderada
    75: "weather-snowy-heavy", // Nieve fuerte
    95: "weather-lightning", // Tormenta eléctrica
    96: "weather-lightning-rainy", // Tormenta con lluvia
    99: "weather-lightning-rainy", // Tormenta fuerte
    100:"weather-night", // Noche despejada
    101: "weather-night-partly-cloudy", // Noche parcialmente nublada
  };

  
  const fetchWeatherData = async () => {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=32.4561&longitude=-114.7719&current=temperature_2m,weather_code,is_day&models=gfs_seamless&temperature_unit=${temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius'}`;
    
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setTemperature(data.current.temperature_2m);

        if (data.current.is_day === 0 && data.current.weather_code == 0) {
          setActualCode(100);
        }
        else if (data.current.is_day === 0  && data.current.weather_code == 1) {
          setActualCode(101);
        } else {
          setActualCode(data.current.weather_code);
        }
        setWeatherAvailable(true);
      })
      .catch((error) => {
        setWeatherAvailable(false);
      });
   }

  useEffect(() => {
    if (temperatureUnit || temperatureUnit === 'none') {
      fetchWeatherData();
    }
  }, [loading, temperatureUnit]);
  
  return (
    <View 
      style={{ padding: 6, marginTop: 2, borderRadius: 50, marginBottom: 10, flexDirection: "row", alignItems: "center" }}
    >
      {loading && (
        <Text>Cargando...</Text>
      )}
      {!loading && weatherAvailable && (
        <TouchableOpacity 
          style={{ flexDirection: "column", alignItems: "flex-end" }} 
          onPress={() => {Linking.openURL('https://weather.com/es-MX/tiempo/hoy/l/4cefff595fd4f7ce3f6c913dc51d53715584b747fcd7d1ea0773d2b90ad68275')}}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {weatherIcons[actualCode] && (
              <View style={{ marginRight: 5 }}>
                <MaterialCommunityIcons name={weatherIcons[actualCode] as any} size={24} color="#333" />
              </View>
            )}
            <Text>{(temperature)}°{temperatureUnit === 'fahrenheit' ? 'F' : 'C'}</Text>
          </View>
          <View>
            <Text style={{color:'gray', fontSize:11, textAlign:'right'}}>San Luis R.C.</Text>
          </View>
        </TouchableOpacity>
      )}
      {!loading && !weatherAvailable && (
        <TouchableOpacity 
          style={{ flexDirection: "column", alignItems: "flex-end" }} 
          onPress={() => {Linking.openURL('https://weather.com/es-MX/tiempo/hoy/l/4cefff595fd4f7ce3f6c913dc51d53715584b747fcd7d1ea0773d2b90ad68275')}}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>?°{temperatureUnit === 'fahrenheit' ? 'F' : 'C'}</Text>
          </View>
          <View>
            <Text style={{color:'gray', fontSize:11}}>Sin datos del clima</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}