import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../utils/api';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Star, 
  ShieldCheck,
  Building
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#16a34a',
  primaryDark: '#15803d',
  bgOuter: '#f8fafc',
  bgInner: '#ffffff',
  white: '#ffffff',
  textMain: '#1e293b',
  textMuted: '#64748b',
  borderColor: '#e5e7eb',
  accent: '#f0fdf4',
  warning: '#f59e0b',
};

export default function CollaborationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [collab, setCollab] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCollab = async () => {
    try {
      const data = await api.get(`/collaborations/${id}`);
      setCollab(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load partner details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCollab();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bgOuter }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading partner details...</Text>
      </View>
    );
  }

  if (!collab) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bgOuter }]}>
        <Text style={styles.errorText}>Collaboration not found.</Text>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => router.back()}>
          <Text style={styles.errorBackBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Full Bleed Hero Header */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: collab.image_url ? `${UPLOADS_URL}${collab.image_url}` : "https://images.unsplash.com/photo-1566073771259-6a8506099945" }} 
          style={styles.heroImg} 
        />
        <View style={styles.heroOverlay} />
        
        {/* Floating Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.verifiedPill}>
            <ShieldCheck size={14} color="#10b981" />
            <Text style={styles.verifiedText}>Official Partner</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView 
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        <View style={styles.detailsCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{collab.name}</Text>
              <Text style={styles.metaType}>{collab.type || 'Agricultural Partnership'}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingNum}>4.9</Text>
              <View style={styles.starRow}>
                <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
                <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
                <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
                <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
                <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
              </View>
            </View>
          </View>

          <View style={styles.descBox}>
            <Text style={styles.descTitle}>About the Partnership</Text>
            <Text style={styles.descText}>{collab.description}</Text>
          </View>

          {/* Quick Contact Grid */}
          <Text style={styles.descTitle}>Contact Information</Text>
          <View style={styles.contactGrid}>
            <View style={styles.contactCard}>
              <View style={[styles.contactIconBg, { backgroundColor: '#eff6ff' }]}>
                <MapPin size={22} color="#3b82f6" />
              </View>
              <View style={styles.contactTextWrapper}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue} numberOfLines={1}>{collab.location}</Text>
              </View>
            </View>
            
            <View style={styles.contactCard}>
              <View style={[styles.contactIconBg, { backgroundColor: '#f0fdf4' }]}>
                <Phone size={22} color="#16a34a" />
              </View>
              <View style={styles.contactTextWrapper}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue} numberOfLines={1}>{collab.contact}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.contactCard, { width: '100%', marginBottom: 30 }]}>
            <View style={[styles.contactIconBg, { backgroundColor: '#fef2f2' }]}>
              <Mail size={22} color="#ef4444" />
            </View>
            <View style={styles.contactTextWrapper}>
              <Text style={styles.contactLabel}>Corporate Email</Text>
              <Text style={styles.contactValue} numberOfLines={1}>contact@partner.com</Text>
            </View>
          </View>

          {/* Call to Action Chat */}
          <View style={styles.actionContainer}>
            <View style={styles.actionHeader}>
              <Building size={24} color={COLORS.primary} />
              <Text style={styles.actionTitle}>Connect Directly</Text>
            </View>
            <Text style={styles.actionDesc}>
              Have specific contract terms to discuss or want to finalize a bulk supply deal? Message their representative securely.
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={() => router.push(`/farmer/ChatPage?type=collab&id=${id}` as any)}
            >
              <MessageSquare size={20} color="white" />
              <Text style={styles.primaryBtnText}>Open Partnership Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bgOuter,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: '700',
  },
  errorBackBtn: {
    marginTop: 20,
    backgroundColor: COLORS.textMain,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBackBtnText: {
    color: 'white',
    fontWeight: '800',
  },
  heroContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#064e3b',
  },
  contentScroll: {
    flex: 1,
    marginTop: -50,
  },
  scrollPadding: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textMain,
    lineHeight: 32,
    marginBottom: 4,
  },
  metaType: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  ratingBox: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  ratingNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b45309',
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  descBox: {
    marginBottom: 30,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 12,
  },
  descText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  contactCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextWrapper: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  actionContainer: {
    backgroundColor: COLORS.bgOuter,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  actionDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
