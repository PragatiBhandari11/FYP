import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Shield, 
  User, 
  Mail, 
  MapPin, 
  Lock, 
  LogOut, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react-native';

export default function AdminProfile() {
  const router = useRouter();
  const { user, login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    city: user?.city || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: string = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.fullName || !profileForm.email) {
      showToast('Name and Email are required', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await api.put('/user/profile', profileForm);
      if (res.user) {
        await login(res.user, (res as any).token || ''); // Update AuthContext
        showToast('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    try {
      setLoading(true);
      await api.put('/user/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Change Password Error:', err);
      showToast('Failed to change password', 'error');
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Shield size={40} color="white" />
          </View>
        </View>
        <Text style={styles.name}>{user?.fullName || 'Administrator'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>System Admin</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editBtn}>Edit Info</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={profileForm.fullName}
              onChangeText={(t) => setProfileForm({ ...profileForm, fullName: t })}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={profileForm.email}
              onChangeText={(t) => setProfileForm({ ...profileForm, email: t })}
              keyboardType="email-address"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={profileForm.city}
              onChangeText={(t) => setProfileForm({ ...profileForm, city: t })}
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Mail size={18} color="#1e293b" /></View>
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><MapPin size={18} color="#1e293b" /></View>
              <View>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{user?.city || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Security Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Security</Text>
        {isChangingPassword ? (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={passwordForm.oldPassword}
              onChangeText={(t) => setPasswordForm({ ...passwordForm, oldPassword: t })}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={passwordForm.newPassword}
              onChangeText={(t) => setPasswordForm({ ...passwordForm, newPassword: t })}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={passwordForm.confirmPassword}
              onChangeText={(t) => setPasswordForm({ ...passwordForm, confirmPassword: t })}
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsChangingPassword(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#1e293b' }]} onPress={handleChangePassword} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.menuItem} onPress={() => setIsChangingPassword(true)}>
            <View style={styles.menuLeft}>
              <Lock size={20} color="#1e293b" />
              <Text style={styles.menuText}>Change Password</Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        )}

        {/* System Info */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>System</Text>
        <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <LogOut size={20} color="#ef4444" />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>Sign Out</Text>
          </View>
          <ChevronRight size={18} color="#fecaca" />
        </TouchableOpacity>

        <Text style={styles.versionText}>AgroConnect Admin Portal v1.2.4</Text>
      </View>

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

      {/* Toast Feedback */}
      {toast.show && (
        <View style={styles.toastHost}>
          <View style={[styles.toastContainer, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#16a34a" /> : <AlertCircle size={18} color="#ef4444" />}
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    marginTop: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  editBtn: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  infoIconBox: {
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
  infoValue: {
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
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
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
    backgroundColor: '#fff1f2',
    borderColor: '#fecaca',
  },
  card: {
    gap: 12,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  saveBtn: {
    flex: 2,
    height: 54,
    backgroundColor: '#10b981',
    borderRadius: 16,
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
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 40,
    fontWeight: '600',
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
    color: '#1e293b',
  },
});
