import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { UPLOADS_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

export default function KnowledgePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = async () => {
    try {
      const data = await api.get('/articles');
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchArticles();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Delete Article', 'Are you sure you want to remove this article from the hub?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/articles/${id}`);
          setArticles(articles.filter(a => a.id !== id));
        } catch (e) {
          Alert.alert('Error', 'Failed to delete article.');
        }
      }}
    ]);
  };

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.category || "General").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a8a3a" />
        <Text style={styles.loadingText}>Loading articles...</Text>
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
        <Text style={styles.title}>Knowledge Hub</Text>
        {user?.role === 'Expert' ? (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/expert/ArticleForm' as any)}
          >
            <Text style={styles.addButtonText}>+ Write</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.search}
          placeholder="Search articles, tips, or guides..." 
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Article List */}
      <ScrollView 
        style={styles.articleList}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <View key={article.id} style={styles.articleCard}>
              {article.image_url && (
                <Image 
                  source={{ uri: `${UPLOADS_URL}${article.image_url}` }} 
                  style={styles.articleImage} 
                />
              )}
              <View style={styles.content}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{article.category || "General"}</Text>
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.excerpt} numberOfLines={3}>
                  {article.content}
                </Text>
                
                <View style={styles.footer}>
                  <TouchableOpacity 
                    onPress={() => router.push({ pathname: '/farmer/ArticleDetail', params: { id: article.id } } as any)}
                  >
                    <Text style={styles.readMore}>Read Full Article</Text>
                  </TouchableOpacity>
                  
                  {user?.role === 'Expert' && user?.email === article.author_email && (
                    <View style={styles.expertActions}>
                      <TouchableOpacity 
                        style={styles.editBtn}
                        onPress={() => router.push({ pathname: '/expert/ArticleForm', params: { id: article.id } } as any)}
                      >
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(article.id)}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noData}>
             <Text style={styles.noDataText}>No articles published yet.</Text>
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
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  backButton: {
    padding: 5,
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
    textAlign: "center",
    flex: 1,
  },
  addButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#3a8a3a",
    fontWeight: "bold",
    fontSize: 12,
  },
  searchContainer: {
    padding: 15,
  },
  search: {
    backgroundColor: "white",
    padding: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
    color: "#333",
  },
  articleList: {
    paddingHorizontal: 15,
  },
  articleCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  articleImage: {
    width: "100%",
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 15,
  },
  categoryBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: "#3a8a3a",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  articleTitle: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    lineHeight: 22,
  },
  excerpt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  readMore: {
    color: "#3a8a3a",
    fontWeight: "bold",
    fontSize: 14,
  },
  expertActions: {
    flexDirection: "row",
    gap: 10,
  },
  editBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editBtnText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 12,
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
  noData: {
    paddingVertical: 50,
    alignItems: "center",
  },
  noDataText: {
    color: "#999",
    fontSize: 14,
  },
});
