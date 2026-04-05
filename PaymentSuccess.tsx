import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { CheckCircle2, XCircle, LayoutDashboard, Loader2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../utils/api';

export default function PaymentSuccess() {
  const { pidx, type } = useLocalSearchParams();
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState("Verifying your payment secure transaction...");

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const [countdown, setCountdown] = useState(3);
  const verifyingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    console.log("--- PaymentSuccess Redirection Check ---");
    let currentPidx: string | string[] | undefined = pidx;
    
    // Explicitly check for both router and window params
    if (!currentPidx) {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        currentPidx = searchParams.get('pidx') || undefined;
      }
    }

    // Force pidx to be a single string even if it's an array
    if (Array.isArray(currentPidx)) currentPidx = currentPidx[0];

    console.log("Caught PIDX:", currentPidx || "None");
    console.log("URL:", typeof window !== 'undefined' ? window.location.href : 'SSR');
    
    if (!currentPidx) {
      console.log("⏱️ No pidx found yet. Component is mounted at:", segments.join('/'));
      return; 
    }

    if (verifyingRef.current) return;
    verifyingRef.current = true;

    console.log("🚀 VERIFYING:", currentPidx);

    // ✅ Start Animations
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const verifyPayment = async (retryCount = 0) => {
      let result: any = null; // Declare outside for finally block scope
      if (type === 'cod') {
        setStatus('success');
        setMessage("Order placed successfully via Cash on Delivery! 📦");
        setLoading(false);
        startRedirectTimer();
        return;
      }

      try {
        if (retryCount === 0) await new Promise(r => setTimeout(r, 2000));
        
        console.log(`📡 Fetching: /orders/verify-khalti with pidx=${currentPidx} (Attempt ${retryCount + 1})`);
        result = await api.post('/orders/verify-khalti', { pidx: currentPidx });
        console.log("📥 Backend response:", JSON.stringify(result, null, 2));
        
        if (result?.status === "Completed") {
          setStatus('success');
          setMessage("Your transaction was successful. Your order is now confirmed!");
          startRedirectTimer();
        } else if (retryCount < 3) {
          setMessage(`Confirming with bank... (Retry ${retryCount + 1})`);
          setTimeout(() => verifyPayment(retryCount + 1), 3000);
        } else {
          setStatus('failed');
          setMessage(result?.message || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("❌ Verification fetch error:", error);
        setStatus('failed');
        setMessage("Connection lost. Please check your bank statement or try again.");
      } finally {
        if (retryCount >= 3 || result?.status === 'Completed') {
          setLoading(false);
        }
      }
    };

    const startRedirectTimer = () => {
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          router.replace('/(tabs)' as any);
        }
      }, 1000);
    };

    verifyPayment();
  }, [pidx, type, isMounted]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const COLORS = {
    primary: 'hsl(142, 76%, 36%)',
    bg: '#f0fdf4',
    white: '#ffffff',
    text: '#064e3b',
    muted: '#374151',
    error: '#ef4444'
  };

  // SSR Safety: Do not render full UI on server
  if (!isMounted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="hsl(142, 76%, 36%)" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <View style={styles.card}>
        {loading ? (
          <View style={styles.centerContent}>
            <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 20 }}>
              <Loader2 size={48} color={COLORS.primary} />
            </Animated.View>
            <Text style={styles.statusTitle}>Verifying Payment</Text>
            <Text style={styles.statusDescription}>{message}</Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <View style={[
              styles.iconCircle, 
              { backgroundColor: status === 'success' ? '#dcfce7' : '#fee2e2' }
            ]}>
              {status === 'success' ? (
                <CheckCircle2 size={64} color={COLORS.primary} strokeWidth={2.5} />
              ) : (
                <XCircle size={64} color={COLORS.error} strokeWidth={2.5} />
              )}
            </View>

            <Text style={[styles.resultTitle, { color: status === 'success' ? COLORS.text : COLORS.error }]}>
              {status === 'success' ? "Order Confirmed!" : "Payment Failed"}
            </Text>

            <Text style={styles.messageText}>{message}</Text>

            <View style={styles.actionSection}>
              {status === 'success' ? (
                <View style={styles.redirectContainer}>
                   <Text style={styles.redirectText}>
                     Moving to Dashboard in <Text style={{fontWeight: '900', color: COLORS.primary}}>{countdown}s</Text>
                   </Text>
                   <ActivityIndicator size="small" color={COLORS.primary} style={{marginTop: 10}} />
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.dashboardBtn, { backgroundColor: COLORS.muted }]}
                  onPress={() => router.replace('/buyer/CartPage' as any)}
                >
                  <Text style={styles.dashboardBtnText}>Return to Cart</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.dashboardBtn, { backgroundColor: status === 'success' ? COLORS.primary : '#64748b', marginTop: 10 }]}
                onPress={() => router.replace('/buyer/BuyerDashboard' as any)}
              >
                <LayoutDashboard size={20} color="white" />
                <Text style={styles.dashboardBtnText}>Go to Dashboard Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#064e3b',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  iconCircle: {
    padding: 20,
    borderRadius: 60,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  actionSection: {
    width: '100%',
  },
  dashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
  },
  dashboardBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  redirectContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  redirectText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});
