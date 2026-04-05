import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ChevronRight,
  ShoppingBag
} from 'lucide-react-native';

const STEPS = [
  { label: 'Placed', status: 'Order Placed' },
  { label: 'Accepted', status: 'Accepted' },
  { label: 'Packing', status: 'Packing' },
  { label: 'Moving', status: 'Out for Delivery' },
  { label: 'Done', status: 'Delivered' }
];

const STEP_ORDER = ['Order Placed', 'Accepted', 'Packing', 'Out for Delivery', 'Delivered'];

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.email) return;
    try {
      const data = await api.get(`/orders/${user.email}`);
      setOrders(data);
    } catch (error) {
       console.error(error);
       Alert.alert('Error', 'Failed to load orders.');
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

  const currentOrder = orders.length > 0 ? orders[0] : null;
  const orderHistory = orders.length > 1 ? orders.slice(1) : [];

  const getStatusIndex = (status: string) => STEP_ORDER.indexOf(status);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="hsl(142, 76%, 36%)" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!user?.email ? (
          <View style={styles.emptyState}>
            <Clock size={64} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>Login Required</Text>
            <Text style={styles.emptySubtitle}>Please login to track your orders.</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingBag size={80} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Fresh farm products await you in the store.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/buyer/ExplorePage')}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Active Order Tracking */}
            {currentOrder && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Order</Text>
                <View style={styles.activeCard}>
                    <View style={styles.activeInfoRow}>
                      <View style={styles.activeProductImageContainer}>
                        <Image 
                          source={{ uri: currentOrder.product_image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c' }} 
                          style={styles.activeProductImage} 
                        />
                      </View>
                      <View style={styles.activeInfoText}>
                        <Text style={styles.activeOrderId}>Order ID: {currentOrder.order_number}</Text>
                        <Text style={styles.activeProduct}>{currentOrder.product_name || 'AgroConnect Package'}</Text>
                        <Text style={styles.activeQty}>Quantity: {currentOrder.qty || 1}</Text>
                        <Text style={styles.activeStatus}>{currentOrder.status}</Text>
                        <Text style={styles.etaText}>ETA: Today, 5:00 PM</Text>
                      </View>
                    </View>
                    <Package size={28} color="#2e8b57" />

                  <View style={styles.progressBar}>
                    <View style={styles.progressLine} />
                    
                    <View style={styles.stepsRow}>
                      {STEPS.map((step, index) => {
                        const activeIndex = STEP_ORDER.indexOf(currentOrder.status);
                        const isActive = index <= activeIndex;

                        return (
                          <View key={step.label} style={styles.stepItem}>
                            <View style={[
                              styles.dot, 
                              isActive && styles.dotActive
                            ]} />
                            <Text style={[styles.stepLabel, isActive && styles.labelActive]}>
                              {step.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Order History */}
            {orderHistory.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order History</Text>
                  {orderHistory.map(order => (
                    <View key={order.id} style={styles.historyCard}>
                      <Image 
                        source={{ uri: order.product_image || 'https://images.unsplash.com/photo-1595855759920-865823967d04' }} 
                        style={styles.historyThumb} 
                      />
                      <View style={styles.historyLeft}>
                        <Text style={styles.historyId}>{order.order_number}</Text>
                        <Text style={styles.historyProduct}>{order.product_name || 'Farm Fresh Product'}</Text>
                        <Text style={styles.historyQty}>Qty: {order.qty || 1}</Text>
                        <Text style={styles.historyDate}>
                          {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={styles.historyRight}>
                        <Text style={styles.historyPrice}>Rs {order.total_amount}</Text>
                        <Text style={[styles.historyStatus, { color: order.status === 'Cancelled' ? '#ef4444' : '#2e8b57' }]}>
                          {order.status === 'Cancelled' ? 'Cancelled' : 'Delivered'}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#475569',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  shopBtn: {
    backgroundColor: 'hsl(142, 76%, 36%)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 24,
  },
  shopBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    marginLeft: 4,
  },
  activeCard: {
    backgroundColor: '#eaf7f0',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#c3e6cb',
    shadowColor: '#2e8b57',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  activeInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
  },
  activeProductImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  activeProductImage: {
    width: '100%',
    height: '100%',
  },
  activeInfoText: {
    flex: 1,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  activeOrderId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  activeProduct: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  activeQty: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  activeStatus: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2e8b57',
    marginTop: 4,
  },
  etaText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  progressBar: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  progressLine: {
    position: 'absolute',
    top: 6,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#c3e6cb',
    zIndex: 1,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  dotActive: {
    backgroundColor: '#2e8b57',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    textAlign: 'center',
  },
  labelActive: {
    color: '#2e8b57',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  deliveryText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '700',
    marginLeft: 8,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  historyThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyLeft: {
    flex: 1,
  },
  historyId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  historyProduct: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  historyQty: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
});
