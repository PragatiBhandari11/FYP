import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { User, MapPin, Mail, Phone, ShoppingBag, Settings, LogOut, ChevronRight, Award, Heart, Megaphone, X } from 'lucide-react-native';

export default function BuyerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
  
  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    router.replace('/welcome' as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={40} color="white" />
          </View>
          <View style={styles.verifiedBadge}>
            <Award size={12} color="white" />
          </View>
        </View>
        <Text style={styles.name}>{user?.fullName || 'Buyer Name'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Verified Buyer</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shopping Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <ShoppingBag size={20} color="#16a34a" />
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Heart size={20} color="#ef4444" />
            <Text style={styles.statNum}>8</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
          <View style={styles.statBox}>
            <Award size={20} color="#f59e0b" />
            <Text style={styles.statNum}>PRO</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Mail size={18} color="#64748b" />
            <Text style={styles.infoText}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Phone size={18} color="#64748b" />
            <Text style={styles.infoText}>+977-98********</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <MapPin size={18} color="#64748b" />
            <Text style={styles.infoText}>{user?.city || 'Nepal'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/buyer/MarketplacePage' as any)}>
          <View style={styles.actionLeft}>
            <Megaphone size={20} color="#475569" />
            <Text style={styles.actionText}>Farmer Marketplace</Text>
          </View>
          <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.actionLeft}>
            <Settings size={20} color="#475569" />
            <Text style={styles.actionText}>Preferences</Text>
          </View>
          <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
          <View style={styles.actionLeft}>
            <LogOut size={20} color="#ef4444" />
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>AgroConnect Buyer Portal v1.0.0</Text>

      {/* Premium Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <LogOut size={24} color="#ef4444" />
              </View>
              <TouchableOpacity 
                onPress={() => setIsLogoutModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to return to the welcome screen?</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmBtn} 
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'hsl(142, 76%, 36%)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#10b981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  roleBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: 'hsl(142, 76%, 36%)',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  logoutBtn: {
    marginTop: 10,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginVertical: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
});
