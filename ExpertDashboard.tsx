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
import { UPLOADS_URL } from '../../constants/API';
import { 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1e7d4f',
  primaryLight: '#f0fdf4',
  accent: '#e67e22',
  textMain: '#1e293b',
  textMuted: '#64748b',
  bgMain: '#ffffff',
  bgSecondary: '#f8fafc',
  danger: '#ef4444',
  resolved: '#2e7d32',
};

const EXPERT_TOOLS = [
  { label: "Reports", icon: <AlertTriangle size={22} color="#e67e22" />, path: "/expert/ExpertDiseaseReports" },
  { label: "Chats", icon: <MessageSquare size={22} color="#3498db" />, path: "/expert/ExpertChats" },
  { label: "Articles", icon: <FileText size={22} color="#3a8a3a" />, path: "/expert/ArticleForm" },
];

export default function ExpertDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({ name: "Specialist", avatar: "" });
  const [stats, setStats] = useState([
    { label: "Active Queries", value: 0 },
    { label: "Pending", value: 0 },
    { label: "Resolved", value: 0 },
  ]);
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchDashboardData = async () => {
    if (!user?.email) return;
    try {
      // Use Promise.allSettled to ensure one failure doesn't block the whole dashboard
      const results = await Promise.allSettled([
        api.get(`/user/${user.email}`),
        api.get('/disease/reports'),
        api.get(`/notifications/${user.email}`)
      ]);

      // Profile (index 0)
      if (results[0].status === 'fulfilled') {
        const userData = results[0].value;
        setProfile({
          name: userData.full_name || "Specialist",
          avatar: userData.profile_image ? `${UPLOADS_URL}${userData.profile_image}` : "https://randomuser.me/api/portraits/men/32.jpg"
        });
      }

      // Reports (index 1)
      let rList = [];
      if (results[1].status === 'fulfilled') {
        rList = Array.isArray(results[1].value) ? results[1].value : [];
        
        const total = rList.length;
        const pendingCount = rList.filter((r: any) => r.status?.toLowerCase() === 'pending').length;
        const resolvedCount = rList.filter((r: any) => r.status?.toLowerCase() === 'responded').length;
        
        setStats([
          { label: "ACTIVE QUERIES", value: total },
          { label: "PENDING", value: pendingCount },
          { label: "RESOLVED", value: resolvedCount },
        ]);
        setRecentQueries(rList.slice(0, 3));
      }

      // Notifications (index 2)
      if (results[2].status === 'fulfilled') {
        setNotifications(Array.isArray(results[2].value) ? results[2].value : []);
      }

    } catch (err) {
      console.error("Expert fetch error:", err);
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

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      showToast("Marked correctly");
    } catch (err) {
      showToast("Error updating alert", "error");
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
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>Hello {profile.name}</Text>
            <Text style={styles.userRole}>Soil & Crop Specialist</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifications(true)}>
          <Bell size={24} color="white" />
          {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Unified Stats Card */}
        <LinearGradient
          colors={['#1e7d4f', '#3ac37a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsContainer}
        >
          {stats.map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statVal}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* Expert Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expert Tools</Text>
          <View style={styles.toolsGrid}>
            {EXPERT_TOOLS.map((tool, i) => (
              <TouchableOpacity key={i} style={styles.toolCard} onPress={() => router.push(tool.path as any)}>
                 <View style={styles.toolIcon}>{tool.icon}</View>
                 <Text style={styles.toolLabel}>{tool.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Questions Priority Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Priority Reviews</Text>
            <TouchableOpacity onPress={() => router.push('/expert/Queries' as any)}>
              <Text style={styles.viewAllBtn}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentQueries.length === 0 ? (
             <View style={styles.emptyCard}>
                <CheckCircle size={40} color="#cbd5e1" />
                <Text style={styles.emptyText}>All queries resolved!</Text>
             </View>
          ) : (
            recentQueries.map((q: any) => (
              <TouchableOpacity key={q.id} style={styles.questionCard} onPress={() => router.push('/expert/Queries' as any)}>
                <View style={[styles.priorityTag, q.status === 'Pending' ? {backgroundColor: COLORS.danger} : {backgroundColor: COLORS.resolved}]}>
                  <Text style={styles.tagText}>{q.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.questionDesc} numberOfLines={2}>{q.description}</Text>
                <View style={styles.questionFooter}>
                   <View style={styles.footerItem}>
                     <User size={14} color="#94a3b8" />
                     <Text style={styles.footerText}>{q.farmer_name || 'Farmer'}</Text>
                   </View>
                   <View style={styles.footerItem}>
                     <Clock size={14} color="#94a3b8" />
                     <Text style={styles.footerText}>{new Date(q.created_at).toLocaleDateString()}</Text>
                   </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Alerts Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifications(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Expert Alerts</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyNotifText}>No recent alerts.</Text>
              ) : (
                notifications.map(n => (
                  <TouchableOpacity 
                    key={n.id} 
                    style={[styles.notifItem, !n.is_read && styles.unreadNotif]} 
                    onPress={() => !n.is_read && markAsRead(n.id)}
                  >
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifMsg}>{n.message}</Text>
                    <Text style={styles.notifTime}>{new Date(n.created_at).toLocaleString()}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3a8a3a',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  bellBtn: {
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
    top: 5,
    right: 5,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3a8a3a',
  },
  notifBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    backgroundColor: '#f8fafc',
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 20,
    padding: 24,
    borderRadius: 24,
    justifyContent: 'space-around',
    elevation: 4,
    shadowColor: '#3a8a3a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllBtn: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 28,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  priorityTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  questionDesc: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 22,
    marginBottom: 16,
  },
  questionFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 16,
    fontWeight: '600',
    fontStyle: 'italic',
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
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f1f5f9',
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
    color: '#94a3b8',
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
    borderRadius: 20,
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
  }
});
