import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  Animated
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { appendImageToFormData } from '../../utils/upload';
import { ArrowLeft, MessageSquare, Camera, CheckSquare, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react-native';
import { UPLOADS_URL, API_URL } from '../../constants/API';

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
  pending: '#fff3cd',
  pendingText: '#856404',
  responded: '#d4edda',
  respondedText: '#155724',
};

export default function FarmerExpertPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'Directory' | 'Reports'>('Directory');
  const [experts, setExperts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newReport, setNewReport] = useState({ image: null as any, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastY = React.useRef(new Animated.Value(-100)).current;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    Animated.spring(toastY, { toValue: 50, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => {
        setToast(prev => ({ ...prev, show: false }));
      });
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const expertData = await api.get('/experts');
      setExperts(expertData);
      
      if (user?.email) {
        const reportData = await api.get(`/disease/reports/farmer/${user.email}`);
        setReports(reportData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll access to report diseases.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewReport({ ...newReport, image: result.assets[0] });
    }
  };

  const handleReportSubmit = async () => {
    if (!user?.email) return showToast("Please login.", "error");
    if (!newReport.image || !newReport.description) {
      return showToast("Image & description required", "error");
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("farmerEmail", user.email);
    formData.append("description", newReport.description);
    
    if (newReport.image) {
      await appendImageToFormData(formData, 'image', newReport.image);
    }

    try {
      const res = await fetch(`${API_URL}/disease/report`, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        Alert.alert("Success", "Report submitted successfully! Redirecting you to home...");
        setNewReport({ image: null, description: "" });
        fetchData();
        
        // Auto-redirect to Farmer Dashboard after 3 seconds
        setTimeout(() => {
          router.replace('/farmer/FarmerDashboard' as any);
        }, 3000);
      } else {
        const errorMsg = data.message || "Server error. Please try again.";
        Alert.alert("Error", `Submission failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Cannot connect to server. Check your network.");
    } finally {
      setSubmitting(false);
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

      <ScrollView 
        style={styles.contentScroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.push('/farmer/FarmerDashboard' as any)}
          >
            <ArrowLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Agro Expert</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "Directory" && styles.tabActive]} 
            onPress={() => setActiveTab("Directory")}
          >
            <Text style={[styles.tabText, activeTab === "Directory" && styles.tabTextActive]}>Experts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "Reports" && styles.tabActive]} 
            onPress={() => setActiveTab("Reports")}
          >
            <Text style={[styles.tabText, activeTab === "Reports" && styles.tabTextActive]}>Diseases</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "Directory" ? (
          <View style={styles.expertList}>
            { experts.length === 0 && !loading && (
              <Text style={styles.emptyText}>No experts available yet.</Text>
            )}
            {experts.map(expert => (
              <View key={expert.id} style={styles.expertCard}>
                <View style={[styles.expertAvatar, styles.gradientAvatar]}>
                  <Text style={styles.avatarText}>{expert.full_name?.charAt(0) || "👤"}</Text>
                </View>
                <View style={styles.expertInfo}>
                  <Text style={styles.expertName}>{expert.full_name}</Text>
                  <View style={styles.metaRow}>
                    <MapPin size={12} color={COLORS.textMuted} />
                    <Text style={styles.expertMeta}>{expert.city || "Local Expert"}</Text>
                  </View>
                  <View style={styles.expertDetailsRow}>
                    <View style={styles.metaRow}>
                      <Phone size={12} color={COLORS.primary} />
                      <Text style={styles.expertPhone}>{expert.phone || "Consult now"}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.chatBtn}
                      onPress={() => router.push({ pathname: '/farmer/ChatPage', params: { type: 'user', id: expert.email } } as any)}
                    >
                      <MessageSquare size={14} color={COLORS.primary} />
                      <Text style={styles.chatBtnText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.diseaseSection}>
            {/* Report Form */}
            <View style={styles.reportForm}>
              <Text style={styles.formTitle}>Report a Disease</Text>
              
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {newReport.image ? (
                  <Image source={{ uri: newReport.image.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.pickerPlaceholder}>
                    <Camera size={32} color={COLORS.primary} />
                    <Text style={styles.pickerLabel}>Upload symptom photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput 
                style={styles.textArea} 
                placeholder="Describe the symptoms (e.g., yellow spots on leaves)..." 
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                value={newReport.description}
                onChangeText={(v) => setNewReport({...newReport, description: v})}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, (submitting || !newReport.image) && styles.btnDisabled]} 
                onPress={handleReportSubmit}
                disabled={submitting || !newReport.image}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Reports List */}
            <View style={styles.reportList}>
              <Text style={styles.sectionTitle}>Your Reports</Text>
              {reports.length === 0 ? (
                <Text style={styles.emptyText}>No reports submitted yet.</Text>
              ) : reports.map(report => (
                <View key={report.id} style={[styles.reportCard, report.status === 'Responded' && styles.cardResponded]}>
                  <View style={[styles.reportStatus, report.status === 'Responded' ? styles.statusResponded : styles.statusPending]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                  <Text style={styles.reportDesc}>{report.description}</Text>
                  {report.expert_response && (
                    <View style={styles.expertAdvice}>
                      <View style={styles.adviceHeader}>
                        <CheckSquare size={14} color="#1b5e20" />
                        <Text style={styles.adviceTitle}>Expert Diagnosis & Advice</Text>
                      </View>
                      <Text style={styles.adviceText}>{report.expert_response}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
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
  contentScroll: {
    flex: 1,
    backgroundColor: COLORS.bgInner,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    overflow: 'hidden',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#eeeeee',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  tabTextActive: {
    color: 'white',
  },
  expertList: {
    gap: 16,
    paddingBottom: 40,
  },
  expertCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    elevation: 2,
  },
  expertAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  gradientAvatar: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '800',
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expertMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  expertDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  expertPhone: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chatBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  diseaseSection: {
    paddingBottom: 40,
  },
  reportForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 16,
  },
  imagePicker: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pickerPlaceholder: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  reportList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    elevation: 2,
  },
  cardResponded: {
    borderLeftColor: '#16a34a',
  },
  reportStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 10,
  },
  statusPending: {
    backgroundColor: COLORS.pending,
  },
  statusResponded: {
    backgroundColor: COLORS.responded,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  reportDesc: {
    fontSize: 14,
    color: COLORS.textMain,
    lineHeight: 20,
  },
  expertAdvice: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1b5e20',
  },
  adviceText: {
    fontSize: 13,
    color: '#1b5e20',
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 40,
    fontStyle: 'italic',
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
