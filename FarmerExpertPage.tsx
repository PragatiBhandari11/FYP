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
import { ArrowLeft, MessageSquare, Camera, CheckSquare, MapPin, Phone, CheckCircle2, XCircle, Star, X, Pipette, Dog, AlertTriangle } from 'lucide-react-native';
import { Modal } from 'react-native';
import { UPLOADS_URL, API_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

const CATEGORY_DATA = [
  { id: 'Disease', label: 'Crop Disease', icon: <AlertTriangle size={18} color="#eab308" />, color: '#fef9c3' },
  { id: 'Soil', label: 'Soil Hub', icon: <Pipette size={18} color="#3b82f6" />, color: '#eff6ff' },
  { id: 'Animal', label: 'Animal Care', icon: <Dog size={18} color="#ef4444" />, color: '#fef2f2' },
];

const ANIMAL_TYPES = [
  { id: 'Cattle', label: 'Cattle', icon: '🐄' },
  { id: 'Poultry', label: 'Poultry', icon: '🐔' },
  { id: 'Sheep/Goat', label: 'Sheep/Goat', icon: '🐑' },
  { id: 'Swine', label: 'Swine', icon: '🐖' },
  { id: 'Other', label: 'Other', icon: '🐾' },
];

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
  const [newReport, setNewReport] = useState({ 
    image: null as any, 
    description: '',
    category: 'Disease',
    soil_ph: '',
    soil_n: '',
    soil_p: '',
    soil_k: '',
    animal_type: 'Cattle'
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [expertRatings, setExpertRatings] = useState<Record<string, { avg: number; total: number }>>({});
  const [ratingModal, setRatingModal] = useState<{ visible: boolean; expert: any }>({ visible: false, expert: null });
  const [selectedStar, setSelectedStar] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
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
      // Fetch ratings for all experts
      const ratingsMap: Record<string, { avg: number; total: number }> = {};
      await Promise.allSettled(
        expertData.map(async (e: any) => {
          try {
            const d = await api.get(`/reviews/expert/${e.email}`);
            ratingsMap[e.email] = { avg: d.averageRating || 0, total: d.totalReviews || 0 };
          } catch {}
        })
      );
      setExpertRatings(ratingsMap);
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

    // Validation
    if (newReport.category === 'Disease' && !newReport.image) {
      return showToast("Please upload a photo of the symptoms", "error");
    }
    if (!newReport.description) {
      return showToast("Please provide a description", "error");
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("farmerEmail", user.email);
    formData.append("description", newReport.description);
    formData.append("category", newReport.category);

    if (newReport.category === 'Soil') {
      if (newReport.soil_ph) formData.append("soil_ph", newReport.soil_ph);
      if (newReport.soil_n) formData.append("soil_n", newReport.soil_n);
      if (newReport.soil_p) formData.append("soil_p", newReport.soil_p);
      if (newReport.soil_k) formData.append("soil_k", newReport.soil_k);
    }

    if (newReport.category === 'Animal') {
      formData.append("animal_type", newReport.animal_type);
    }
    
    if (newReport.image) {
      await appendImageToFormData(formData, 'image', newReport.image);
    }

    try {
      console.log(`Submitting to: ${API_URL}/disease/report`);
      const res = await fetch(`${API_URL}/disease/report`, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast("Consultation submitted successfully! ✅");
        
        // Reset ALL fields including specialized ones
        setNewReport({ 
          image: null, 
          description: "",
          category: newReport.category, // Keep the category the user was in
          soil_ph: '',
          soil_n: '',
          soil_p: '',
          soil_k: '',
          animal_type: 'Cattle'
        });
        
        fetchData();
      } else {
        const errorMsg = data.message || "Server error. Please try again.";
        showToast(`Failed: ${errorMsg}`, "error");
      }
    } catch (err) {
      console.error("Submission error:", err);
      showToast("Connection error. Check backend server.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateExpert = async () => {
    if (selectedStar === 0) { Alert.alert('Select a star rating'); return; }
    if (!user?.email) { Alert.alert('Login required'); return; }
    setRatingSubmitting(true);
    try {
      await api.post(`/reviews/expert/${ratingModal.expert?.email}`, {
        reviewer_email: user.email,
        reviewer_name: user.fullName,
        rating: selectedStar,
        comment: ratingComment,
      });
      showToast(`${ratingModal.expert?.full_name} rated ${selectedStar}★!`);
      setRatingModal({ visible: false, expert: null });
      setSelectedStar(0);
      setRatingComment('');
      fetchData();
    } catch (e: any) {
      showToast(e.message || 'Could not submit rating', 'error');
    } finally {
      setRatingSubmitting(false);
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
            {experts.map(expert => {
              const rating = expertRatings[expert.email];
              return (
              <View key={expert.id} style={styles.expertCard}>
                <View style={[styles.expertAvatar, styles.gradientAvatar]}>
                  <Text style={styles.avatarText}>{expert.full_name?.charAt(0) || "👤"}</Text>
                </View>
                <View style={styles.expertInfo}>
                  <Text style={styles.expertName}>{expert.full_name}</Text>
                  {/* Rating Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={11} color="#fbbf24" fill={i <= Math.round(rating?.avg || 0) ? '#fbbf24' : 'transparent'} />
                    ))}
                    <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>
                      {rating?.total > 0 ? `${rating.avg} (${rating.total})` : 'No ratings'}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MapPin size={12} color={COLORS.textMuted} />
                    <Text style={styles.expertMeta}>{expert.city || "Local Expert"}</Text>
                  </View>
                  <View style={styles.expertDetailsRow}>
                    <View style={styles.metaRow}>
                      <Phone size={12} color={COLORS.primary} />
                      <Text style={styles.expertPhone}>{expert.phone || "Consult now"}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity 
                        style={[styles.chatBtn, { backgroundColor: '#fffbeb', borderColor: '#fbbf24' }]}
                        onPress={() => setRatingModal({ visible: true, expert })}
                      >
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <Text style={[styles.chatBtnText, { color: '#d97706' }]}>Rate</Text>
                      </TouchableOpacity>
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
              </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.diseaseSection}>
            {/* Consultation Form */}
            <View style={styles.reportForm}>
              <Text style={styles.formTitle}>New {newReport.category} Inquiry</Text>
              
              <Text style={styles.inputLabel}>Select Category:</Text>
              <View style={styles.catSelector}>
                {CATEGORY_DATA.map((cat) => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.catTab, newReport.category === cat.id && { backgroundColor: cat.color, borderColor: COLORS.primary }]}
                    onPress={() => setNewReport({ ...newReport, category: cat.id })}
                  >
                    {cat.icon}
                    <Text style={styles.catLabel}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {newReport.category === 'Animal' && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.inputLabel}>Select Animal Type:</Text>
                  <View style={styles.animalGrid}>
                    {ANIMAL_TYPES.map((type) => (
                      <TouchableOpacity 
                        key={type.id} 
                        style={[styles.animalItem, newReport.animal_type === type.id && styles.animalItemActive]}
                        onPress={() => setNewReport({ ...newReport, animal_type: type.id })}
                      >
                        <Text style={styles.animalIcon}>{type.icon}</Text>
                        <Text style={[styles.animalLabel, newReport.animal_type === type.id && styles.animalLabelActive]}>{type.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {newReport.category === 'Soil' && (
                <View style={styles.soilInputGrid}>
                  <View style={styles.soilInputItem}>
                    <Text style={styles.soilInputLabel}>pH Level (0-14)</Text>
                    <TextInput style={styles.miniInput} placeholder="e.g. 6.5" keyboardType="numeric" value={newReport.soil_ph} onChangeText={(v) => setNewReport({ ...newReport, soil_ph: v })} />
                  </View>
                  <View style={styles.soilInputItem}>
                    <Text style={styles.soilInputLabel}>Nitrogen (mg/kg)</Text>
                    <TextInput style={styles.miniInput} placeholder="e.g. 150" keyboardType="numeric" value={newReport.soil_n} onChangeText={(v) => setNewReport({ ...newReport, soil_n: v })} />
                  </View>
                  <View style={styles.soilInputItem}>
                    <Text style={styles.soilInputLabel}>Phosphorus (mg/kg)</Text>
                    <TextInput style={styles.miniInput} placeholder="e.g. 40" keyboardType="numeric" value={newReport.soil_p} onChangeText={(v) => setNewReport({ ...newReport, soil_p: v })} />
                  </View>
                  <View style={styles.soilInputItem}>
                    <Text style={styles.soilInputLabel}>Potassium (mg/kg)</Text>
                    <TextInput style={styles.miniInput} placeholder="e.g. 250" keyboardType="numeric" value={newReport.soil_k} onChangeText={(v) => setNewReport({ ...newReport, soil_k: v })} />
                  </View>
                </View>
              )}

              <Text style={styles.inputLabel}>{newReport.category === 'Disease' ? 'Upload Symptom Photo:' : 'Upload Photo (Optional):'}</Text>
              
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
                style={[styles.submitBtn, (submitting || (newReport.category === 'Disease' && !newReport.image) || !newReport.description) && styles.btnDisabled]} 
                onPress={handleReportSubmit}
                disabled={submitting || (newReport.category === 'Disease' && !newReport.image) || !newReport.description}
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
                    <Text style={styles.statusText}>
                      {report.category ? `${report.category} • ` : ''}{report.status}
                    </Text>
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

      {/* Expert Rating Modal */}
      <Modal visible={ratingModal.visible} transparent animationType="slide" onRequestClose={() => setRatingModal({ visible: false, expert: null })}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>Rate {ratingModal.expert?.full_name}</Text>
              <TouchableOpacity onPress={() => setRatingModal({ visible: false, expert: null })}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>How helpful was this expert?</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[1,2,3,4,5].map(i => (
                <TouchableOpacity key={i} onPress={() => setSelectedStar(i)}>
                  <Star size={40} color="#fbbf24" fill={i <= selectedStar ? '#fbbf24' : 'transparent'} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b', textAlignVertical: 'top', minHeight: 80, marginBottom: 16, backgroundColor: '#fafafa' }}
              placeholder="Add a comment (optional)..."
              placeholderTextColor="#94a3b8"
              multiline
              value={ratingComment}
              onChangeText={setRatingComment}
            />
            <TouchableOpacity
              style={{ backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', opacity: ratingSubmitting ? 0.6 : 1 }}
              onPress={handleRateExpert}
              disabled={ratingSubmitting}
            >
              {ratingSubmitting 
                ? <ActivityIndicator color="white" />
                : <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Submit Rating ⭐</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 8,
    marginTop: 4,
  },
  catSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  catTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  catLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  soilInputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  soilInputItem: {
    width: '48%',
    gap: 4,
  },
  soilInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
    textTransform: 'uppercase',
  },
  miniInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#0c4a6e',
  },
  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  animalItem: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  animalItemActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  animalIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  animalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  animalLabelActive: {
    color: '#ef4444',
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
