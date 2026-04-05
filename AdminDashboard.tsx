import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  RefreshCw, 
  Home, 
  Users, 
  Calendar, 
  Link2, 
  Truck, 
  Settings, 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle, 
  UserX, 
  Trash2, 
  ChevronRight, 
  LogOut, 
  X, 
  PlusCircle,
  Clock,
  AlertCircle,
  User,
  Key,
  MapPin,
  Mail,
  Edit2,
  Camera,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../utils/api';
import { appendImageToFormData } from '../../utils/upload';
import { API_URL, UPLOADS_URL } from '../../constants/API';
import AdminProfile from './AdminProfile';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1e293b',
  accent: '#10b981',
  textMain: '#1e293b',
  textMuted: '#64748b',
  bgMain: '#ffffff',
  bgSecondary: '#f8fafc',
  danger: '#ef4444',
  success: '#16a34a',
  warning: '#f59e0b',
  info: '#3b82f6',
};

interface UserData { id: number; full_name: string; email: string; role: string; is_approved: boolean; }
interface Product { id: number; name: string; price: number; quantity: number; category: string; farmer_name?: string; farmer_id?: number; }
interface Order { id: number; order_number: string; buyer_name?: string; buyer_email: string; total_amount: string; status: string; vehicle_id?: string | number; plate_number?: string; vehicle_type?: string; }
interface Vehicle { id: number; plate_number: string; vehicle_type: string; status: string; }
interface Crop { id: number; crop_name: string; crop_type: string; season_type: string; best_months: string; }
interface Collab { id: number; name: string; type: string; location: string; image_url: string; contact?: string; }

// ─── StatusBadge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps { label: string; approved: boolean; }
const StatusBadge: React.FC<StatusBadgeProps> = ({ label, approved }) => (
  <View style={[styles.badge, approved ? styles.badgeApproved : styles.badgePending]}>
    <Text style={[styles.badgeText, approved ? styles.badgeTextApproved : styles.badgeTextPending]}>
      {label}
    </Text>
  </View>
);

// ─── StatCard ────────────────────────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; icon: any; iconBg: string; iconColor: string; onPress?: () => void; }
const StatCard: React.FC<StatCardProps> = ({ label, value, icon: IconComponent, iconBg, iconColor, onPress }) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
      <IconComponent size={18} color={iconColor} />
    </View>
  </TouchableOpacity>
);

// ─── ListCard ────────────────────────────────────────────────────────────────
interface ListCardProps { children: React.ReactNode; style?: any; }
const ListCard: React.FC<ListCardProps> = ({ children, style }) => (
  <View style={[styles.listCard, style]}>{children}</View>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, login } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState({ totalEarnings: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [cropCalendar, setCropCalendar] = useState<Crop[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const spinAnim = useRef(new Animated.Value(0)).current;

  const [newCrop, setNewCrop] = useState({
    crop_name: '', crop_type: 'Vegetable', season_type: 'Seasonal', best_months: '', description: '',
  });
  const [newVehicle, setNewVehicle] = useState({ plate_number: '', vehicle_type: 'Pickup Van' });
  const [newCollab, setNewCollab] = useState<any>({
    name: '', type: 'Hotel', description: '', location: '', contact: '', image: null
  });

  const showToast = (message: string, type: string = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const startSpin = () => {
    spinAnim.setValue(0);
    Animated.loop(Animated.timing(spinAnim, {
      toValue: 1, duration: 800, useNativeDriver: true,
    })).start();
  };
  const stopSpin = () => spinAnim.stopAnimation();

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const fetchAllData = async () => {
    setIsRefreshing(true);
    startSpin();
    try {
      const [usersRes, productsRes, ordersRes, collabsRes, calendarRes, vehiclesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/admin/orders'),
        api.get('/collaborations'),
        api.get('/calendar/crops'),
        api.get('/admin/vehicles'),
      ]);
      setUsers(usersRes || []);
      setProducts(productsRes || []);
      setOrders(ordersRes || []);
      setCollabs(collabsRes || []);
      setCropCalendar(calendarRes || []);
      setVehicles(vehiclesRes || []);
      const earnings = (ordersRes || []).reduce((s: number, o: Order) => s + parseFloat(o.total_amount || '0'), 0);
      setStats({ totalEarnings: earnings });
    } catch (err) {
      console.error('Admin Fetch error:', err);
      showToast('Connection failed', 'error');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
      stopSpin();
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
      // await logout(); // User requested to NOT clear data
      router.replace('/welcome' as any);
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Log Out: End current session?")) {
        performLogout();
      }
    } else {
      Alert.alert('Log Out', 'End current session?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  const approveUser = (id: number) =>
    api.put(`/admin/users/${id}/approve`, {}).then(fetchAllData);

  const deleteUser = (id: number) =>
    Alert.alert('Remove User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
          api.delete(`/admin/users/${id}`).then(fetchAllData) },
    ]);

  const deleteProduct = (id: number) =>
    Alert.alert('Delete Product', 'Remove from inventory?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () =>
          api.delete(`/admin/products/${id}`).then(fetchAllData) },
    ]);

  const deleteCollab = (id: number) =>
    Alert.alert('Remove Partnership', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
          api.delete(`/collaborations/${id}`).then(fetchAllData) },
    ]);

  const updateOrderStatus = (id: number, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }).then(fetchAllData);

  const deleteVehicle = (id: number) =>
    Alert.alert('Remove Vehicle', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
          api.delete(`/admin/vehicles/${id}`).then(fetchAllData) },
    ]);

  const deleteCrop = (id: number) =>
    Alert.alert('Remove Crop', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
          api.delete(`/calendar/crops/${id}`).then(fetchAllData) },
    ]);

  const assignVehicleToOrder = (orderId: number, vehicleId: string) => {
    if (!vehicleId) return;
    api.put(`/admin/orders/${orderId}/assign-vehicle`, { vehicleId })
      .then(d => { 
        Alert.alert('Vehicle Assigned', d.message || 'Success'); 
        fetchAllData(); 
      });
  };

  const handleVehicleSubmit = () => {
    if (!newVehicle.plate_number) { Alert.alert('Enter plate number'); return; }
    api.post('/admin/vehicles', newVehicle).then(() => {
      fetchAllData();
      setNewVehicle({ plate_number: '', vehicle_type: 'Pickup Van' });
      showToast('Vehicle added to fleet!');
    });
  };

  const handleCollabSubmit = async () => {
    if (!newCollab.name || !newCollab.location) { Alert.alert('Name and location required'); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newCollab.name);
      formData.append('type', newCollab.type);
      formData.append('location', newCollab.location);
      formData.append('contact', newCollab.contact);
      formData.append('description', newCollab.description);
      
      if (newCollab.image) {
        await appendImageToFormData(formData, 'image', newCollab.image);
      }
      
      const response = await fetch(`${API_URL}/collaborations`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add Partner');
      }

      fetchAllData();
      setNewCollab({ name: '', type: 'Hotel', description: '', location: '', contact: '', image: null });
      showToast('Partner added!');
    } catch(err) {
      console.error(err);
      showToast('Failed to add Partner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pickCollabImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewCollab({ ...newCollab, image: result.assets[0] });
    }
  };

  const handleCropSubmit = () => {
    if (!newCrop.crop_name) { Alert.alert('Enter crop name'); return; }
    api.post('/calendar/crops', newCrop).then(() => {
      fetchAllData();
      setNewCrop({ crop_name: '', crop_type: 'Vegetable', season_type: 'Seasonal', best_months: '', description: '' });
      showToast('Crop added to calendar!');
    });
  };

  // Redundant profile functions removed. Managed in AdminProfile.ts

  // ─── SelectPicker wrapper ──────────────────────────────────────────────────
  interface SelectPickerProps { value: string; onChange: (val: any) => void; options: { label: string; value: string; }[]; style?: any; }
  const SelectPicker: React.FC<SelectPickerProps> = ({ value, onChange, options, style }) => (
    <View style={[styles.pickerWrapper, style]}>
      <Picker 
        selectedValue={value} 
        onValueChange={onChange} 
        style={styles.picker}
        dropdownIconColor={COLORS.accent}
      >
        {options.map(o => (
          <Picker.Item key={o.value} label={o.label} value={o.value} style={{ fontSize: 14 }} />
        ))}
      </Picker>
    </View>
  );

  // ─── TAB CONTENT ───────────────────────────────────────────────────────────

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>System Overview</SectionTitle>
      <View style={styles.statsGrid}>
        <StatCard label="Total Users" value={users.length} icon={Users} iconBg="#eff6ff" iconColor="#3b82f6" onPress={() => setActiveTab('users')} />
        <StatCard label="Store Inventory" value={products.length} icon={Package} iconBg="#f0fdf4" iconColor="#10b981" onPress={() => setActiveTab('inventory')} />
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} iconBg="#fffbeb" iconColor="#f59e0b" onPress={() => setActiveTab('orders')} />
        <StatCard label="Revenue" value={`Rs ${stats.totalEarnings.toLocaleString()}`} icon={TrendingUp} iconBg="#faf5ff" iconColor="#8b5cf6" onPress={() => {}} />
        <StatCard label="Delivery Vans" value={vehicles.length} icon={Truck} iconBg="#fef2f2" iconColor="#ef4444" onPress={() => setActiveTab('logistics')} />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Critical Alerts</Text>
      <ListCard style={{ borderLeftWidth: 4, borderLeftColor: '#f59e0b' }}>
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{users.filter(u => !u.is_approved).length} Pending Approvals</Text>
          <Text style={styles.listSubtitle}>New Farmers/Experts awaiting review</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </ListCard>
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>Users & Approvals</SectionTitle>
      {users.length === 0 ? <EmptyState message="No users in registry" /> :
        users.map(u => (
          <ListCard key={u.id}>
            <View style={styles.listInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.listTitle}>{u.full_name}</Text>
                <StatusBadge label={u.is_approved ? 'Approved' : 'Pending'} approved={u.is_approved} />
              </View>
              <Text style={styles.listSubtitle}>{u.role} • {u.email}</Text>
            </View>
            <View style={styles.btnGroup}>
              {!u.is_approved && (
                <TouchableOpacity style={[styles.btnIcon, { backgroundColor: '#dcfce7' }]} onPress={() => approveUser(u.id)}>
                  <CheckCircle size={18} color="#16a34a" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.btnIcon, { backgroundColor: '#fee2e2' }]} onPress={() => deleteUser(u.id)}>
                <UserX size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </ListCard>
        ))
      }
    </ScrollView>
  );

  const renderInventory = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>Global Inventory</SectionTitle>
      {products.length === 0 ? <EmptyState message="Store is empty" /> :
        products.map(p => (
          <ListCard key={p.id}>
            <View style={[styles.listInfo, { maxWidth: '80%' }]}>
              <Text style={styles.listTitle}>{p.name}</Text>
              <Text style={styles.listSubtitle}>Rs {p.price} • Stock: {p.quantity} • {p.category}</Text>
              <Text style={[styles.listSubtitle, { fontSize: 10, color: '#94a3b8' }]}>
                Farmer: {p.farmer_name || p.farmer_id}
              </Text>
            </View>
            <TouchableOpacity style={[styles.btnIcon, { backgroundColor: '#fee2e2' }]} onPress={() => deleteProduct(p.id)}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </ListCard>
        ))
      }
    </ScrollView>
  );

  const renderOrders = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>All System Orders</SectionTitle>
      {orders.length === 0 ? <EmptyState message="No orders yet" /> :
        orders.map(o => (
          <View key={o.id} style={[styles.listCard, { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{o.order_number}</Text>
                <Text style={styles.listSubtitle}>Buyer: {o.buyer_name || o.buyer_email}</Text>
                <Text style={styles.listSubtitle}>Total: Rs {o.total_amount}</Text>
              </View>
              <SelectPicker
                value={o.status}
                onChange={(val) => updateOrderStatus(o.id, val)}
                style={{ minWidth: 140 }}
                options={[
                  { label: 'Order Placed', value: 'Order Placed' },
                  { label: 'Packing', value: 'Packing' },
                  { label: 'Shipped', value: 'Shipped' },
                  { label: 'Delivered', value: 'Delivered' },
                ]}
              />
            </View>

            {/* Vehicle Assignment */}
            <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, marginTop: 4 }}>
              {o.vehicle_id ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Truck size={14} color="#10b981" />
                  <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '600' }}>
                    Assigned: {o.plate_number} ({o.vehicle_type})
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Truck size={14} color="#64748b" />
                  <SelectPicker
                    value=""
                    onChange={(val) => assignVehicleToOrder(o.id, val)}
                    style={{ flex: 1 }}
                    options={[
                      { label: 'Assign Delivery Van...', value: '' },
                      ...vehicles.filter(v => v.status === 'Available').map(v => ({
                        label: `${v.plate_number} - ${v.vehicle_type}`,
                        value: String(v.id),
                      })),
                      ...(vehicles.filter(v => v.status === 'Available').length === 0
                        ? [{ label: 'No Vans Available', value: '' }] : []),
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        ))
      }
    </ScrollView>
  );

  const renderLogistics = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>Delivery Fleet</SectionTitle>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Register New Van</Text>
        <TextInput
          style={styles.input}
          placeholder="Plate Number (e.g. BA-1234)"
          value={newVehicle.plate_number}
          onChangeText={t => setNewVehicle({ ...newVehicle, plate_number: t })}
          placeholderTextColor="#94a3b8"
        />
        <SelectPicker
          value={newVehicle.vehicle_type}
          onChange={val => setNewVehicle({ ...newVehicle, vehicle_type: val })}
          style={{ width: '100%' }}
          options={[
            { label: 'Pickup Van', value: 'Pickup Van' },
            { label: 'Mini Truck', value: 'Mini Truck' },
            { label: 'Cooling Truck', value: 'Cooling Truck' },
            { label: 'Tractor', value: 'Tractor' },
          ]}
        />
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.info }]} onPress={handleVehicleSubmit}>
          <Text style={styles.submitBtnText}>Add to Fleet</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? <EmptyState message="No vehicles in fleet" /> :
        vehicles.map(v => (
          <ListCard key={v.id}>
            <View style={styles.listInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.listTitle}>{v.plate_number}</Text>
                <StatusBadge label={v.status} approved={v.status === 'Available'} />
              </View>
              <Text style={styles.listSubtitle}>{v.vehicle_type}</Text>
            </View>
            <TouchableOpacity style={[styles.btnIcon, { backgroundColor: '#fee2e2' }]} onPress={() => deleteVehicle(v.id)}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </ListCard>
        ))
      }
    </ScrollView>
  );

  const renderCollabs = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>Partnerships</SectionTitle>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Partner</Text>
        <TextInput style={styles.input} placeholder="Partner Name" value={newCollab.name}
          onChangeText={t => setNewCollab({ ...newCollab, name: t })} placeholderTextColor="#94a3b8" />
        <SelectPicker
          value={newCollab.type}
          onChange={val => setNewCollab({ ...newCollab, type: val })}
          style={{ width: '100%' }}
          options={[
            { label: 'Hotel', value: 'Hotel' },
            { label: 'Restaurant', value: 'Restaurant' },
            { label: 'Other', value: 'Other' },
          ]}
        />
        <TextInput style={styles.input} placeholder="Location" value={newCollab.location}
          onChangeText={t => setNewCollab({ ...newCollab, location: t })} placeholderTextColor="#94a3b8" />
        <TextInput style={styles.input} placeholder="Contact Number" value={newCollab.contact}
          onChangeText={t => setNewCollab({ ...newCollab, contact: t })} placeholderTextColor="#94a3b8" keyboardType="phone-pad" />
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description" value={newCollab.description}
          onChangeText={t => setNewCollab({ ...newCollab, description: t })} placeholderTextColor="#94a3b8" multiline />
          
        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickCollabImage}>
          {newCollab.image ? (
            <Image source={{ uri: newCollab.image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={24} color="#94a3b8" />
              <Text style={styles.imagePlaceholderText}>Upload Partner Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.success }]} onPress={handleCollabSubmit}>
          <Text style={styles.submitBtnText}>Add Partner</Text>
        </TouchableOpacity>
      </View>

      {collabs.map(c => (
        <View key={c.id} style={styles.collabListItem}>
          <View style={styles.collabListMain}>
            <Image 
              source={{ uri: c.image_url ? `${UPLOADS_URL}${c.image_url}` : 'https://images.unsplash.com/photo-1566073771259-6a8506099945' }} 
              style={styles.collabListThumb} 
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.listSubtitle}>{c.type} • {c.location}</Text>
              {c.contact ? <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.contact}</Text> : null}
            </View>
          </View>
          <TouchableOpacity style={styles.collabListAction} onPress={() => deleteCollab(c.id)}>
            <Trash2 size={16} color="#ef4444" />
            <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '700' }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderCalendar = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchAllData} />}>
      <SectionTitle>Crop Calendar</SectionTitle>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add Seasonal Guide</Text>
        <TextInput style={styles.input} placeholder="Crop (e.g. Rice)" value={newCrop.crop_name}
          onChangeText={t => setNewCrop({ ...newCrop, crop_name: t })} placeholderTextColor="#94a3b8" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SelectPicker
            value={newCrop.crop_type}
            onChange={val => setNewCrop({ ...newCrop, crop_type: val })}
            style={{ flex: 1 }}
            options={[
              { label: 'Vegetable', value: 'Vegetable' },
              { label: 'Fruit', value: 'Fruit' },
            ]}
          />
          <SelectPicker
            value={newCrop.season_type}
            onChange={val => setNewCrop({ ...newCrop, season_type: val })}
            style={{ flex: 1 }}
            options={[
              { label: 'Seasonal', value: 'Seasonal' },
              { label: 'Off-seasonal', value: 'Off-seasonal' },
            ]}
          />
        </View>
        <TextInput style={styles.input} placeholder="Months (e.g. June - Oct)" value={newCrop.best_months}
          onChangeText={t => setNewCrop({ ...newCrop, best_months: t })} placeholderTextColor="#94a3b8" />
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.success }]} onPress={handleCropSubmit}>
          <Text style={styles.submitBtnText}>Add Timeline</Text>
        </TouchableOpacity>
      </View>

      {cropCalendar.map(crop => (
        <ListCard key={crop.id}>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle}>{crop.crop_name}</Text>
            <Text style={styles.listSubtitle}>{crop.crop_type} • {crop.season_type} ({crop.best_months})</Text>
          </View>
          <TouchableOpacity style={[styles.btnIcon, { backgroundColor: '#fee2e2' }]} onPress={() => deleteCrop(crop.id)}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </ListCard>
      ))}
    </ScrollView>
  );

  const renderProfile = () => <AdminProfile />;

  const tabContent = {
    overview: renderOverview,
    users: renderUsers,
    inventory: renderInventory,
    orders: renderOrders,
    logistics: renderLogistics,
    collabs: renderCollabs,
    calendar: renderCalendar,
    profile: renderProfile,
  };

  // ─── NAV TABS ───────────────────────────────────────────────────────────────
  const navItems = [
    { key: 'overview', label: 'General', icon: Home },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'collabs', label: 'Collab', icon: Link2 },
    { key: 'logistics', label: 'Logistics', icon: Truck },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {/* Header */}
      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.header}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Shield size={24} color="#10b981" />
          <Text style={styles.headerTitle}>AgroAdmin</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAllData} disabled={isRefreshing}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw size={18} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading && !isRefreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          (tabContent as any)[activeTab] ? (tabContent as any)[activeTab]() : null
        )}
      </View>

      {/* Toast Feedback */}
      {toast.show && (
        <View style={styles.toastHost}>
          <View style={[styles.toastContainer, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#16a34a" /> : <AlertCircle size={18} color="#ef4444" />}
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setActiveTab(item.key)}
            activeOpacity={0.7}
          >
            <item.icon size={22} color={activeTab === item.key ? '#10b981' : '#94a3b8'} />
            <Text style={[styles.navLabel, activeTab === item.key && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  statIconBox: {
    alignSelf: 'flex-end',
    padding: 6,
    borderRadius: 8,
    marginTop: -28,
  },

  // List Cards
  listCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  listSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  btnIcon: {
    padding: 8,
    borderRadius: 8,
  },

  // Badge
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeApproved: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeTextApproved: { color: '#16a34a' },
  badgeTextPending: { color: '#d97706' },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  // Forms
  formCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    color: '#1e293b',
  },
  submitBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#10b981',
    fontWeight: '700',
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
  
  // Image Picker
  imagePickerBtn: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 12,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  // Custom Collab List Item
  collabListItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  collabListMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collabListThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  collabListAction: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
