import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle,
  Calendar,
  AlertTriangle,
  Send,
  Truck,
  Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#16a34a',
  secondary: '#1e293b',
  accent: '#f59e0b',
  bg: '#f8fafc',
  white: '#ffffff',
  textMain: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

export default function DemandDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [demand, setDemand] = useState<any>(null);

  // Custom Modal State
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'confirm',
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModal({ visible: true, title, message, type, onConfirm: () => setModal(m => ({ ...m, visible: false })) });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ 
      visible: true, 
      title, 
      message, 
      type: 'confirm', 
      onConfirm: () => {
        setModal(m => ({ ...m, visible: false }));
        onConfirm();
      }
    });
  };

  useEffect(() => {
    fetchDemandDetail();
  }, [id]);

  const fetchDemandDetail = async () => {
    try {
      const data = await api.get(`/demands/${id}`);
      setDemand(data);
    } catch (error) {
       console.error("Fetch demand detail error:", error);
       showAlert("Error", "Could not load demand details.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDemand = async () => {
    if (!user?.email) return;

    const performTake = async () => {
      setSubmitting(true);
      try {
        await api.put(`/demands/${id}/take`, { farmerEmail: user.email });
        showAlert("Success", "Demand successfully claimed! 🥬");
        fetchDemandDetail();
      } catch (error: any) {
        const msg = error.response?.data?.message || "Failed to claim demand.";
        showAlert("Error", msg, 'error');
      } finally {
        setSubmitting(false);
      }
    };

    showConfirm(
      "Accept Demand",
      "Are you sure you want to take this demand? Once accepted, it will be assigned to you.",
      performTake
    );
  };

  const handleShipDemand = async () => {
    const performShip = async () => {
      setSubmitting(true);
      try {
        const res = await api.put(`/demands/${id}/ship`);
        const message = `Product Sent! Your product is now in transit. Vehicle Assigned: ${res.vehiclePlate || 'Assigned'}`;
        
        showAlert("Product Shipped! 🚚", message, 'success');
        // Give time for modal before redirect
        setTimeout(() => {
          router.replace('/farmer/FarmerDashboard' as any);
        }, 2000);

      } catch (error: any) {
        const msg = error.response?.data?.message || "Shipment failed.";
        showAlert("Shipment Error", msg, 'error');
      } finally {
        setSubmitting(false);
      }
    };

    showConfirm(
      "Ship Product",
      "Ready to ship? Clicking OK will automatically assign a delivery vehicle.",
      performShip
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!demand) {
    return (
      <View style={styles.center}>
        <Text>Demand not found.</Text>
      </View>
    );
  }

  const isOwner = demand.farmer_email === user?.email;
  const isTaken = !!demand.farmer_email;

  return (
    <View style={styles.container}>
      {/* Custom Modal */}
      <Modal visible={modal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconBox, modal.type === 'error' && { backgroundColor: '#fee2e2' }]}>
               {modal.type === 'success' && <CheckCircle size={32} color={COLORS.primary} />}
               {modal.type === 'error' && <AlertTriangle size={32} color="#ef4444" />}
               {modal.type === 'confirm' && <Send size={32} color={COLORS.accent} />}
            </View>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <Text style={styles.modalMessage}>{modal.message}</Text>
            
            <View style={styles.modalActions}>
              {modal.type === 'confirm' && (
                <TouchableOpacity 
                  style={styles.modalCancel} 
                  onPress={() => setModal(m => ({ ...m, visible: false }))}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.modalBtn, modal.type === 'error' && { backgroundColor: '#ef4444' }]} 
                onPress={modal.onConfirm}
              >
                <Text style={styles.modalBtnText}>{modal.type === 'confirm' ? 'Confirm' : 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demand Fulfilment</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Status Tracker */}
        <View style={styles.statusTracker}>
           <View style={[styles.statusDot, demand.status !== 'Pending' && styles.statusDotActive]} />
           <View style={[styles.statusLine, (demand.status === 'In Transit' || demand.status === 'Delivered') && styles.statusLineActive]} />
           <View style={[styles.statusDot, (demand.status === 'In Transit' || demand.status === 'Delivered') && styles.statusDotActive]} />
           <View style={[styles.statusLine, demand.status === 'Delivered' && styles.statusLineActive]} />
           <View style={[styles.statusDot, demand.status === 'Delivered' && styles.statusDotActive]} />
        </View>
        <View style={styles.statusLabels}>
           <Text style={styles.statusLabel}>Claimed</Text>
           <Text style={styles.statusLabel}>Shipping</Text>
           <Text style={styles.statusLabel}>Arrived</Text>
        </View>

        {/* Product Info Card */}
        <LinearGradient 
          colors={['#16a34a', '#15803d']} 
          style={styles.heroCard}
        >
          <View style={styles.heroIconBox}>
             <Package size={40} color="white" />
          </View>
          <Text style={styles.heroTitle}>{demand.product_name}</Text>
          <View style={styles.quantityBadge}>
             <Text style={styles.quantityText}>{demand.quantity} Required</Text>
          </View>
          {demand.status === 'In Transit' && (
            <View style={styles.transitBadge}>
               <Truck size={14} color="white" />
               <Text style={styles.transitText}>IN TRANSIT</Text>
            </View>
          )}
        </LinearGradient>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirement Details</Text>
          <View style={styles.detailCard}>
            <Text style={styles.descriptionText}>
              {demand.description || "No additional details provided by the buyer."}
            </Text>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
               <Calendar size={16} color={COLORS.textMuted} />
               <Text style={styles.metaText}>Posted on: {new Date(demand.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* SHIPMENT INFO SECTION (Visible after Take) */}
        {isOwner && demand.status === 'Taken' && (
           <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Fulfillment Action</Text>
              <View style={styles.shipmentPrompt}>
                 <Truck size={32} color={COLORS.accent} />
                 <View style={{ flex: 1 }}>
                    <Text style={styles.shipTitle}>Ready to ship?</Text>
                    <Text style={styles.shipSub}>Clicking Send will automatically assign a delivery vehicle for you.</Text>
                 </View>
              </View>
           </View>
        )}

        {/* VEHICLE INFO (Visible after Ship) */}
        {demand.vehicle_id && (
           <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transport Details</Text>
              <View style={styles.vehicleCard}>
                 <View style={styles.vehicleIcon}>
                    <Truck size={24} color="white" />
                 </View>
                 <View>
                    <Text style={styles.vehiclePlate}>{demand.plate_number}</Text>
                    <Text style={styles.vehicleType}>{demand.vehicle_type} Assigned</Text>
                 </View>
                 <View style={styles.checkIcon}>
                    <CheckCircle size={20} color={COLORS.primary} />
                 </View>
              </View>
           </View>
        )}

        {/* Buyer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <View style={styles.buyerCard}>
            <View style={styles.buyerInfoRow}>
              <View style={styles.buyerAvatar}>
                 <User size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.buyerName}>{demand.buyer_name}</Text>
                <Text style={styles.buyerLabel}>Verified Buyer</Text>
              </View>
            </View>
            
            <View style={styles.contactInfo}>
               <View style={styles.contactItem}>
                  <MapPin size={18} color={COLORS.primary} />
                  <Text style={styles.contactText}>{demand.buyer_city || 'Regional'}</Text>
               </View>
               <View style={styles.contactItem}>
                  <Phone size={18} color={COLORS.primary} />
                  <Text style={styles.contactText}>{demand.buyer_phone}</Text>
               </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        {!isTaken ? (
          <TouchableOpacity 
            style={[styles.takeBtn, submitting && { opacity: 0.7 }]} 
            onPress={handleTakeDemand}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Check size={20} color="white" />
                <Text style={styles.takeBtnText}>Accept Demand</Text>
              </>
            )}
          </TouchableOpacity>
        ) : isOwner && demand.status === 'Taken' ? (
          <TouchableOpacity 
            style={[styles.shipBtn, submitting && { opacity: 0.7 }]} 
            onPress={handleShipDemand}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={20} color="white" />
                <Text style={styles.takeBtnText}>Send Demand</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.claimedBanner}>
             <CheckCircle size={20} color="white" />
             <Text style={styles.claimedText}>
               {isOwner ? `You are fulfilling this demand (${demand.status})` : "Already claimed by another farmer"}
             </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  scrollContent: {
    padding: 20,
  },
  statusTracker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
  },
  statusDotActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#dcfce7',
  },
  statusLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#cbd5e1',
  },
  statusLineActive: {
    backgroundColor: COLORS.primary,
  },
  statusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  heroCard: {
    padding: 30,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 30,
  },
  heroIconBox: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },
  quantityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  transitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  transitText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 12,
    marginLeft: 4,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  shipmentPrompt: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 15,
    alignItems: 'center',
  },
  shipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#9a3412',
  },
  shipSub: {
    fontSize: 12,
    color: '#c2410c',
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textMain,
    letterSpacing: 1,
  },
  vehicleType: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  checkIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  buyerCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buyerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  buyerAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#f0fdf4',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  buyerLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  takeBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  shipBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  takeBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  claimedBanner: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  claimedText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 2,
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCancel: {
    flex: 1,
    height: 54,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '700',
  }
});
