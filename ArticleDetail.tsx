import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../utils/api';
import { ArrowLeft, Share2, BookOpen, Clock, User, Heart, MessageSquare } from 'lucide-react-native';
import { API_URL, UPLOADS_URL } from '../../constants/API';

export default function ArticleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = async () => {
    try {
      const data = await api.get(`/articles/${id}`);
      setArticle(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load article content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  const handleShare = async () => {
    try {
      if (!article) return;
      await Share.share({
        message: `Check out this article on AgroConnect: ${article.title}`,
        url: `https://agroconnect.com/article/${id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e7d4f" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Article not found.</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Return to Knowledge Hub</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Cover Image */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: article.image_url ? `${UPLOADS_URL}${article.image_url}` : 'https://via.placeholder.com/600x450' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay} />
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
              <Share2 size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroTitleArea}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{article.category || 'General'}</Text>
            </View>
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <User size={12} color="white" />
              </View>
              <Text style={styles.authorName}>{article.author_email || 'Expert Specialist'}</Text>
              <View style={styles.dot} />
              <Text style={styles.readTime}>5 min read</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
           <View style={styles.metaInfo}>
             <View style={styles.metaItem}>
               <Clock size={16} color="#64748b" />
               <Text style={styles.metaText}>
                 {article.created_at ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
               </Text>
             </View>
             <View style={styles.metaRight}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Heart size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <MessageSquare size={20} color="#64748b" />
                </TouchableOpacity>
             </View>
           </View>

           <Text style={styles.bodyText}>{article.content}</Text>

           <View style={styles.footerNote}>
              <BookOpen size={24} color="#e2e8f0" />
              <Text style={styles.footerNoteText}>End of Guide. More articles coming soon to your hub!</Text>
           </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  backLink: {
    marginTop: 20,
    backgroundColor: '#3a8a3a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backLinkText: {
    color: 'white',
    fontWeight: '700',
  },
  heroContainer: {
    height: 450,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitleArea: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3a8a3a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  catText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    lineHeight: 40,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e7d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  readTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  contentSection: {
    marginTop: -30,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 500,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
  },
  metaRight: {
    flexDirection: 'row',
    gap: 16,
  },
  socialBtn: {
    padding: 4,
  },
  bodyText: {
    fontSize: 17,
    color: '#1e293b',
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 60,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 16,
  },
  footerNoteText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
});
