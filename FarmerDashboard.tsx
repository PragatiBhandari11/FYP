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
  Platform
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
  AlertCircle
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';

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
  const [weather, setWeather] = useState({ temp: '--', condition: 'Loading...', city: '' });
  const [data, setData] = useState<any>({
    recentOrders: [],
    demands: [],
    notifications: [],
    collabs: [],
    articles: [],
  });
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchAllData = async () => {
    if (!user?.email) return;
    try {
      const [uProfile, oData, pData, dData, nData, cData, aData] = await Promise.all([
        api.get(`/user/${user.email}`).catch(() => ({})),
        api.get(`/orders/farmer/${user.email}`).catch(() => []),
        api.get(`/products/farmer/${user.email}`).catch(() => []),
        api.get('/demands').catch(() => []),
        api.get(`/notifications/${user.email}`).catch(() => []),
        api.get('/collaborations').catch(() => []),
        api.get('/articles').catch(() => [])
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

      setData({
        recentOrders: (oData || []).slice(0, 5),
        demands: dData || [],
        notifications: nData || [],
        collabs: cData || [],
        articles: (aData || []).slice(0, 3),
      });

      const weatherCity = uProfile.city || user.city || 'kathmandu';
      try {
        const wData = await api.get(`/weather/${weatherCity}`);
        setWeather({ ...wData, city: weatherCity });
      } catch (wErr) {
        setWeather({ temp: '11', condition: 'Sunny', city: weatherCity.toLowerCase() });
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
              <Bell size={22} color="#f59e0b" fill="#f59e0b" />
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
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/products' as any)}>
              <View style={styles.iconBox}><Tractor size={20} color={COLORS.primary} /></View>
              <Text style={styles.actionLabel}>My{'\n'}Farm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/experts' as any)}>
              <View style={styles.iconBox}><User size={20} color="#1e293b" /></View>
              <Text style={styles.actionLabel}>Add{'\n'}Expert</Text>
            </TouchableOpacity>
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
                         <Text style={styles.orderMeta}>{o.quantity} units • KLT-</Text>
                         <Text style={styles.orderMeta}>{o.order_number}</Text>
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
});
