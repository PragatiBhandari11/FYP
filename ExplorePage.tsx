import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Star, MapPin, ShoppingBag, Filter } from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

const CATEGORIES = ['All', 'Vegetable', 'Fruits', 'Dairy', 'Plant'];

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const initialCategory = params.category as string || 'All';
  const initialSearch = params.search as string || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
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

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeFilter === 'All' || p.category?.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image_url ? `${UPLOADS_URL}${item.image_url}` : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea' }} 
          style={styles.cardImg}
        />
        <View style={styles.ratingBadge}>
          <Star size={10} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>Rs {item.price}</Text>
        <Text style={styles.ratingTextSmall}>⭐ 4.8</Text>
        
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => handleAddToCart(item.id)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Products</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search products, farmers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Filter size={18} color="#94a3b8" />
          </View>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: cat }) => (
            <TouchableOpacity 
              style={[styles.chip, activeFilter.toLowerCase() === cat.toLowerCase() && styles.chipActive]}
              onPress={() => setActiveFilter(cat)}
            >
              <Text style={[styles.chipText, activeFilter.toLowerCase() === cat.toLowerCase() && styles.chipTextActive]}>
                {cat}{cat === 'Vegetable' ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.filterScroll}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={64} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters or search.</Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2e8b57" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
  },
  chipActive: {
    backgroundColor: '#2e8b57',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  chipTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    height: 130,
    width: '100%',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1e293b',
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2e8b57',
    marginVertical: 4,
  },
  ratingTextSmall: {
    fontSize: 13,
    color: '#64748b',
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#16a34a',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
  },
});
