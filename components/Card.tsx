import { MaterialCommunityIcons } from "@expo/vector-icons"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native"
import { Provider as PaperProvider, Card, Searchbar } from "react-native-paper"

interface cardComponents {
    name:string;
    description:string;
    rating:number;
    opening:string
    image:string;
}

const BusinessCard  = (props: cardComponents) => {
    return (
        <PaperProvider>
            <View>
                <Card style={styles.restaurantCard}>
                <Card.Cover
                source={{
                    uri: props.image,
                }}
                style={styles.restaurantImage}
                />
                <Card.Content style={styles.restaurantContent}>
                <Text style={styles.restaurantName}>{props.name}</Text>
                <Text style={styles.restaurantType}>{props.description}</Text>
                <View style={styles.restaurantInfo}>
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
        </PaperProvider>
    )
}

export default BusinessCard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 999,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    elevation: 0,
    borderWidth: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#666",
    marginRight: 4,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: "center",
  },
  categoryIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  restaurantCard: {
    marginBottom: 16,
    elevation: 2,
  },
  restaurantImage: {
    height: 200,
  },
  restaurantContent: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  restaurantType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  restaurantInfo: {
    flexDirection: "row",
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

