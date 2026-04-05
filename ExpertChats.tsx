import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { UPLOADS_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

export default function ExpertChats() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveChats = async () => {
    if (!currentUser?.email) return;
    try {
      const emails = await api.get(`/chat/active-chats/${currentUser.email}`);
      if (Array.isArray(emails)) {
        const detailedChats = await Promise.all(emails.map(async (email: string) => {
          try {
            const userData = await api.get(`/user/${email}`);
            return {
              email: email,
              name: userData.full_name || email,
              city: userData.city || "Unknown",
              role: userData.role,
              profile_image: userData.profile_image
            };
          } catch (e) {
            return { email, name: email, city: "Unknown", role: "Farmer" };
          }
        }));
        setChats(detailedChats);
      }
    } catch (error) {
      console.error("Active chats fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveChats();
    }, [currentUser?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveChats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a8a3a" />
        <Text style={styles.loadingText}>Syncing conversations...</Text>
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
        <Text style={styles.title}>Active Conversations</Text>
      </View>

      {/* Chat List */}
      <ScrollView 
        style={styles.chatList}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No active chats found.</Text>
            <Text style={styles.emptySubText}>Start a conversation from the Queries page!</Text>
          </View>
        ) : (
          chats.map((chat) => (
            <TouchableOpacity 
              key={chat.email} 
              style={styles.chatCard}
              onPress={() => router.push({ pathname: '/farmer/ChatPage', params: { type: 'user', id: chat.email } } as any)}
            >
              <View style={styles.avatar}>
                {chat.profile_image ? (
                  <Image source={{ uri: `${UPLOADS_URL}${chat.profile_image}` }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{chat.name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.name}>{chat.name}</Text>
                <Text style={styles.sub}>{chat.role} • {chat.city}</Text>
              </View>
              <Text style={styles.arrow}>➜</Text>
            </TouchableOpacity>
          ))
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
    fontWeight: "bold",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  chatList: {
    padding: 20,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3a8a3a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: "#666",
  },
  arrow: {
    color: "#3a8a3a",
    fontSize: 18,
    fontWeight: "bold",
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
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "bold",
  },
  emptySubText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
