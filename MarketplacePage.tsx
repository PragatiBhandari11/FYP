import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, Megaphone, Plus, User, Calendar, Tag, ShoppingCart, Star } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { UPLOADS_URL } from '../../constants/API';

const INITIAL_POSTS = [];

const MARKET_PRICES = [
  { item: "Tomato", price: "30 NPR/kg", trend: 'up' },
  { item: "Maize Seed", price: "120 NPR/kg", trend: 'down' },
  { item: "Potato", price: "25 NPR/kg", trend: 'stable' },
  { item: "Rice", price: "40 NPR/kg", trend: 'up' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<any[]>([]); // These will now be products/posts from backend
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState(user?.fullName || "");
  const [newContent, setNewContent] = useState("");

  const fetchPosts = async () => {
    try {
      // In this app, the marketplace typically displays the recent products as 'posts'
      const data = await api.get('/products');
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleAddToCart = async (productId: number) => {
    if (!user?.email) {
      Alert.alert('Login Required', 'Please login to add items to your cart.');
      return;
    }
    try {
      const res = await api.post('/cart/add', { buyerEmail: user?.email, productId });
      if (res.success !== false) {
        Alert.alert('Success 🛒', 'Product added to your cart!');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add to cart.');
    }
  };

  const addNewPost = () => {
    // This allows farmers/users to post manual updates to the feed (text-based)
    if (!newFarmerName.trim() || !newContent.trim()) {
      Alert.alert("Required", "Please enter your name and post content.");
      return;
    }

    const newPost = {
      id: Date.now(),
      farmer_name: newFarmerName.trim(), // Use DB naming convention
      description: newContent.trim(),
      created_at: new Date().toISOString(),
      is_text_post: true
    };

    setPosts([newPost, ...posts]);
    setNewFarmerName(user?.fullName || "");
    setNewContent("");
    Alert.alert("Success ✅", "Your post has been shared with the community.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Marketplace</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Market Prices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Current Market Prices</Text>
          </View>
          <View style={styles.priceCard}>
            {MARKET_PRICES.map((item, index) => (
              <View key={index} style={[styles.priceRow, index === MARKET_PRICES.length - 1 && styles.noBorder]}>
                <View style={styles.priceLeft}>
                  <View style={styles.priceDot} />
                  <Text style={styles.priceItem}>{item.item}</Text>
                </View>
                <Text style={styles.priceValue}>{item.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Add Post Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Plus size={20} color="hsl(142, 76%, 36%)" />
            <Text style={styles.sectionTitle}>Add Your Post</Text>
          </View>
          <View style={styles.postForm}>
            <TextInput 
              style={styles.input} 
              placeholder="Your Name" 
              value={newFarmerName}
              onChangeText={setNewFarmerName}
            />
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="What are you selling or looking for?" 
              multiline
              value={newContent}
              onChangeText={setNewContent}
            />
            <TouchableOpacity style={styles.postBtn} onPress={addNewPost}>
              <Text style={styles.postBtnText}>Post to Marketplace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Megaphone size={20} color="#ea580c" />
            <Text style={styles.sectionTitle}>Farmer Posts</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
          ) : posts.length === 0 ? (
            <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
          ) : (
            posts.map(post => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    <User size={18} color="#16a34a" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.postAuthor}>{post.farmer_name || post.farmerName || 'Local Farmer'}</Text>
                    <View style={styles.postDateRow}>
                      <Calendar size={10} color="#94a3b8" />
                      <Text style={styles.postDate}>
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : (post.date || 'Today')}
                      </Text>
                    </View>
                  </View>
                  
                  {!post.is_text_post && (
                    <View style={styles.priceTag}>
                      <Text style={styles.priceTagText}>Rs {post.price || 'Market'}</Text>
                    </View>
                  )}
                </View>

                {post.image_url && (
                  <View style={styles.postImageContainer}>
                    <Image 
                      source={{ uri: `${UPLOADS_URL}${post.image_url}` }} 
                      style={styles.postImage} 
                    />
                  </View>
                )}

                <Text style={styles.postContent}>{post.description || post.content || post.name}</Text>
                
                <View style={styles.postFooter}>
                  <TouchableOpacity 
                    style={styles.postAction} 
                    onPress={() => !post.is_text_post ? handleAddToCart(post.id) : Alert.alert('Contact', 'Connecting to farmer...')}
                  >
                    {!post.is_text_post ? (
                      <>
                        <ShoppingCart size={14} color="#16a34a" />
                        <Text style={[styles.postActionText, { color: '#16a34a' }]}>Add to Cart</Text>
                      </>
                    ) : (
                      <>
                        <Tag size={14} color="#64748b" />
                        <Text style={styles.postActionText}>Contact Farmer</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  {!post.is_text_post && (
                    <View style={[styles.postAction, { opacity: 0.8 }]}>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <Text style={styles.postActionText}>{post.stock_quantity || '10'}kg active stock</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },
  priceCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  priceItem: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803d',
  },
  postForm: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postBtn: {
    backgroundColor: 'hsl(142, 76%, 36%)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  postBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  priceTag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
  },
  postImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  postDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  postDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 30,
    fontStyle: 'italic',
  },
});
