import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  Dimensions, 
  RefreshControl 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Bell, 
  ShoppingCart, 
  Search, 
  Megaphone, 
  Package, 
  Star, 
  ChevronRight, 
  X, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  CloudSun,
  Truck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UPLOADS_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: 'hsl(142, 72%, 29%)',
  primaryLight: 'hsl(142, 60%, 96%)',
  accent: 'hsl(38, 92%, 47%)',
  textMain: 'hsl(210, 24%, 16%)',
  textMuted: 'hsl(215, 16%, 47%)',
  textLight: '#94a3b8',
  bgMain: '#ffffff',
  bgSecondary: '#f8fafc',
  danger: '#ef4444',
};

export default function BuyerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [search, setSearch] = useState("");
  const [demand, setDemand] = useState({ name: "", quantity: "", description: "" });
  const [submittingDemand, setSubmittingDemand] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState({ temp: '--', condition: 'Syncing...', city: '' });

  const showToast = (message: string, type: 'success' | 'error' = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchDashboardData = async () => {
    if (!user?.email) return;
    
    // 🛡️ Fault-tolerant fetching by separating API calls
    const fetchSection = async (endpoint: string, setter: (data: any) => void, logLabel: string) => {
      try {
        const data = await api.get(endpoint);
        setter(data);
      } catch (err) {
        console.error(`Dashboard fetch error (${logLabel}):`, err);
      }
    };

    try {
      // 1. Fetch Products
      await fetchSection("/products", setDbProducts, "Products");

      // 2. Fetch Orders
      await fetchSection(`/orders/${user.email}`, (data) => {
        if (data && data.length > 0) setLatestOrder(data[0]);
      }, "Orders");

      // 3. Fetch Notifications
      await fetchSection(`/notifications/${user.email}`, setNotifications, "Notifications");

      // 4. Fetch User Profile for Weather
      try {
        const userProfile = await api.get(`/user/${user.email}`);
        const city = userProfile.city || user.city || 'Kathmandu';
        const wData = await api.get(`/weather/${city}`);
        setWeather({ ...wData, city });
      } catch (wErr) {
        setWeather(prev => ({ ...prev, temp: '24', condition: 'Partly Cloudy' }));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleAddToCart = async (productId: number) => {
    if (!user?.email) {
      showToast("Please login to add items.", "error");
      return;
    }
    try {
      const response = await api.post("/cart/add", { buyerEmail: user.email, productId });
      if (response.success !== false) {
        showToast("Added to cart! 🛒");
      } else {
        showToast("Failed to add.", "error");
      }
    } catch (err) {
      showToast("Cart error", "error");
    }
  };

  const handleDemandSubmit = async () => {
    if (!demand.name) {
      showToast("Product name required", "error");
      return;
    }
    setSubmittingDemand(true);
    try {
      const response = await api.post("/demands", {
        buyerEmail: user?.email,
        productName: demand.name,
        quantity: demand.quantity,
        description: demand.description
      });
      if (response.success !== false) {
        showToast("Demand alert sent! 📢");
        setDemand({ name: "", quantity: "", description: "" });
      } else {
        showToast("Failed to send alert.", "error");
      }
    } catch (err) {
      showToast("Demand error", "error");
    } finally {
      setSubmittingDemand(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#1e7d4f', '#3ac37a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hi, {user?.fullName?.split(' ')[0] || "Guest"}!</Text>
              <View style={styles.weatherLine}>
                <CloudSun size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.weatherText}>{weather.temp}°C · {weather.condition}</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/buyer/CartPage' as any)}>
                <ShoppingCart size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(true)}>
                <Bell size={22} color="white" />
                {unreadCount > 0 && <View style={styles.notifBadge} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search local products..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => {
                if (search.trim()) {
                  router.push({ pathname: '/buyer/ExplorePage' as any, params: { search: search.trim() } });
                }
              }}
            />
          </View>
        </LinearGradient>


        {/* Community & Trends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Megaphone size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Community & Trends</Text>
          </View>
          <TouchableOpacity 
            style={styles.marketCard}
            onPress={() => router.push('/buyer/ExplorePage' as any)}
          >
            <View style={styles.marketInfo}>
              <Text style={styles.marketTitle}>Farmer Marketplace</Text>
              <Text style={styles.marketSubtitle}>Check price trends and community posts.</Text>
            </View>
            <View style={styles.marketAction}>
              <ChevronRight size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Demand Alerts Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Megaphone size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Demand Alerts</Text>
          </View>
          <View style={styles.demandCard}>
            <Text style={styles.demandSubtitle}>Notify local farmers about what you need.</Text>
            <TextInput 
              style={styles.modernInput} 
              placeholder="Product Name (e.g. Organic Ginger)" 
              value={demand.name}
              onChangeText={(v) => setDemand({...demand, name: v})}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput 
                style={[styles.modernInput, { flex: 0.4 }]} 
                placeholder="Qty (50kg)" 
                value={demand.quantity}
                onChangeText={(v) => setDemand({...demand, quantity: v})}
              />
              <TextInput 
                style={[styles.modernInput, { flex: 0.6 }]} 
                placeholder="Notes/Deadline" 
                value={demand.description}
                onChangeText={(v) => setDemand({...demand, description: v})}
              />
            </View>
            <TouchableOpacity 
              style={[styles.submitBtn, submittingDemand && { opacity: 0.7 }]} 
              onPress={handleDemandSubmit}
              disabled={submittingDemand}
            >
              <Text style={styles.submitBtnText}>{submittingDemand ? "Sending..." : "Post Demand Alert"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Order Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Latest Tracking</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statusCard, !latestOrder && { justifyContent: 'center' }]} 
            onPress={() => router.push('/buyer/OrdersPage' as any)}
          >
            {latestOrder ? (
              <View style={styles.orderInner}>
                <View style={styles.orderLabelCol}>
                   <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: latestOrder.payment_status === 'Paid' ? '#22c55e' : '#eab308' }]} />
                      <Text style={styles.statusText}>{latestOrder.status}</Text>
                   </View>
                   <Text style={styles.orderMainProduct}>{latestOrder.first_product_name || "Purchase Order"} {latestOrder.item_count > 1 ? `+${latestOrder.item_count - 1} more` : ""}</Text>
                   <Text style={styles.orderNumber}>#ID:{latestOrder.order_number?.slice(-8).toUpperCase()} · {new Date(latestOrder.created_at).toLocaleDateString()}</Text>
                   
                   {latestOrder.plate_number && (
                     <View style={styles.transitBadge}>
                        <Truck size={12} color="#166534" />
                        <Text style={styles.transitText}>Delivery Van: {latestOrder.plate_number}</Text>
                     </View>
                   )}
                </View>
                <View style={styles.orderPriceCol}>
                   <Text style={styles.orderPriceText}>Rs {latestOrder.total_amount}</Text>
                   <ChevronRight size={18} color={COLORS.primary} />
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No active orders currently.</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Featured Products List */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionHeader}>
              <Star size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Featured Marketplace</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/buyer/ExplorePage' as any)}>
              <Text style={styles.viewAllBtn}>See All</Text>
            </TouchableOpacity>
          </View>

          {dbProducts.length === 0 ? (
            <View style={styles.emptyProductsBox}>
               <Text style={styles.emptyProductsText}>Refreshing marketplace deals...</Text>
            </View>
          ) : (
            dbProducts.slice(0, 3).map(p => (
              <View key={p.id} style={styles.productCard}>
                <View style={styles.productImgContainer}>
                  {p.image_url ? (
                    <Image source={{ uri: `${UPLOADS_URL}${p.image_url}` }} style={styles.productImg} />
                  ) : (
                    <View style={styles.productPlaceholder}><Text style={{fontSize: 24}}>🍎</Text></View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productMeta}>Direct from Local Farms</Text>
                  <Text style={styles.productPrice}>Rs {p.price}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(p.id)}>
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Notifications Overlay */}
      <Modal visible={showNotifications} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifications(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyNotifText}>No notifications yet!</Text>
              ) : (
                notifications.map(n => (
                  <TouchableOpacity 
                    key={n.id} 
                    style={[styles.notifItem, !n.is_read && styles.unreadNotif]} 
                    onPress={() => !n.is_read && markAsRead(n.id)}
                  >
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifMsg}>{n.message}</Text>
                    <Text style={styles.notifTime}>{new Date(n.created_at).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Toast System */}
      {toast.show && (
        <View style={styles.toastHost}>
          <View style={[styles.toastContainer, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#16a34a" /> : <AlertCircle size={18} color="#ef4444" />}
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#1e7d4f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  weatherLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  weatherText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#3ac37a',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: -10,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 2,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 14,
    paddingLeft: 46,
    borderRadius: 16,
    fontSize: 16,
    color: COLORS.textMain,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    padding: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  viewAllBtn: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  demandCard: {
    backgroundColor: '#fdf8e6',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.1)',
  },
  demandSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  modernInput: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 14,
    fontSize: 15,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderNumber: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  emptyProductsBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyProductsText: {
     color: COLORS.textLight,
     fontSize: 14,
     fontWeight: '600',
  },
  orderInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  orderLabelCol: {
    flex: 1,
  },
  orderPriceCol: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  orderPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
     fontSize: 11,
     fontWeight: '800',
     color: COLORS.primary,
     textTransform: 'uppercase',
  },
  orderMainProduct: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  transitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  transitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  productCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  productImgContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.bgSecondary,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    backgroundColor: 'white',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  notifItem: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
  },
  unreadNotif: {
    backgroundColor: COLORS.primaryLight,
    borderLeftColor: COLORS.primary,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  notifMsg: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 8,
  },
  emptyNotifText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  toastHost: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  toastSuccess: { borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  toastError: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  toastText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  marketCard: {
    backgroundColor: 'hsl(142, 72%, 29%)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: 'hsl(142, 72%, 29%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  marketInfo: {
    flex: 1,
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  marketSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  marketAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
