import { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Linking 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

// Use your Heroku endpoints
const API_BASE_URL = "https://new-hope-e46616a5d911.herokuapp.com/uploads/";
const CAMPAIGNS_API = "https://new-hope-e46616a5d911.herokuapp.com/campaigns";

export default function FundraiserScreen() {
  const navigation = useNavigation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(CAMPAIGNS_API)
      .then(response => {
        setCampaigns(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching campaigns:", error);
        Alert.alert("Error", "Failed to load campaigns.");
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const renderCampaignCard = ({ item }) => {
    // Determine image URL. Assume item.thumbnail is either a full URL or just a filename.
    const imageUrl = item.thumbnail && item.thumbnail.startsWith("http")
      ? item.thumbnail
      : `${API_BASE_URL}${item.thumbnail}`;

    return (
      <TouchableOpacity 
        style={styles.campaignCard}
        onPress={() => Linking.openURL(`https://kaifalamarah.com/campaign/details/${item.id}/donate-for-a-better-sierra-leone-2028`)}
      >
        {item.thumbnail ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.campaignImage} 
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <View style={styles.campaignContent}>
          <Text style={styles.campaignTitle}>{item.name || "Untitled Campaign"}</Text>
          <Text style={styles.campaignDescription}>
            {item.details ? item.details.substring(0, 80) + "..." : "No description available"}
          </Text>
          <Text style={styles.campaignRaised}>
            Raised: ${item.raised_amount || 0} / ${item.target_amount || 0}
          </Text>
          <Text style={styles.campaignDates}>
            Start Date: {formatDate(item.start_date)}
          </Text>
          <Text style={styles.campaignDates}>
            End Date: {formatDate(item.end_date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Current Campaigns</Text>
      <FlatList
        data={campaigns}
        renderItem={renderCampaignCard}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
    paddingTop: 80,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  campaignCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  campaignImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  noImageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#555",
    fontSize: 14,
  },
  campaignContent: {
    padding: 15,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  campaignDescription: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
    textAlign: "center",
  },
  campaignRaised: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
    marginBottom: 5,
  },
  campaignDates: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginBottom: 3,
  },
});
