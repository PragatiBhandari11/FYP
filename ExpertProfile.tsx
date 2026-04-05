import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, RefreshControl, Platform, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Lock, 
  LogOut, 
  Settings, 
  ChevronRight, 
  ShieldCheck,
  X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { appendImageToFormData } from '../../utils/upload';
import { API_URL, UPLOADS_URL } from '../../constants/API';

export default function ExpertProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phone: '',
    country: '',
    city: user?.city || ''
  });

  const fetchProfile = async () => {
    try {
      const data = await api.get(`/user/${user?.email}`);
      setEditForm({
        fullName: data.full_name,
        phone: data.phone || '',
        country: data.country || '',
        city: data.city || ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/profile', { email: user?.email, ...editForm });
      setIsEditing(false);
      if (Platform.OS === 'web') alert('Profile updated! ✨');
      else Alert.alert('Success', 'Profile updated! ✨');
      fetchProfile();
    } catch (e) {
      if (Platform.OS === 'web') alert('Failed to update profile.');
      else Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    router.replace('/welcome' as any);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
             <User size={40} color="white" />
          </View>
        </View>
        <Text style={styles.name}>{editForm.fullName}</Text>
        <Text style={styles.role}>Agriculture Expert</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.verifiedCard}>
          <View>
            <Text style={styles.verifTitle}>Verification Status</Text>
            <Text style={styles.verifSub}>Certified Professional</Text>
          </View>
          <View style={styles.verifBadge}>
            <ShieldCheck size={14} color="white" />
            <Text style={styles.verifText}>CERTIFIED</Text>
          </View>
        </View>

        {!isEditing ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Details</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtn}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}><Phone size={18} color="#16a34a" /></View>
                <View>
                   <Text style={styles.infoLabel}>Phone</Text>
                   <Text style={styles.infoVal}>{editForm.phone || 'Not provided'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}><MapPin size={18} color="#16a34a" /></View>
                <View>
                   <Text style={styles.infoLabel}>City</Text>
                   <Text style={styles.infoVal}>{editForm.city || 'Not provided'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}><Globe size={18} color="#16a34a" /></View>
                <View>
                   <Text style={styles.infoLabel}>Country</Text>
                   <Text style={styles.infoVal}>{editForm.country || 'Not provided'}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Lock size={20} color="#475569" />
                <Text style={styles.menuText}>Security Settings</Text>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={handleLogout}>
              <View style={styles.menuLeft}>
                <LogOut size={20} color="#ef4444" />
                <Text style={[styles.menuText, { color: '#ef4444' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Information</Text>
            <View style={styles.formCard}>
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                value={editForm.fullName}
                onChangeText={t => setEditForm({ ...editForm, fullName: t })}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Phone Number" 
                value={editForm.phone}
                onChangeText={t => setEditForm({ ...editForm, phone: t })}
              />
              <TextInput 
                style={styles.input} 
                placeholder="City" 
                value={editForm.city}
                onChangeText={t => setEditForm({ ...editForm, city: t })}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Country" 
                value={editForm.country}
                onChangeText={t => setEditForm({ ...editForm, country: t })}
              />

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />

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
                <Text style={styles.modalCancelText}>Keep Working</Text>
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
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  role: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  verifiedCard: {
    backgroundColor: '#f0fdf4',
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 30,
  },
  verifTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#166534',
  },
  verifSub: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 4,
    fontWeight: '700',
  },
  verifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    gap: 6,
  },
  verifText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editBtn: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  infoIcon: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '800',
  },
  infoVal: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 22,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#fff1f2',
    borderColor: '#fecaca',
  },
  formCard: {
    gap: 16,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 18,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  saveBtn: {
    flex: 2,
    height: 56,
    backgroundColor: '#16a34a',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748b',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
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
