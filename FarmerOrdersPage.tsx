import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl, 
  Animated,
  Dimensions
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  ChevronDown
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';
import { Picker } from '@react-native-picker/picker';

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
};

const STATUS_CONFIG: any = {
  'Order Placed': { bg: '#e2e3e5', color: '#383d41' },
  'Accepted': { bg: '#d4edda', color: '#155724' },
  'Packing': { bg: '#d1ecf1', color: '#0c5460' },
  'Out for Delivery': { bg: '#fff3cd', color: '#856404' },
  'Delivered': { bg: '#c3e6cb', color: '#1e7d34' },
  'Cancelled': { bg: '#f8d7da', color: '#721c24' },
};

export default function FarmerOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchOrders = async () => {
    if (!user?.email) return;
    try {
      const data = await api.get(`/orders/farmer/${user.email}`);
      setOrders(data);
    } catch (error) {
      console.error("Farmer orders fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!newStatus) return;
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success !== false) {
        showToast("Status updated! ✅");
        fetchOrders();
      } else {
        showToast("Update failed.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

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
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.push('/farmer/FarmerDashboard' as any)}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.contentScroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading your orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>When buyers order your products, they will appear here.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {orders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.order_number}</Text>
                  <View style={styles.dateRow}>
                     <Calendar size={12} color={COLORS.textMuted} />
                     <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>

                <View style={styles.orderBody}>
                  <Image 
                    style={styles.orderImg} 
                    source={{ uri: order.image_url ? `${UPLOADS_URL}${order.image_url}` : "https://via.placeholder.com/150" }} 
                  />
                  <View style={styles.orderDetails}>
                    <Text style={styles.productName}>{order.product_name}</Text>
                    <Text style={styles.productMeta}>Quantity: {order.quantity} units</Text>
                    <Text style={styles.totalPrice}>Rs {order.price_at_purchase * order.quantity}</Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[order.status]?.bg || '#eee' }]}>
                       <Text style={[styles.statusBadgeText, { color: STATUS_CONFIG[order.status]?.color || '#666' }]}>
                         {order.status}
                       </Text>
                    </View>

                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={order.status}
                        onValueChange={(v) => updateOrderStatus(order.order_id, v)}
                        style={styles.picker}
                        mode="dropdown"
                      >
                         <Picker.Item label="Accepted" value="Accepted" />
                         <Picker.Item label="Packing" value="Packing" />
                         <Picker.Item label="Out for Delivery" value="Out for Delivery" />
                         <Picker.Item label="Delivered" value="Delivered" />
                         <Picker.Item label="Cancelled" value="Cancelled" />
                      </Picker>
                      <View style={styles.pickerIcon}>
                        <ChevronDown size={14} color={COLORS.primary} />
                      </View>
                    </View>
                  </View>

                  {order.plate_number && ["Packing", "Out for Delivery", "Delivered"].includes(order.status) && (
                    <View style={styles.logisticsBox}>
                      <Truck size={16} color="#166534" />
                      <Text style={styles.logisticsTitle}>Assigned Vehicle:</Text>
                      <Text style={styles.logisticsText}>{order.plate_number} ({order.vehicle_type})</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#2e8b57',
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  contentScroll: {
    flex: 1,
    backgroundColor: COLORS.bgInner,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  loaderContainer: {
    padding: 100,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 14,
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
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eeeeee',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  orderId: {
    fontWeight: '900',
    color: '#2e8b57',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#666666',
  },
  orderBody: {
    flexDirection: 'row',
    gap: 12,
  },
  orderImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#f9f9f9',
  },
  orderDetails: {
    flex: 1,
  },
  productName: {
    fontWeight: '800',
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  totalPrice: {
    fontWeight: '900',
    fontSize: 16,
    color: '#333333',
  },
  orderFooter: {
    marginTop: 12,
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e8b57',
    borderRadius: 8,
    height: 36,
    minWidth: 140,
    paddingRight: 10,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    color: COLORS.textMain,
    backgroundColor: 'transparent',
  },
  pickerIcon: {
    marginLeft: -10,
  },
  logisticsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
    flexWrap: 'wrap',
    gap: 6,
  },
  logisticsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  logisticsText: {
    fontSize: 12,
    color: '#166534',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
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
