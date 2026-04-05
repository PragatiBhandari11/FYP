import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { ArrowLeft, Send, Image as ImageIcon, CheckCircle, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { appendImageToFormData } from '../../utils/upload';
import { API_URL, UPLOADS_URL } from '../../constants/API';

export default function ArticleForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    image: null as any,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const data = await api.get(`/articles/${id}`);
      setFormData({
        title: data.title,
        category: data.category,
        content: data.content,
        image: null,
      });
      if (data.image_url) {
        setPreview(`${API_URL.replace('/api', '')}${data.image_url}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load article.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0] });
      setPreview(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Required', 'Please fill in the title and content.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    data.append('author_email', user?.email || '');

    if (formData.image) {
      await appendImageToFormData(data, 'image', formData.image);
    }

    try {
      const endpoint = isEdit ? `/articles/${id}` : '/articles';
      const method = isEdit ? 'put' : 'post';
      
      // Note: Since we are using FormData, we might need a direct fetch or a custom api config
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: method.toUpperCase(),
        body: data,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', isEdit ? 'Article updated!' : 'Article published!');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to save article.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Article' : 'Write Article'}</Text>
        <TouchableOpacity style={styles.publishBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Article Title</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Give your article a catchy title..." 
            value={formData.title}
            onChangeText={t => setFormData({ ...formData, title: t })}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {['General', 'Crops', 'Soil Health', 'Pests'].map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catBadge, formData.category === cat && styles.catBadgeActive]}
                onPress={() => setFormData({ ...formData, category: cat })}
              >
                <Text style={[styles.catText, formData.category === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Content</Text>
          <TextInput 
            style={styles.textarea} 
            placeholder="Share your agricultural wisdom..." 
            multiline
            textAlignVertical="top"
            value={formData.content}
            onChangeText={c => setFormData({ ...formData, content: c })}
          />

          <Text style={styles.label}>Cover Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {preview ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: preview }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImg} onPress={() => {setPreview(null); setFormData({...formData, image: null});}}>
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.pickerPlaceholder}>
                <ImageIcon size={32} color="#94a3b8" />
                <Text style={styles.pickerText}>Tap to upload a professional cover photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  publishBtn: {
    backgroundColor: '#3a8a3a',
    padding: 10,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formSection: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
  },
  catBadgeActive: {
    backgroundColor: '#3a8a3a',
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  catTextActive: {
    color: 'white',
  },
  textarea: {
    fontSize: 16,
    color: '#1e293b',
    minHeight: 250,
    lineHeight: 24,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  pickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  pickerText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImg: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 50,
  },
});
