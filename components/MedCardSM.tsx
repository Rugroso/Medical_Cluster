import { MaterialCommunityIcons } from "@expo/vector-icons"
import { StyleSheet, View, Text, Image } from "react-native"
import { Card } from "react-native-paper"

interface cardComponents {
  name: string
  description: string
  rating: number
  opening: string
  image: string
  isOpen: boolean
}

const MedCardSM = (props: cardComponents) => {
  return (
    <View style={styles.container}>
      <Card
        style={
          props.isOpen ? { ...styles.doctorCard } : { ...styles.doctorCard, backgroundColor: "rgba(0, 0, 0, 0.1)" }
        }
      >
        <View style={styles.cardContent}>
          <Image
            source={{
              uri: props.image,
            }}
            style={
              props.isOpen
                ? { ...styles.doctorImage }
                : { ...styles.doctorImage, backgroundColor: "rgba(0, 0, 0, 0.1)" }
            }
            resizeMode="cover"
          />
          <Card.Content style={styles.doctorContent}>
            {props.isOpen ? null : <Text style={{ color: "#FF6B2C", marginBottom: 0 }}>Cerrado</Text>}
            <Text style={styles.doctorName}>{props.name}</Text>
            <Text style={styles.doctorType}>{props.description}</Text>
            <View style={styles.doctorInfo}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="star" size={16} color="#FF6B2C" />
                {props.rating === 0 ? <Text style={styles.infoText}>Nuevo</Text> : <Text style={styles.infoText}>{props.rating.toFixed(1)}</Text>}
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{props.opening}</Text>
              </View>
            </View>
          </Card.Content>
        </View>
      </Card>
    </View>
  )
}

export default MedCardSM

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  doctorCard: {
    elevation: 2,
    width: "100%",
    height: 120, 
  },
  cardContent: {
    flexDirection: "row", 
    height: "100%",

  },
  doctorImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  doctorContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor:'#f8f8f8',
    borderTopEndRadius: 12,
    borderBottomEndRadius: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  doctorType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  doctorInfo: {
    flexDirection: "row", 
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
})

