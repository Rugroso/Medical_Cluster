import { MaterialCommunityIcons } from "@expo/vector-icons"
import { StyleSheet, View, Text } from "react-native"
import { Provider as PaperProvider, Card } from "react-native-paper"

interface cardComponents {
    name: string;
    description: string;
    rating: number;
    opening: string;
    image: string;
    isOpen: boolean;
}

const MedCard = (props: cardComponents) => {
    return (

            <View style={styles.container}>
                <Card style={ props.isOpen ? {...styles.doctorCard} : {...styles.doctorCard, backgroundColor: "rgba(0, 0, 0, 0.1)"}}>
                    <Card.Cover
                        source={{
                            uri: props.image,
                        }}
                        style={ props.isOpen ? {...styles.doctorImage } : {...styles.doctorImage, backgroundColor: "rgba(0, 0, 0, 0.1)"}}
                    />
                    <Card.Content style={styles.doctorContent}>
                        <Text style={styles.doctorName}>{props.name}</Text>
                        <Text style={styles.doctorType}>{props.description}</Text>
                        <View style={styles.doctorInfo}>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="star" size={16} color="#FF6B2C" />
                                <Text style={styles.infoText}>{props.rating}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                                <Text style={styles.infoText}>{props.opening}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </View>
    )
}

export default MedCard

const styles = StyleSheet.create({
    container: {
        width:"100%",
      }, 
    doctorCard: {
        elevation: 2,
        width: "100%",
        height: 330,
    },
    doctorImage: {
        height: 170,
    },
    doctorContent: {
        padding: 16,
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
        flexDirection: "column",
        gap: 16,
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