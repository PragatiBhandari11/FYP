import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl, 
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Package, 
  CheckCircle2, 
  XCircle,
  Bell
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#16a34a',
  bgOuter: '#e5f2e5',
  bgInner: '#f2fbf6',
  white: '#ffffff',
  textMain: '#111111',
  textMuted: '#6b7280',
  borderColor: '#e5e7eb',
  accent: '#f3f4f6',
  warning: '#ff9800',
  danger: '#d32f2f',
};

const CATEGORIES = ["All", "Vegetable", "Fruits", "Dairy", "Plant"];

export default function MyProducts() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastY = useRef(new Animated.Value(-100)).current;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    Animated.spring(toastY, { toValue: 50, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => {
        setToast(prev => ({ ...prev, show: false }));
      });
    }, 3000);
  };

  const fetchProducts = async () => {
    if (!user?.email) return;
    try {
      const data = await api.get(`/products/farmer/${user.email}`);
      setProducts(data);
    } catch (error) {
      console.error("My products fetch error:", error);
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

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: () => setMenuOpen(null) },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
             try {
               const res = await api.delete(`/products/${id}`);
               if (res.success !== false) {
                 showToast("Product removed! ✅");
                 fetchProducts();
               } else {
                 showToast(res.message || "Deletion failed.", "error");
               }
             } catch (err) {
               showToast("Server error.", "error");
             } finally {
               setMenuOpen(null);
             }
          }
        }
      ]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === "All" || p.category?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.appContainer}>
      {/* Custom Toast */}
      {toast.show && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastY }] }]}>
          <View style={[styles.toastContent, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
            {toast.type === 'success' ? <CheckCircle2 size={18} color="#16a34a" /> : <XCircle size={18} color="#ef4444" />}
            <Text style={[styles.toastText, toast.type === 'error' ? { color: '#ef4444' } : { color: '#16a34a' }]}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.push('/farmer/FarmerDashboard' as any)}>
          <ArrowLeft size={24} color={COLORS.primary} />
          <Text style={styles.backText}>My Farm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bell}>
           <Bell size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search my products..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.filterChip, activeFilter === cat && styles.filterChipActive]}
                onPress={() => setActiveFilter(cat)}
              >
                <Text style={[styles.filterText, activeFilter === cat && styles.filterTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product List */}
        <View style={styles.listSection}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>We couldn't find any products matching your criteria.</Text>
            </View>
          ) : (
            filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <Image 
                  source={{ uri: product.image_url ? `${UPLOADS_URL}${product.image_url}` : "https://via.placeholder.com/150" }} 
                  style={styles.productImg}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>Rs {product.price} / {product.unit || "kg"}</Text>
                  <Text style={[styles.stockText, product.quantity < 10 && styles.lowStock]}>
                    📦 {product.quantity} kg in stock
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.menuBtn} 
                  onPress={() => setMenuOpen(menuOpen === product.id ? null : product.id)}
                >
                  <MoreVertical size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {menuOpen === product.id && (
                  <View style={styles.dropdown}>
                    <TouchableOpacity 
                      style={styles.dropdownItem} 
                      onPress={() => {
                         setMenuOpen(null);
                         router.push(`/farmer/AddProduct?id=${product.id}` as any);
                      }}
                    >
                      <Edit3 size={16} color={COLORS.textMain} />
                      <Text style={styles.dropdownText}>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity 
                      style={styles.dropdownItem} 
                      onPress={() => handleDelete(product.id)}
                    >
                      <Trash2 size={16} color={COLORS.danger} />
                      <Text style={[styles.dropdownText, { color: COLORS.danger }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/farmer/AddProduct' as any)}
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bgOuter,
  },
  header: {
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgOuter,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1b5e20',
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.bgOuter,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textMain,
  },
  filterSection: {
    backgroundColor: COLORS.bgOuter,
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  filterChipActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2e7d32',
  },
  filterTextActive: {
    color: 'white',
  },
  listSection: {
    flex: 1,
    backgroundColor: COLORS.bgInner,
    marginHorizontal: 16,
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingVertical: 10,
    minHeight: Dimensions.get('window').height - 250,
  },
  productCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    position: 'relative',
    zIndex: 1,
  },
  productImg: {
    width: 65,
    height: 65,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    marginLeft: 14,
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  productPrice: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '700',
    marginTop: 4,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  lowStock: {
    color: COLORS.warning,
    fontWeight: '700',
  },
  menuBtn: {
    padding: 10,
  },
  dropdown: {
    position: 'absolute',
    right: 40,
    top: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: 120,
    zIndex: 99,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.borderColor,
    marginHorizontal: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  toastSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  toastError: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
