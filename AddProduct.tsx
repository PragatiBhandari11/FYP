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
  Dimensions
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
  ChevronDown
} from 'lucide-react-native';
import { UPLOADS_URL } from '../../constants/API';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#16a34a',
  bgOuter: '#e5f2e5',
  bgInner: '#f2fbf6',
  white: '#ffffff',
  textMain: '#111111',
  textMuted: '#6b7280',
  borderColor: '#cccccc',
};

export default function AddProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetable',
    price: '',
    quantity: '',
    image: null as any,
    image_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
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

  useEffect(() => {
    if (isEdit) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const data = await api.get(`/products/${id}`);
      setFormData({
        name: data.name,
        category: data.category,
        price: data.price.toString(),
        quantity: data.quantity.toString(),
        image: null,
        image_url: data.image_url,
      });
    } catch (error) {
      showToast("Failed to load product data", "error");
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

  const handleSubmit = async () => {
    if (!user?.email) return showToast("You must be logged in.", "error");
    if (!formData.name || !formData.price || !formData.quantity || (!formData.image && !isEdit)) {
      return showToast("Please fill in all fields.", "error");
    }

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('quantity', formData.quantity);
    data.append('farmerId', user.email);

    const url = isEdit ? `/products/${id}` : '/add-product';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      // Use appendImageToFormData helper
      if (formData.image) {
        await appendImageToFormData(data, 'image', formData.image);
      } else if (isEdit) {
        data.append('image_url', formData.image_url);
      }

      // NO Content-Type: multipart/form-data header.
      // fetch sets it automatically with the boundary when body is FormData.
      const response = await fetch(`${API_URL}${url}`, {
        method: method,
        body: data,
        headers: {
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        showToast(isEdit ? "Product updated successfully! ✅" : "Product added successfully! ✅");
        if (!isEdit) {
          setFormData({ name: '', category: 'Vegetable', price: '', quantity: '', image: null, image_url: '' });
        } else {
          setTimeout(() => router.back(), 1500);
        }
      } else {
        showToast(result.message || "Operation failed", "error");
      }
    } catch (error) {
      showToast("Cannot connect to server.", "error");
    } finally {
      setLoading(false);
    }
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
      {/* Custom Toast */}
      {toast.show && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastY }] }]}>
          <View style={[styles.toastContent, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#16a34a" /> : <XCircle size={18} color="#ef4444" />}
            <Text style={[styles.toastText, toast.type === 'error' ? { color: '#ef4444' } : { color: '#16a34a' }]}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.formCard}>
          <Text style={styles.title}>{isEdit ? "Update Product" : "Add New Product"}</Text>

          {/* Form Groups */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.name} 
              onChangeText={(v) => setFormData({...formData, name: v})}
              placeholder="e.g. Organic Spinach"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(v) => setFormData({...formData, category: v})}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price (Rs per kg)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric"
              value={formData.price} 
              onChangeText={(v) => setFormData({...formData, price: v})}
              placeholder="0.00"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Available Quantity (kg)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric"
              value={formData.quantity} 
              onChangeText={(v) => setFormData({...formData, quantity: v})}
              placeholder="0"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Product Image {isEdit && "(Leave blank to keep current)"}
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
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isEdit ? "Update Product" : "List Product"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  },
  backBtn: {
    marginBottom: 20,
  },
  backBtnText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: COLORS.bgInner,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
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
