import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Dimensions, 
  FlatList,
  RefreshControl 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

const COLORS = {
  primary: '#16a34a',
  bgOuter: '#e5f2e5',
  bgInner: '#f2fbf6',
  white: '#ffffff',
  textMain: '#111111',
  textMuted: '#6b7280',
  borderColor: '#e5e7eb',
  accent: '#f3f4f6',
};

export default function FarmerProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [error, setError] = useState('');

  const categories = ["All", "Vegetable", "Fruits", "Dairy", "Plant"];

  const fetchProducts = async () => {
    if (!user?.email) {
      setError("Please log in as a farmer to view your products.");
      setLoading(false);
      return;
    }

    try {
      // Fetch all products for the Marketplace view (as per user's web snippet logic)
      const data = await api.get('/products');
      setProducts(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError("Could not load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = activeFilter === "All" || product.category?.toLowerCase() === activeFilter.toLowerCase();
    return nameMatch && categoryMatch;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image 
        style={styles.productImg} 
        source={{ uri: item.image_url ? `${UPLOADS_URL}${item.image_url}` : 'https://via.placeholder.com/80' }} 
      />
      <View style={styles.productInfo}>
        <View>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCat}>{item.category} • By {item.farmer_name || "Unknown Farmer"}</Text>
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>Rs {item.price}</Text>
          <Text style={styles.productQty}>{item.quantity} kg left</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.appContainer}>
      <View style={styles.contentScroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.push('/farmer/FarmerDashboard' as any)}
          >
            <ArrowLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Marketplace</Text>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => router.push('/farmer/AddProduct' as any)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search products..." 
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterOuter}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterContainer}
          >
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.filterChip, activeFilter === cat && styles.filterChipActive]}
                onPress={() => setActiveFilter(cat)}
              >
                <Text style={[styles.filterChipText, activeFilter === cat && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.productList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <ShoppingBag size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptySubtitle}>We couldn't find any products matching your search or filter.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bgOuter,
  },
  contentScroll: {
    flex: 1,
    backgroundColor: COLORS.bgInner,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
    overflow: 'hidden',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  filterOuter: {
    marginBottom: 5,
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
  },
  productList: {
    gap: 16,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  productCat: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productQty: {
    fontSize: 12,
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
