import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../utils/api';
import { UPLOADS_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

const CATEGORIES_COLORS = {
  DISEASE: "#f87171",
  URGENT: "#ef4444",
  PENDING: "#f59e0b",
  RESOLVED: "#10b981",
  GENERAL: "#3b82f6",
};

export default function Queries() {
  const router = useRouter();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchQueries = async () => {
    try {
      const data = await api.get("/disease/reports");
      setQueries(data || []);
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQueries();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueries();
  };

  const filteredQueries = queries.filter((q) => {
    if (filter === "All") return true;
    if (filter === "Pending") return q.status === "Pending";
    if (filter === "Resolved") return q.status === "Responded";
    return true;
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a8a3a" />
        <Text style={styles.loadingText}>Loading queries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Farmer Queries</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Search queries, crops, or diseases..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {["All", "Pending", "Resolved"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filter,
                filter === f && styles.filterActive
              ]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Queries List */}
      <ScrollView 
        style={styles.queriesList}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredQueries.length > 0 ? (
          filteredQueries.map((q) => (
            <View key={q.id} style={styles.queryCard}>
              <View style={styles.categoryRow}>
                <View
                  style={[
                    styles.category,
                    { backgroundColor: q.status === "Pending" ? CATEGORIES_COLORS.PENDING : CATEGORIES_COLORS.RESOLVED }
                  ]}
                >
                  <Text style={styles.categoryText}>{q.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.time}>{new Date(q.created_at).toLocaleDateString()}</Text>
              </View>
              
              <Text style={styles.queryTitle}>{q.description || "No description provided"}</Text>
              
              {q.image_url && (
                <Image 
                  source={{ uri: `${UPLOADS_URL}${q.image_url}` }} 
                  style={styles.queryImage} 
                />
              )}
              
              <View style={styles.footer}>
                <View style={styles.userRow}>
                  <Text style={styles.userIcon}>👤</Text>
                  <Text style={styles.userText}>{q.farmer_name}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.btnIgnore}>
                    <Text style={styles.btnIgnoreText}>Ignore</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.btnReply}
                    onPress={() => router.push('/expert/ExpertDiseaseReports')}
                  >
                    <Text style={styles.btnReplyText}>Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.btnChat}
                    onPress={() => router.push({ pathname: '/farmer/ChatPage', params: { type: 'user', id: q.farmer_email } } as any)}
                  >
                    <Text style={styles.btnChatText}>💬 Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>No queries found for this filter.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f9f5",
  },
  header: {
    backgroundColor: "#3a8a3a",
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    padding: 15,
  },
  search: {
    width: "100%",
    padding: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
    backgroundColor: "white",
    color: "#333",
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filters: {
    paddingHorizontal: 15,
    gap: 10,
  },
  filter: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3a8a3a",
    backgroundColor: "white",
  },
  filterActive: {
    backgroundColor: "#3a8a3a",
  },
  filterText: {
    color: "#3a8a3a",
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "white",
  },
  queriesList: {
    paddingHorizontal: 15,
  },
  queryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  category: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  time: {
    fontSize: 11,
    color: "#888",
  },
  queryTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  queryImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  userText: {
    fontSize: 12,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  btnIgnore: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnIgnoreText: {
    fontSize: 12,
    color: "#666",
  },
  btnReply: {
    backgroundColor: "#3a8a3a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnReplyText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  btnChat: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnChatText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f9f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  noData: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    color: "#999",
    fontSize: 14,
  },
});
