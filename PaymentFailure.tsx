import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { XCircle, RefreshCw, Home } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PaymentFailure() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <XCircle size={72} color="#ef4444" strokeWidth={2} />
        </View>

        <Text style={styles.title}>Payment Failed</Text>
        
        <Text style={styles.message}>
          Something went wrong with your Khalti transaction. 
          Please try again or choose a different payment method.
        </Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.retryBtn} 
            onPress={() => router.push('/buyer/CartPage')}
          >
            <RefreshCw size={18} color="white" />
            <Text style={styles.retryBtnText}>Retry Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeBtn} 
            onPress={() => router.replace('/buyer/BuyerDashboard' as any)}
          >
            <Home size={18} color="#475569" />
            <Text style={styles.homeBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f0',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#d9534f',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5c2d91',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#5c2d91',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  homeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  homeBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 15,
  },
});
