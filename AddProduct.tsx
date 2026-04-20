import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { API_URL } from '../../constants/API';
import { appendImageToFormData } from '../../utils/upload';
import { 
  ArrowLeft, 
  Camera, 
  Package, 
  Tag, 
  Banknote,
  Scale, 
  CheckCircle,
  XCircle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  RefreshCw,
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  primaryDark: '#14532d',
  bgOuter: '#e5f2e5',
  bgInner: '#f2fbf6',
  white: '#ffffff',
  textMain: '#111111',
  textMuted: '#6b7280',
  borderColor: '#cccccc',
  trendUp: '#16a34a',
  trendDown: '#ef4444',
  trendStable: '#f59e0b',
  marketCardBg: '#f0fdf4',
  marketCardBorder: '#86efac',
};

interface MarketPrice {
  name: string;
  category: string;
  unit: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  updatedAt?: string;
}

interface FormDataState {
  name: string;
  category: string;
  price: string;
  quantity: string;
  image: ImagePicker.ImagePickerAsset | null;
  image_url: string;
  wholesalePrice: string;
  minWholesaleQty: string;
}

export default function AddProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    category: 'Vegetable',
    price: '',
    quantity: '',
    image: null,
    image_url: '',
    wholesalePrice: '',
    minWholesaleQty: '',
  });

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [matchedPrice, setMatchedPrice] = useState<MarketPrice | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const toastY = useRef(new Animated.Value(-100)).current;
  const marketCardScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    Animated.spring(toastY, { toValue: 50, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => {
        setToast(prev => ({ ...prev, show: false }));
      });
    }, 3000);
  };

  // ─── Pulse animation for live badge ───────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ─── Fetch market prices ───────────────────────────────────────────────────
  const fetchMarketPrices = async () => {
    setLoadingMarket(true);
    setMarketError(false);
    try {
      const data = await api.get('/market-prices');
      if (Array.isArray(data) && data.length > 0) {
        setMarketPrices(data);
        const now = new Date();
        setLastFetched(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
      } else {
        setMarketError(true);
      }
    } catch {
      setMarketError(true);
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices();
    if (isEdit) fetchProductDetails();
  }, []);

  // ─── Match product name to market price ───────────────────────────────────
  useEffect(() => {
    const name = (formData.name || '').trim().toLowerCase();
    if (name.length < 2 || marketPrices.length === 0) {
      setMatchedPrice(null);
      Animated.spring(marketCardScale, { toValue: 0, useNativeDriver: true }).start();
      return;
    }

    const match = marketPrices.find(mp => {
      const mpName = mp.name.toLowerCase();
      // exact or partial match
      return mpName.includes(name) || name.includes(mpName.split(' ')[0]);
    });

    if (match) {
      setMatchedPrice(match);
      // Auto-fill price if empty
      if (!formData.price && !isEdit) {
        const cleanPrice = match.price.toString().replace(/[^\d.]/g, '');
        setFormData(prev => ({ ...prev, price: cleanPrice }));
      }

      // Auto-fill category if it's currently at default 'Vegetable'
      const fruits = ['apple', 'banana', 'orange', 'grapes', 'papaya', 'pomegranate', 'pear', 'lemon', 'watermelon', 'mango', 'pineapple'];
      const isFruit = fruits.some(f => match.name.toLowerCase().includes(f));
      
      if (isFruit && !isEdit && formData.category === 'Vegetable') {
        setFormData(prev => ({ ...prev, category: 'Fruits' }));
      }

      Animated.spring(marketCardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      setMatchedPrice(null);
      Animated.spring(marketCardScale, { toValue: 0, useNativeDriver: true }).start();
    }
  }, [formData.name, marketPrices]);

  // ─── Edit mode: load product ───────────────────────────────────────────────
  const fetchProductDetails = async () => {
    try {
      const data = await api.get(`/products/${id}`);
      setFormData({
        name: data.name || '',
        category: data.category || 'Vegetable',
        price: data.price ? data.price.toString() : '',
        quantity: data.quantity ? data.quantity.toString() : '',
        image: null,
        image_url: data.image_url || '',
        wholesalePrice: data.wholesale_price ? data.wholesale_price.toString() : '',
        minWholesaleQty: data.min_wholesale_qty ? data.min_wholesale_qty.toString() : '',
      });
    } catch {
      showToast('Failed to load product data', 'error');
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0] });
    }
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user?.email) return showToast('You must be logged in.', 'error');
    if (!formData.name || !formData.price || !formData.quantity || (!formData.image && !isEdit)) {
      return showToast('Please fill in all fields.', 'error');
    }

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('quantity', formData.quantity);
    data.append('farmerId', user.email);
    data.append('wholesalePrice', formData.wholesalePrice);
    data.append('minWholesaleQty', formData.minWholesaleQty);

    const url = isEdit ? `/products/${id}` : '/add-product';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      if (formData.image) {
        await appendImageToFormData(data, 'image', formData.image);
      } else if (isEdit) {
        data.append('image_url', formData.image_url);
      }

      const response = await fetch(`${API_URL}${url}`, {
        method,
        body: data,
        headers: { Accept: 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        showToast(isEdit ? 'Product updated successfully! ✅' : 'Product added successfully! ✅');
        if (!isEdit) {
          setFormData({ 
            name: '', 
            category: 'Vegetable', 
            price: '', 
            quantity: '', 
            image: null, 
            image_url: '',
            wholesalePrice: '',
            minWholesaleQty: ''
          });
        } else {
          setTimeout(() => router.back(), 1500);
        }
      } else {
        showToast(result.message || 'Operation failed', 'error');
      }
    } catch {
      showToast('Cannot connect to server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Trend icon ───────────────────────────────────────────────────────────
  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp size={16} color={COLORS.trendUp} />;
    if (trend === 'down') return <TrendingDown size={16} color={COLORS.trendDown} />;
    return <Minus size={16} color={COLORS.trendStable} />;
  };

  const trendColor = (trend: string) => {
    if (trend === 'up') return COLORS.trendUp;
    if (trend === 'down') return COLORS.trendDown;
    return COLORS.trendStable;
  };

  const trendLabel = (trend: string) => {
    if (trend === 'up') return 'Rising';
    if (trend === 'down') return 'Falling';
    return 'Stable';
  };

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.appContainer}
    >
      {/* Toast */}
      {toast.show && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastY }] }]}>
          <View style={[styles.toastContent, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
            {toast.type === 'success'
              ? <CheckCircle size={18} color="#16a34a" />
              : <XCircle size={18} color="#ef4444" />}
            <Text style={[styles.toastText, toast.type === 'error' ? { color: '#ef4444' } : { color: '#16a34a' }]}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {/* ── Market Price Header Banner ─────────────────────────────── */}
        <View style={styles.marketBanner}>
          <View style={styles.marketBannerLeft}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.liveDot} />
            </Animated.View>
            <Text style={styles.marketBannerTitle}>Live Market Prices</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchMarketPrices} disabled={loadingMarket}>
            {loadingMarket
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : (
                <View style={styles.refreshInner}>
                  <RefreshCw size={13} color={COLORS.primary} />
                  {lastFetched ? <Text style={styles.refreshTime}>Updated {lastFetched}</Text> : null}
                </View>
              )
            }
          </TouchableOpacity>
        </View>

        {marketError && (
          <View style={styles.marketErrorBanner}>
            <Text style={styles.marketErrorText}>⚠️ Could not load live prices. Type the product name to see suggestions.</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.title}>{isEdit ? 'Update Product' : 'Add New Product'}</Text>

          {/* Product Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(v) => setFormData({ ...formData, name: v })}
              placeholder="e.g. Tomato, Potato, Apple…"
            />
          </View>

          {/* ── Market Price Suggestion Card ─────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: marketCardScale }], overflow: 'hidden' }}>
            {matchedPrice && (
              <View style={styles.marketSuggestionCard}>
                {/* Card header */}
                <View style={styles.marketCardHeader}>
                  <View style={styles.marketCardHeaderLeft}>
                    <Zap size={14} color={COLORS.primary} />
                    <Text style={styles.marketCardHeaderText}>Kalimati Market Price</Text>
                  </View>
                  <View style={[styles.trendBadge, { backgroundColor: trendColor(matchedPrice.trend) + '20', borderColor: trendColor(matchedPrice.trend) }]}>
                    <TrendIcon trend={matchedPrice.trend} />
                    <Text style={[styles.trendBadgeText, { color: trendColor(matchedPrice.trend) }]}>
                      {trendLabel(matchedPrice.trend)}
                    </Text>
                  </View>
                </View>

                {/* Price display */}
                <View style={styles.marketPriceRow}>
                  <View>
                    <Text style={styles.marketProductName}>{matchedPrice.name}</Text>
                    <Text style={styles.marketCategory}>{matchedPrice.category}</Text>
                  </View>
                  <View style={styles.marketPriceBox}>
                    <Text style={styles.marketPriceLabel}>Rs</Text>
                    <Text style={styles.marketPriceValue}>{matchedPrice.price}</Text>
                    <Text style={styles.marketPriceUnit}>/{matchedPrice.unit}</Text>
                  </View>
                </View>

                {/* Use price button */}
                <TouchableOpacity
                  style={styles.usePriceBtn}
                  onPress={() => {
                    const cleanPrice = matchedPrice.price.toString().replace(/[^\d.]/g, '');
                    setFormData(prev => ({ ...prev, price: cleanPrice }));
                    showToast(`Market price Rs ${cleanPrice} applied! 💰`);
                  }}
                >
                  <Banknote size={16} color={COLORS.white} />
                  <Text style={styles.usePriceBtnText}>Use Market Price — Rs {matchedPrice.price}/{matchedPrice.unit}</Text>
                </TouchableOpacity>

                <Text style={styles.marketDisclaimer}>
                  💡 You can still set a custom price below. Market price is a suggestion only.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
                style={styles.picker}
              >
                <Picker.Item label="Vegetable" value="Vegetable" />
                <Picker.Item label="Fruits" value="Fruits" />
                <Picker.Item label="Dairy" value="Dairy" />
                <Picker.Item label="Plant" value="Plant" />
              </Picker>
              <View style={styles.pickerIcon}>
                <ChevronDown size={20} color={COLORS.textMuted} />
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Price (Rs per kg)</Text>
              {matchedPrice && (
                <View style={[styles.suggestedBadge, formData.price === matchedPrice.price.toString() && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                  <Text style={[styles.suggestedBadgeText, formData.price === matchedPrice.price.toString() && { color: COLORS.white }]}>
                    {formData.price === matchedPrice.price.toString() ? 'Market Rate Applied' : `Market: Rs ${matchedPrice.price}`}
                  </Text>
                </View>
              )}
            </View>
            <TextInput
              style={[styles.input, matchedPrice && formData.price === matchedPrice.price.toString() && styles.inputHighlighted]}
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(v) => setFormData({ ...formData, price: v })}
              placeholder="0.00"
            />
          </View>

          {/* Quantity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Available Quantity (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.quantity}
              onChangeText={(v) => setFormData({ ...formData, quantity: v })}
              placeholder="0"
            />
          </View>

          {/* Wholesale Pricing Section */}
          <View style={styles.wholesaleSection}>
            <Text style={styles.wholesaleTitle}>Wholesale Discount (Optional)</Text>
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Wholesale Price (Rs)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.wholesalePrice}
                  onChangeText={(v) => setFormData({ ...formData, wholesalePrice: v })}
                  placeholder="e.g. 80"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Min Qty (MOQ)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.minWholesaleQty}
                  onChangeText={(v) => setFormData({ ...formData, minWholesaleQty: v })}
                  placeholder="e.g. 50"
                />
              </View>
            </View>
            <Text style={styles.wholesaleHint}>
              Discount is applied automatically when a buyer (Restaurant/Hotel) purchases more than the MOQ.
            </Text>
          </View>

          {/* Image */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Product Image {isEdit && '(Leave blank to keep current)'}
            </Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              {formData.image ? (
                <Image source={{ uri: formData.image.uri }} style={styles.previewImg} />
              ) : formData.image_url ? (
                <Image source={{ uri: `${UPLOADS_URL}${formData.image_url}` }} style={styles.previewImg} />
              ) : (
                <View style={[styles.imagePlaceholder, styles.dashedBorder]}>
                  <Camera size={32} color={COLORS.primary} />
                  <Text style={styles.imagePlaceholderText}>Choose Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.submitBtnText}>{isEdit ? 'Update Product' : 'List Product'}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── All Market Prices Reference Table ────────────────────────── */}
        {marketPrices.length > 0 && (
          <View style={styles.allPricesSection}>
            <Text style={styles.allPricesTitle}>📊 Today's Market Prices</Text>
            <Text style={styles.allPricesSubtitle}>Kalimati Fruits & Vegetable Market</Text>
            {marketPrices.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.priceRow}
                onPress={() => {
                  const cleanPrice = item.price.toString().replace(/[^\d.]/g, '');
                  setFormData(prev => ({
                    ...prev,
                    name: item.name,
                    category: item.category,
                    price: cleanPrice,
                  }));
                  showToast(`${item.name} selected — Rs ${cleanPrice}/${item.unit}`);
                }}
              >
                <View style={styles.priceRowLeft}>
                  <Text style={styles.priceRowName}>{item.name}</Text>
                  <Text style={styles.priceRowCategory}>{item.category}</Text>
                </View>
                <View style={styles.priceRowRight}>
                  <TrendIcon trend={item.trend} />
                  <Text style={[styles.priceRowPrice, { color: trendColor(item.trend) }]}>
                    Rs {item.price}
                  </Text>
                  <Text style={styles.priceRowUnit}>/{item.unit}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bgOuter,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgOuter,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // ── Market Banner ──────────────────────────────────────────────────────────
  marketBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.marketCardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  marketBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  marketBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  refreshBtn: {
    padding: 4,
  },
  refreshInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  refreshTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  marketErrorBanner: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  marketErrorText: {
    fontSize: 12,
    color: '#92400e',
  },

  // ── Form Card ─────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: COLORS.bgInner,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  wholesaleSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  wholesaleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  wholesaleHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  suggestedBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.marketCardBorder,
  },
  suggestedBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textMain,
  },
  inputHighlighted: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    zIndex: -1,
  },
  imagePickerBtn: {
    width: '100%',
    height: 180,
    marginTop: 6,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dashedBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ── Market Suggestion Card ────────────────────────────────────────────────
  marketSuggestionCard: {
    backgroundColor: COLORS.marketCardBg,
    borderWidth: 1.5,
    borderColor: COLORS.marketCardBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  marketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  marketCardHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  marketPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  marketProductName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  marketCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  marketPriceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.marketCardBorder,
    gap: 2,
  },
  marketPriceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  marketPriceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  marketPriceUnit: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  usePriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 11,
    marginBottom: 10,
    elevation: 2,
  },
  usePriceBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  marketDisclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },

  // ── All Prices List ───────────────────────────────────────────────────────
  allPricesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.marketCardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  allPricesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  allPricesSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdf4',
  },
  priceRowLeft: {
    flex: 1,
  },
  priceRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  priceRowCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  priceRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceRowPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  priceRowUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
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
    flex: 1,
  },
});
