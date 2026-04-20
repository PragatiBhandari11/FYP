import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  RefreshControl, 
  ActivityIndicator, 
  Modal,
  Dimensions,
  Platform,
  TextInput
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Bell, 
  Plus, 
  ClipboardList, 
  Tractor, 
  User,
  Users,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X,
  TrendingUp,
  Sprout,
  Sun,
  CloudRain,
  Calendar
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const COLORS = {
  bgOuter: '#cadbcb',
  bgInner: '#e0efe4',
  white: '#ffffff',
  primary: '#16a34a',
  secondaryActive: '#419266',
  danger: '#ef4444',
  textMain: '#1e293b',
  textMuted: '#475569',
  textLight: '#94a3b8',
  weatherBlue: '#2e81c0',
  cardBg: 'rgba(255, 255, 255, 0.65)',
};

interface Order {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  status: string;
  image_url: string;
  order_number: string;
  buyer_name?: string;
}

interface Collab {
  id: number;
  name: string;
  image_url: string;
  type?: string;
  location?: string;
  contact?: string;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState(user?.fullName || '');
  const [stats, setStats] = useState({ earnings: 0, ordersCount: 0, productsCount: 0 });
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...', city: '' });
  const [data, setData] = useState<any>({
    recentOrders: [],
    demands: [],
    notifications: [],
    collabs: [],
    articles: [],
    marketPrices: [],
    harvestAlerts: [],
    activeCrops: [],
    advisory: null
  });
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: '', plantedDate: new Date().toISOString().split('T')[0] });
  const [isSubmittingCrop, setIsSubmittingCrop] = useState(false);

  const fetchAllData = async () => {
    if (!user?.email) return;
    try {
      // 1. Fetch Location first to make weather real
      let coords = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = loc.coords;
        }
      } catch (locErr) {
        console.log("Location permission denied or failed.");
      }

      const [uProfile, oData, pData, dData, nData, cData, aData, hData, advData] = await Promise.all([
        api.get(`/user/${user.email}`).catch(() => ({})),
        api.get(`/orders/farmer/${user.email}`).catch(() => []),
        api.get(`/products/farmer/${user.email}`).catch(() => []),
        api.get('/demands').catch(() => []),
        api.get(`/notifications/${user.email}`).catch(() => []),
        api.get('/collaborations').catch(() => []),
        api.get('/articles').catch(() => []),
        api.get(`/harvest/alerts/${user.email}`).catch(() => []),
        api.get(`/harvest/seasonal-advisory?city=${user.city || 'Kathmandu'}`).catch(() => null)
      ]);

      setUserName(uProfile.full_name || user.fullName || '');
      
      const earnings = (oData || [])
        .filter((o: any) => o.status === 'Delivered')
        .reduce((sum: number, o: any) => sum + (o.price_at_purchase * o.quantity), 0);

      setStats({
        earnings,
        ordersCount: (oData || []).length,
        productsCount: (pData || []).length
      });

      console.log(`🔔 Notifications synced for ${user.email}: ${nData?.length || 0} items`);
      setData({
        recentOrders: Array.isArray(oData) ? oData.slice(0, 5) : [],
        demands: Array.isArray(dData) ? dData : [],
        notifications: Array.isArray(nData) ? nData : [],
        collabs: Array.isArray(cData) ? cData : [],
        articles: Array.isArray(aData) ? aData.slice(0, 3) : [],
        marketPrices: [],
        harvestAlerts: hData?.alerts || [],
        activeCrops: hData?.crops || [],
        advisory: advData || null
      });

      // 3. Fetch Market Prices separately
      api.get('/market-prices').then(mpData => {
        if (Array.isArray(mpData)) {
          setData((prev: any) => ({ ...prev, marketPrices: mpData.slice(0, 8) }));
        }
      }).catch(() => {});

      // 2. Fetch Weather using coords or city fallback
      try {
        let wData;
        if (coords) {
          wData = await api.get(`/weather/coords?lat=${coords.latitude}&lon=${coords.longitude}`);
        } else {
          const weatherCity = uProfile.city || user.city || 'kathmandu';
          wData = await api.get(`/weather/${weatherCity}`);
        }
        setWeather(wData);
      } catch (wErr) {
        setWeather({ temp: '24', condition: 'Sunny', city: (uProfile.city || 'local area').toLowerCase() });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRegisterCrop = async () => {
    if (!newCrop.name) return Alert.alert("Error", "Please enter crop name");
    setIsSubmittingCrop(true);
    try {
      await api.post('/harvest/register-crop', {
        email: user?.email,
        cropName: newCrop.name,
        plantedDate: newCrop.plantedDate,
        city: weather.city || 'Kathmandu'
      });
      Alert.alert("Success", "Crop added to tracking list! We'll alert you when it's harvest time.");
      setShowAddCrop(false);
      setNewCrop({ name: '', plantedDate: new Date().toISOString().split('T')[0] });
      fetchAllData();
    } catch (err) {
      Alert.alert("Error", "Failed to register crop");
    } finally {
      setIsSubmittingCrop(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchAllData();
    } catch (e) {}
  };
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setData((prev: any) => ({
        ...prev,
        notifications: prev.notifications.map((n: any) => n.id === id ? { ...n, is_read: 1 } : n)
      }));
    } catch (e) {}
  };

  const unreadCount = data.notifications.filter((n: any) => !n.is_read).length;

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.appWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.header}>
            <View style={styles.profile}>
              <View style={styles.avatar}>
                <User color="rgba(255,255,255,0.8)" size={24} />
              </View>
              <View>
                <Text style={styles.welcome}>Hello, {userName}</Text>
                <Text style={styles.role}>Verified Farmer</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifs(true)}>
              <Bell size={22} color={unreadCount > 0 ? "#ef4444" : "#f59e0b"} fill={unreadCount > 0 ? "#ef4444" : "#f59e0b"} />
              {unreadCount > 0 && <View style={styles.notifBadgeSmall} />}
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Earnings</Text>
              <Text style={styles.statVal}>Rs {stats.earnings.toLocaleString()}</Text>
              <Text style={styles.statMiniGreen}>Delivered Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statVal}>{stats.ordersCount}</Text>
              <Text style={styles.statMini}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Products</Text>
              <Text style={styles.statVal}>{stats.productsCount}</Text>
              <Text style={styles.statMini}>Listed</Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/farmer/AddProduct' as any)}>
              <View style={styles.iconBox}><Plus size={20} color={COLORS.primary} /></View>
              <Text style={styles.actionLabel}>Add{'\n'}Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/orders' as any)}>
              <View style={styles.iconBox}><ClipboardList size={20} color="#64748b" /></View>
              <Text style={styles.actionLabel}>View{'\n'}Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/farmer/MyProducts' as any)}>
              <View style={styles.iconBox}><Tractor size={20} color={COLORS.primary} /></View>
              <Text style={styles.actionLabel}>My\nFarm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/experts' as any)}>
              <View style={styles.iconBox}><User size={20} color="#1e293b" /></View>
              <Text style={styles.actionLabel}>Add{'\n'}Expert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => setShowAddCrop(true)}>
              <View style={styles.iconBox}><Sprout size={20} color="#8b5cf6" /></View>
              <Text style={styles.actionLabel}>Track{'\n'}Harvest</Text>
            </TouchableOpacity>
          </View>

          {/* Market Prices Strip */}
          <View style={styles.marketStrip}>
            <View style={styles.marketStripHeader}>
              <TrendingUp size={16} color={COLORS.primary} />
              <Text style={styles.marketStripTitle}>Live Kalimati Prices</Text>
              <TouchableOpacity onPress={() => router.push('/buyer/ExplorePage' as any)}>
                <Text style={styles.viewAllMini}>Trends</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketScroll}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 20 }} />
              ) : (
                data.marketPrices?.map((m: any, i: number) => (
                  <View key={i} style={styles.marketItem}>
                    <Text style={styles.marketName}>{m.name}</Text>
                    <Text style={styles.marketPrice}>Rs {m.price}/{m.unit}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={styles.infoRow}>
            <TouchableOpacity 
              style={styles.demandCard} 
              onPress={() => data.demands.length > 0 && router.push(`/farmer/DemandDetail?id=${data.demands[0].id}` as any)}
            >
              <Text style={styles.infoSmall}>High Demand:</Text>
              <Text style={styles.infoLarge}>{data.demands.length > 0 ? data.demands[0].product_name : 'No Current Demands'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                 <Text style={styles.demandNum}>{data.demands.length > 0 ? data.demands[0].quantity : '--'} Needed</Text>
                 <Text style={styles.badgeText}>{data.demands.length > 0 ? 'ACTIVE' : ''}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.weatherCard} onPress={() => router.push('/farmer/WeatherDetail' as any)}>
              <Text style={styles.weatherCity}>{weather.city || 'kathmandu'}</Text>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherCond}>{weather.condition}</Text>
            </TouchableOpacity>
          </View>

          {/* Seasonal Advisory Widget */}
          {data.advisory && (
            <TouchableOpacity 
              style={styles.advisoryCard} 
              onPress={() => Alert.alert(`Monthly Advice (${data.advisory.month})`, data.advisory.summary)}
            >
              <View style={styles.advisoryIcon}>
                <Calendar size={20} color="#0369a1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.advisoryMonth}>{data.advisory.month} Advisory</Text>
                <Text style={styles.advisorySummary} numberOfLines={1}>{data.advisory.summary}</Text>
                <Text style={styles.advisoryAdvice}>{data.advisory.weatherAdvice}</Text>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}

          {/* Harvest Alerts Section */}
          {data.harvestAlerts.length > 0 && (
            <View style={styles.harvestSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🌾 Harvesting Recommendations</Text>
              </View>
              {data.harvestAlerts.map((alert: any, idx: number) => (
                <View key={idx} style={[styles.harvestAlert, alert.isGoodWindow ? styles.alertSuccess : styles.alertWarning]}>
                  <View style={styles.alertIconBox}>
                    {alert.isGoodWindow ? <Sun size={20} color="#166534" /> : <CloudRain size={20} color="#991b1b" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>{alert.cropName} - {alert.daysRemaining <= 0 ? 'READY' : `In ${alert.daysRemaining} days`}</Text>
                    <Text style={styles.alertDesc}>{alert.message}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Atomic Field Status (Precision Harvesting) */}
          {data.activeCrops?.length > 0 && (
            <View style={styles.atomicSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🛰️ Atomic Field Status</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.atomicScroll}>
                {data.activeCrops.map((crop: any, i: number) => (
                  <View key={i} style={styles.atomicCard}>
                    <Text style={styles.atomicCropName}>{crop.crop_name}</Text>
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${crop.progress}%` }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.atomicMeta}>{Math.round(crop.progress)}%</Text>
                      <Text style={styles.atomicDate}>Est. {new Date(crop.expected_harvest_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Recent Orders</Text>
             <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)}>
                <Text style={styles.viewAll}>View All</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.listSection}>
             {data.recentOrders.length === 0 ? (
               <Text style={styles.emptyText}>No recent orders.</Text>
             ) : (
               data.recentOrders.map((o: Order) => (
                 <View key={o.id} style={styles.orderItem}>
                    <View style={styles.orderLeft}>
                      <Image source={{ uri: o.image_url ? `${UPLOADS_URL}${o.image_url}` : 'https://via.placeholder.com/150' }} style={styles.orderImg} />
                       <View style={styles.orderInfo}>
                          <Text style={styles.orderName}>{o.product_name}</Text>
                          <Text style={styles.orderBuyer}>Buyer: {o.buyer_name || 'AgroBuyer'}</Text>
                          <Text style={styles.orderMeta}>{o.quantity} units • {o.order_number}</Text>
                         <Text style={styles.orderPrice}>Rs{o.price_at_purchase * o.quantity}</Text>
                      </View>
                    </View>
                    <View style={styles.orderActions}>
                      <Text style={[styles.statusText, o.status === 'Delivered' && { color: COLORS.primary }]}>
                        {o.status === 'Accepted' ? 'Accepted' : o.status}
                      </Text>
                    </View>
                 </View>
               ))
             )}
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Collaborations</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalContent}
          >
             {data.collabs.length === 0 ? (
               <Text style={styles.emptyText}>No collaborations found.</Text>
             ) : (
               data.collabs.map((c: Collab) => (
                 <TouchableOpacity key={c.id} style={styles.collabCard} onPress={() => router.push(`/farmer/CollaborationDetail?id=${c.id}` as any)}>
                    <Image source={{ uri: c.image_url ? `${UPLOADS_URL}${c.image_url}` : 'https://via.placeholder.com/150' }} style={styles.cardImg} />
                    <View style={styles.cardInfo}>
                       <Text style={styles.cardTitle} numberOfLines={1}>{c.name}</Text>
                       <Text style={styles.cardMeta} numberOfLines={1}>{c.type || 'Partnership'}</Text>
                       <Text style={styles.cardMeta} numberOfLines={1}>{c.location || 'Regional'}</Text>
                    </View>
                 </TouchableOpacity>
               ))
             )}
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Expert Knowledge</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalContent}
          >
             {data.articles && data.articles.length === 0 ? (
               <Text style={styles.emptyText}>No articles published.</Text>
             ) : (
               data.articles.map((a: any) => (
                 <TouchableOpacity key={a.id} style={styles.articleCard} onPress={() => router.push(`/farmer/ArticleDetail?id=${a.id}` as any)}>
                    <Image source={{ uri: a.image_url ? `${UPLOADS_URL}${a.image_url}` : 'https://via.placeholder.com/150' }} style={styles.cardImg} />
                    <View style={styles.cardInfo}>
                       <Text style={styles.cardTitle} numberOfLines={2}>{a.title}</Text>
                       <Text style={styles.cardMeta}>{a.category || 'General'}</Text>
                    </View>
                 </TouchableOpacity>
               ))
             )}
          </ScrollView>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Notifications Modal */}
      <Modal visible={showNotifs} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifs(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Alerts</Text>
              <TouchableOpacity onPress={() => setShowNotifs(false)}>
                <X size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {data.notifications.length === 0 ? (
                <Text style={styles.emptyNotifText}>No notifications yet.</Text>
              ) : (
                data.notifications.map((n: any) => (
                  <TouchableOpacity 
                    key={n.id} 
                    style={[styles.notifItem, !n.is_read && styles.unreadNotif]} 
                    onPress={() => !n.is_read && markAsRead(n.id)}
                  >
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      {n.type && (
                        <View style={[styles.typeBadge, { backgroundColor: n.type === 'Demand' ? '#f59e0b' : '#3b82f6' }]}>
                          <Text style={styles.typeBadgeText}>{n.type}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.notifMsg}>{n.message}</Text>
                    <Text style={styles.notifTime}>{new Date(n.created_at).toLocaleString()}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Crop Modal */}
      <Modal visible={showAddCrop} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.cropModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Track New Crop</Text>
              <TouchableOpacity onPress={() => setShowAddCrop(false)}>
                <X size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Name (e.g. Rice, Tomato)</Text>
              <View style={styles.inputBox}>
                <Sprout size={18} color="#94a3b8" />
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter crop name"
                  value={newCrop.name}
                  onChangeText={(t: string) => setNewCrop({...newCrop, name: t})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Planted Date (YYYY-MM-DD)</Text>
              <View style={styles.inputBox}>
                <Calendar size={18} color="#94a3b8" />
                <TextInput 
                  style={styles.input} 
                  placeholder="2024-03-01"
                  value={newCrop.plantedDate}
                  onChangeText={(t: string) => setNewCrop({...newCrop, plantedDate: t})}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmittingCrop && { opacity: 0.7 }]} 
              onPress={handleRegisterCrop}
              disabled={isSubmittingCrop}
            >
              {isSubmittingCrop ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Start Tracking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Re-importing Lucide icons that might be missing locally */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgOuter,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    alignItems: 'center',
  },
  appWrapper: {
    width: '100%',
    maxWidth: 600,
    flex: 1,
    backgroundColor: COLORS.bgInner,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgOuter,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#305c2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  role: {
    fontSize: 12,
    color: '#0f5132',
    fontWeight: '600',
  },
  notifBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    padding: 14,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '700',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 4,
  },
  statMini: {
    fontSize: 11,
    color: COLORS.textMain,
    fontWeight: '500',
    marginTop: 4,
  },
  statMiniGreen: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '500',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionItem: {
    width: (width - 48 - 36) / 4,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconBox: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  marketStrip: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  marketStripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  marketStripTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    flex: 1,
  },
  viewAllMini: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  marketScroll: {
    gap: 12,
  },
  marketItem: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  marketName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  marketPrice: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '800',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  demandCard: {
    flex: 1.2,
    justifyContent: 'center',
  },
  infoSmall: {
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  infoLarge: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  demandNum: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  badgeText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
    marginLeft: 6,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  weatherCard: {
    flex: 1,
    backgroundColor: COLORS.weatherBlue,
    padding: 16,
    borderRadius: 16,
  },
  weatherCity: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
    marginBottom: 8,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  weatherCond: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  viewAll: {
    fontSize: 13,
    color: '#419266',
    fontWeight: '700',
  },
  listSection: {
    gap: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  orderMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  orderPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  acceptBtn: {
    backgroundColor: COLORS.secondaryActive,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  acceptText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#419266',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  horizontalContent: {
    paddingRight: 24,
    gap: 16,
    paddingBottom: 10,
  },
  collabCard: {
    width: 160,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  articleCard: {
    width: 180,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardImg: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  notifBadgeSmall: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#e0efe4',
  },
  orderBuyer: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  cropModalContent: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    elevation: 20,
  },
  harvestSection: {
    marginBottom: 24,
  },
  harvestAlert: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  alertWarning: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  alertIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  alertDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textMain,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
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
  advisoryCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  advisoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#bae6fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advisoryMonth: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369a1',
  },
  advisorySummary: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '600',
    marginTop: 2,
  },
  advisoryAdvice: {
    fontSize: 11,
    color: '#0284c7',
    marginTop: 2,
  },
  atomicSection: {
    marginBottom: 24,
  },
  atomicScroll: {
    gap: 12,
    paddingVertical: 12,
  },
  atomicCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  atomicCropName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 10,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  atomicMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  atomicDate: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  notifItem: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
  },
  unreadNotif: {
    backgroundColor: 'rgba(22, 163, 74, 0.05)',
    borderLeftColor: COLORS.primary,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  notifMsg: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyNotifText: {
    textAlign: 'center',
    padding: 40,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
