import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Dimensions,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Thermometer 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WeatherDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = async () => {
    try {
      const city = user?.city || 'Kathmandu';
      const data = await api.get(`/weather/${city}`);
      setWeather(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [user?.city]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  const getWeatherIcon = (condition: string, size = 24, color = "white") => {
    const cond = condition?.toLowerCase();
    if (cond?.includes('sun') || cond?.includes('clear')) return <Sun size={size} color={color} />;
    if (cond?.includes('rain')) return <CloudRain size={size} color={color} />;
    if (cond?.includes('storm') || cond?.includes('light')) return <CloudLightning size={size} color={color} />;
    return <Cloud size={size} color={color} />;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SkyWatch</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
        showsVerticalScrollIndicator={false}
      >
        {weather && (
          <View style={styles.mainInfo}>
            <Text style={styles.cityText}>{weather.city}</Text>
            <Text style={styles.dateText}>Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
            
            <View style={styles.tempRow}>
              <Text style={styles.tempText}>{weather.temp}°</Text>
              {getWeatherIcon(weather.condition, 80)}
            </View>
            <Text style={styles.conditionText}>{weather.condition}</Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Droplets size={22} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statVal}>{weather.humidity}%</Text>
                <Text style={styles.statLabel}>Humidity</Text>
              </View>
              <View style={styles.statCard}>
                <Wind size={22} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statVal}>{weather.windSpeed} km/h</Text>
                <Text style={styles.statLabel}>Wind Speed</Text>
              </View>
              <View style={styles.statCard}>
                <Gauge size={22} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statVal}>{weather.pressure} hPa</Text>
                <Text style={styles.statLabel}>Pressure</Text>
              </View>
              <View style={styles.statCard}>
                <Eye size={22} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statVal}>{weather.visibility} km</Text>
                <Text style={styles.statLabel}>Visibility</Text>
              </View>
            </View>

            {/* Five Day Forecast */}
            <View style={styles.forecastSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>5-Day Forecast</Text>
                <Thermometer size={16} color="white" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScroll}>
                {weather.forecast?.map((f: any, i: number) => (
                  <View key={i} style={styles.forecastItem}>
                    <Text style={styles.forecastDay}>{f.day}</Text>
                    {getWeatherIcon(f.condition, 28, "rgba(255,255,255,0.9)")}
                    <Text style={styles.forecastTemp}>{f.temp}°</Text>
                    <Text style={styles.forecastCond}>{f.condition}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4facfe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  backBtn: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  mainInfo: {
    alignItems: 'center',
  },
  cityText: {
    fontSize: 34,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  dateText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    marginTop: 6,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginVertical: 45,
  },
  tempText: {
    fontSize: 96,
    fontWeight: '200',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Light' : 'sans-serif-light',
  },
  conditionText: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: 45,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
    marginBottom: 45,
  },
  statCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginVertical: 10,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  forecastSection: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
  },
  forecastScroll: {
    paddingRight: 24,
    gap: 14,
  },
  forecastItem: {
    width: 110,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  forecastDay: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  forecastTemp: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  forecastCond: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    textAlign: 'center',
  },
});
