import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  Animated
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Square, 
  Trash2, 
  Plus, 
  CheckSquare, 
  Info,
  Clock,
  XCircle
} from 'lucide-react-native';

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
  seasonalBg: '#dcfce7',
  seasonalText: '#15803d',
  offSeasonalBg: '#fef3c7',
  offSeasonalText: '#b45309',
};

export default function FarmerCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'Global' | 'MyFarm'>('Global');
  const [globalCrops, setGlobalCrops] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ name: '', date: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastY = useRef(new Animated.Value(-100)).current;

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
      const cropsData = await api.get('/calendar/crops');
      setGlobalCrops(cropsData);
      
      if (user?.email) {
        const farmTasks = await api.get(`/calendar/activities/${user.email}`);
        setActivities(farmTasks);
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

  const handleAddTask = async () => {
    if (!user?.email) return showToast("Please login", "error");
    if (!newTask.name || !newTask.date) {
      return showToast("Task name and date required", "error");
    }

    try {
      const res = await api.post('/calendar/activities', {
        farmer_email: user.email,
        task_name: newTask.name,
        task_date: newTask.date,
        notes: newTask.notes
      });
      if (res.success !== false) {
        showToast("Task added! 📅");
        setNewTask({ name: '', date: '', notes: '' });
        fetchData();
      } else {
        showToast("Failed to add task.", "error");
      }
    } catch (error) {
      showToast("Cannot connect to server.", "error");
    }
  };

  const toggleTaskStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    try {
      await api.put(`/calendar/activities/${id}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: number) => {
    Alert.alert('Remove Task', 'Remove this from your calendar?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/calendar/activities/${id}`);
            showToast("Task deleted.");
            fetchData();
          } catch (error) {
            showToast("Failed to delete task.", "error");
          }
      }}
    ]);
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
          <Text style={styles.title}>Agro Calendar</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "Global" && styles.tabActive]} 
            onPress={() => setActiveTab("Global")}
          >
            <Text style={[styles.tabText, activeTab === "Global" && styles.tabTextActive]}>Crop Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "MyFarm" && styles.tabActive]} 
            onPress={() => setActiveTab("MyFarm")}
          >
            <Text style={[styles.tabText, activeTab === "MyFarm" && styles.tabTextActive]}>My Tasks</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "Global" ? (
          <View style={styles.cropList}>
            <Text style={styles.tabInfo}>Seasons and timelines for regional crops.</Text>
            { globalCrops.length === 0 && !loading && (
              <Text style={styles.emptyText}>No crop data available.</Text>
            )}
            {globalCrops.map(crop => (
              <View key={crop.id} style={styles.cropCard}>
                <View style={styles.cropTypeBadge}>
                  <Text style={styles.cropTypeText}>{crop.crop_type}</Text>
                </View>
                <Text style={styles.cropName}>{crop.crop_name}</Text>
                <View style={[styles.seasonBadge, crop.season_type === 'Seasonal' ? styles.seasonal : styles.offSeasonal]}>
                  <Text style={[styles.seasonBadgeText, crop.season_type === 'Seasonal' ? styles.seasonalText : styles.offSeasonalText]}>
                    {crop.season_type}
                  </Text>
                </View>
                <View style={styles.monthsRow}>
                  <Calendar size={14} color={COLORS.textMuted} />
                  <Text style={styles.monthsText}>{crop.best_months}</Text>
                </View>
                {crop.description && (
                  <Text style={styles.cropDesc}>{crop.description}</Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.farmSection}>
            {/* Task Form */}
            <View style={styles.taskForm}>
              <Text style={styles.formTitle}>Manage Activities</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Task Name (e.g., Watering Spinach)" 
                placeholderTextColor={COLORS.textMuted}
                value={newTask.name}
                onChangeText={(v) => setNewTask({...newTask, name: v})}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Date (e.g., 2024-03-30)" 
                placeholderTextColor={COLORS.textMuted}
                value={newTask.date}
                onChangeText={(v) => setNewTask({...newTask, date: v})}
              />
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Work notes..." 
                placeholderTextColor={COLORS.textMuted}
                multiline
                value={newTask.notes}
                onChangeText={(v) => setNewTask({...newTask, notes: v})}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddTask}>
                <Plus size={18} color="white" />
                <Text style={styles.addBtnText}>Add To Calendar</Text>
              </TouchableOpacity>
            </View>

            {/* Task List */}
            <View style={styles.taskList}>
              <Text style={styles.sectionTitle}>Farm Schedule</Text>
              {activities.length === 0 && !loading && (
                <Text style={styles.emptyText}>No tasks added yet.</Text>
              )}
              {activities.map(task => (
                <View key={task.id} style={styles.taskCard}>
                  <TouchableOpacity onPress={() => toggleTaskStatus(task.id, task.status)}>
                    {task.status === 'Completed' ? (
                      <CheckSquare size={22} color={COLORS.primary} />
                    ) : (
                      <Square size={22} color={COLORS.borderColor} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, task.status === 'Completed' && styles.taskNameDone]}>
                      {task.task_name}
                    </Text>
                    <View style={styles.metaRow}>
                      <Clock size={12} color={COLORS.textMuted} />
                      <Text style={styles.taskDate}>
                        {new Date(task.task_date).toLocaleDateString()}
                      </Text>
                    </View>
                    {task.notes && (
                      <Text style={styles.taskNotes}>{task.notes}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => deleteTask(task.id)}>
                    <Trash2 size={18} color="#f43f5e" />
                  </TouchableOpacity>
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
    marginTop: 20,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  tabTextActive: {
    color: 'white',
  },
  tabInfo: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  cropList: {
    gap: 16,
    paddingBottom: 40,
  },
  cropCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cropTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  cropTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  cropName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  seasonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  seasonal: {
    backgroundColor: COLORS.seasonalBg,
  },
  offSeasonal: {
    backgroundColor: COLORS.offSeasonalBg,
  },
  seasonBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  seasonalText: { color: COLORS.seasonalText },
  offSeasonalText: { color: COLORS.offSeasonalText },
  monthsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  monthsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  cropDesc: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 18,
  },
  farmSection: {
    paddingBottom: 40,
  },
  taskForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
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
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  addBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
  },
  taskList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  taskNameDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  taskDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  taskNotes: {
    fontSize: 12,
    color: '#777777',
    marginTop: 6,
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
