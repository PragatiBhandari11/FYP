import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl, Linking as RNLinking } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'khalti' | 'cash'>('khalti');
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    if (!user?.email) return;
    try {
      const data = await api.get(`/cart/${user.email}`);
      setCart(data);
    } catch (error) {
       console.error(error);
       Alert.alert('Error', 'Failed to load cart.');
    } finally {
      setLoading(false);
      setRefreshing(true);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCart();
  };

  const updateQty = async (cartId: number, delta: number) => {
    try {
      await api.post('/cart/update', { cartId, delta });
      fetchCart();
    } catch (error) {
       console.error(error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Add some products to your cart first.');
      return;
    }

    setCheckingOut(true);
    const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
    const delivery = 2.5; // Standardized to match UI (2.50)
    const tax = subtotal * 0.05;
    const total = subtotal + delivery + tax;

    if (paymentMethod === 'khalti') {
      try {
        // Use Expo Linking to create a dynamic return URL that works on both Web and Native
        const returnUrl = Linking.createURL('/buyer/PaymentSuccess');
        console.log("Initiating Khalti with returnUrl:", returnUrl);
        
        const response = await api.post('/orders/initiate-khalti', {
          buyerEmail: user?.email,
          totalAmount: total.toFixed(2),
          buyerName: user?.fullName,
          returnUrl: returnUrl
        });

        if (response.payment_url) {
          console.log("Redirecting to Khalti:", response.payment_url);
          // For Web, redirect in the same tab to avoid state confusion
          if (typeof window !== 'undefined' && window.location) {
             window.location.href = response.payment_url;
          } else {
             // For Mobile
             RNLinking.openURL(response.payment_url);
          }
        } else {
          Alert.alert('Payment Error', response.message || 'Failed to initiate Khalti payment.');
        }
      } catch (error: any) {
        console.error("Khalti Initiation Error:", error);
        Alert.alert('Payment Error', error?.message || 'Failed to initiate Khalti payment.');
      } finally {
        setCheckingOut(false);
      }
    } else {
      // Cash on Delivery
      try {
        const res = await api.post('/orders/checkout', {
          buyerEmail: user?.email,
          totalAmount: total.toFixed(2)
        });
        if (res.success !== false) {
          router.replace('/buyer/PaymentSuccess?type=cod');
        }
      } catch (error) {
         Alert.alert('Checkout Error', 'Failed to place order.');
      } finally {
        setCheckingOut(false);
      }
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
  const delivery = cart.length > 0 ? 2.5 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.cartList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingBag size={80} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>Cart is empty</Text>
            <Text style={styles.emptySubtitle}>Find fresh agricultural products in the store.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/buyer/ExplorePage')}>
              <Text style={styles.shopBtnText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.itemsSection}>
              {cart.map(item => (
                <View key={item.cart_id} style={styles.cartItem}>
                  <Image 
                    source={{ uri: item.image_url ? `${UPLOADS_URL}${item.image_url}` : 'https://via.placeholder.com/100' }} 
                    style={styles.itemImg}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>Rs {parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.cart_id, 1)}>
                      <Plus size={16} color="#16a34a" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.cart_id, -1)}>
                      {item.qty > 1 ? <Minus size={16} color="#ef4444" /> : <Trash2 size={16} color="#ef4444" />}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.sectionLabel}>Select Payment Method</Text>
              
              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'khalti' && styles.paymentActive]}
                onPress={() => setPaymentMethod('khalti')}
              >
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIcon, { backgroundColor: '#818cf8', flex: 0, padding: 8, borderRadius: 8 }]}>
                    <CreditCard size={18} color="white" />
                  </View>
                  <Text style={styles.paymentName}>Khalti Wallet</Text>
                </View>
                {paymentMethod === 'khalti' && <CheckCircle2 size={18} color="#16a34a" />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentActive]}
                onPress={() => setPaymentMethod('cash')}
              >
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIcon, { backgroundColor: '#10b981', flex: 0, padding: 8, borderRadius: 8 }]}>
                    <Banknote size={18} color="white" />
                  </View>
                  <Text style={styles.paymentName}>Cash on Delivery</Text>
                </View>
                {paymentMethod === 'cash' && <CheckCircle2 size={18} color="#16a34a" />}
              </TouchableOpacity>
            </View>

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Rs {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Logistics Fee</Text>
                <Text style={styles.summaryValue}>Rs {delivery.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Tax (5%)</Text>
                <Text style={styles.summaryValue}>Rs {tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>Rs {total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.checkoutBtn, checkingOut && styles.btnDisabled]} 
            onPress={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.checkoutBtnText}>Complete Order</Text>
                <ChevronRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  cartList: {
    flex: 1,
  },
  emptyCart: {
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
    lineHeight: 20,
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
  itemsSection: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 4,
  },
  qtyContainer: {
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  paymentSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 12,
    marginLeft: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  paymentActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16a34a',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  checkoutBtn: {
    backgroundColor: 'hsl(142, 76%, 36%)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  btnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
