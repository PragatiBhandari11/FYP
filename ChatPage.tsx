import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, Image as ImageIcon, X, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { appendImageToFormData } from '../../utils/upload';
import { API_URL, UPLOADS_URL } from '../../constants/API';

export default function ChatPage() {
  const router = useRouter();
  const { type, id } = useLocalSearchParams(); // type: 'collab' or 'user', id: email or numeric ID
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [image, setImage] = useState<any>(null);
  const [recipient, setRecipient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchRecipient = async () => {
    try {
      if (type === 'collab') {
        const data = await api.get(`/collaborations/${id}`);
        setRecipient({ name: data.name, sub: data.type });
      } else {
        const data = await api.get(`/user/${id}`);
        setRecipient({ name: data.full_name, sub: data.role });
      }
    } catch (error) {
      console.error(error);
      setRecipient({ name: id, sub: 'User' });
    }
  };

  const fetchMessages = async () => {
    if (!currentUser?.email || !id) return;
    try {
      const data = await api.get(`/chat/history/${currentUser.email}/${id}`);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipient();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [id, type, currentUser?.email]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !image) return;
    setSending(true);

    const formData = new FormData();
    formData.append('sender_email', currentUser?.email || '');
    formData.append('message_text', newMessage);
    
    if (type === 'collab') {
      formData.append('receiver_id', id as string);
    } else {
      formData.append('receiver_email', id as string);
    }

    if (image) {
      await appendImageToFormData(formData, 'image', image);
    }

    try {
      // Use direct fetch for FormData compliance
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setNewMessage('');
        setImage(null);
        fetchMessages();
      } else {
        Alert.alert('Error', 'Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network error.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{recipient?.name || '...'}</Text>
          <Text style={styles.recipientStatus}>{recipient?.sub || 'Connecting...'}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#1e7d4f" />
        ) : messages.map((msg) => {
          const isSent = msg.sender_email === currentUser?.email;
          return (
            <View key={msg.id} style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
              {msg.image_url && (
                <Image 
                  source={{ uri: msg.image_url ? `${UPLOADS_URL}${msg.image_url}` : '' }} 
                  style={styles.msgImg} 
                />
              )}
              {msg.message_text ? (
                <Text style={[styles.msgText, isSent ? styles.sentText : styles.receivedText]}>
                  {msg.message_text}
                </Text>
              ) : null}
              <Text style={[styles.msgTime, isSent ? styles.sentTime : styles.receivedTime]}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {image && (
          <View style={styles.previewArea}>
            <View style={styles.previewContainer}>
              <Image source={{ uri: image.uri }} style={styles.previewImg} />
              <TouchableOpacity style={styles.removePreview} onPress={() => setImage(null)}>
                <X size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.inputArea}>
          <TouchableOpacity onPress={pickImage} style={styles.attachBtn}>
            <ImageIcon size={24} color="#64748b" />
          </TouchableOpacity>
          <TextInput 
            style={styles.input} 
            placeholder="Type your message..." 
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend} 
            disabled={sending || (!newMessage.trim() && !image)}
            style={[styles.sendBtn, (sending || (!newMessage.trim() && !image)) && styles.sendDisabled]}
          >
            {sending ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recipientInfo: {
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  recipientStatus: {
    fontSize: 11,
    color: '#1e7d4f',
    fontWeight: '700',
  },
  chatArea: {
    flex: 1,
    padding: 16,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e7d4f',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  msgImg: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  sentText: { color: 'white' },
  receivedText: { color: '#1e293b' },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  sentTime: { color: 'rgba(255,255,255,0.7)' },
  receivedTime: { color: '#94a3b8' },
  previewArea: {
    backgroundColor: 'white',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  previewContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePreview: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    padding: 4,
    borderRadius: 50,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  attachBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e7d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
