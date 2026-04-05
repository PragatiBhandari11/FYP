// import React, { useState, useEffect, useCallback } from 'react';
// import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
// import { useRouter, useFocusEffect } from 'expo-router';
// import { api } from '../../utils/api';
// import { ArrowLeft, User, Clock, CheckCircle, Send, AlertTriangle, ChevronRight } from 'lucide-react-native';

// export default function ExpertDiseaseReports() {
//   const router = useRouter();
//   const [reports, setReports] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [responses, setResponses] = useState<{ [key: number]: string }>({});

//   const fetchReports = async () => {
//     try {
//       const data = await api.get('/disease/reports');
//       setReports(data);
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Failed to load disease reports.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchReports();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchReports();
//   };

//   const handleResponseSubmit = async (id: number) => {
//     const expertText = responses[id];
//     if (!expertText?.trim()) {
//       Alert.alert('Required', 'Please provide your professional advice first.');
//       return;
//     }

//     try {
//       const res = await api.put(`/disease/respond/${id}`, { response: expertText });
//       if (res.success !== false) {
//         Alert.alert('Success', 'Advice sent to farmer! ✅');
//         fetchReports(); // Refresh data
//         setResponses({ ...responses, [id]: '' }); // Clear input
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Failed to send advice.');
//     }
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#3a8a3a" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <ArrowLeft size={24} color="#1e293b" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Disease Reports</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView 
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         {reports.length === 0 ? (
//           <View style={styles.emptyState}>
//             <CheckCircle size={64} color="#e2e8f0" />
//             <Text style={styles.emptyTitle}>Inbox Clear</Text>
//             <Text style={styles.emptySubtitle}>No pending disease reports to review at the moment.</Text>
//           </View>
//         ) : (
//           reports.map(report => (
//             <View key={report.id} style={styles.reportCard}>
//               <View style={styles.imageContainer}>
//                 <Image 
//                   source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${report.image_url}` }} 
//                   style={styles.reportImg} 
//                 />
//                 <View style={[styles.statusBadge, report.status === 'Pending' ? styles.statusWarn : styles.statusSuccess]}>
//                   <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardBody}>
//                 <View style={styles.authorRow}>
//                   <View style={styles.authorLeft}>
//                     <View style={styles.avatarMini}>
//                       <User size={12} color="white" />
//                     </View>
//                     <Text style={styles.authorName}>{report.farmer_name || 'Farmer'}</Text>
//                   </View>
//                   <View style={styles.timeRow}>
//                     <Clock size={12} color="#94a3b8" />
//                     <Text style={styles.timeText}>{new Date(report.created_at).toLocaleDateString()}</Text>
//                   </View>
//                 </View>

//                 <Text style={styles.description}>{report.description}</Text>

//                 {report.status === 'Pending' ? (
//                   <View style={styles.responseForm}>
//                     <TextInput 
//                       style={styles.textarea} 
//                       placeholder="Provide diagnostic advice or a cure..." 
//                       multiline
//                       textAlignVertical="top"
//                       value={responses[report.id] || ''}
//                       onChangeText={t => setResponses({ ...responses, [report.id]: t })}
//                     />
//                     <TouchableOpacity style={styles.submitBtn} onPress={() => handleResponseSubmit(report.id)}>
//                       <Send size={18} color="white" />
//                       <Text style={styles.submitBtnText}>Submit Advice</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ) : (
//                   <View style={styles.adviceCard}>
//                     <View style={styles.adviceHeader}>
//                       <AlertTriangle size={14} color="#3a8a3a" />
//                       <Text style={styles.adviceTitle}>Your Advice</Text>
//                     </View>
//                     <Text style={styles.adviceText}>{report.expert_response}</Text>
//                   </View>
//                 )}
//               </View>
//             </View>
//           ))
//         )}
//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 24,
//     paddingTop: 50,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f5f9',
//   },
//   backBtn: {},
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#1e293b',
//   },
//   scrollContent: {
//     padding: 16,
//     backgroundColor: '#f8fafc',
//   },
//   emptyState: {
//     alignItems: 'center',
//     marginTop: 100,
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#475569',
//     marginTop: 20,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#94a3b8',
//     textAlign: 'center',
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   reportCard: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     marginBottom: 20,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#f1f5f9',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//     elevation: 2,
//   },
//   imageContainer: {
//     position: 'relative',
//     height: 220,
//   },
//   reportImg: {
//     width: '100%',
//     height: '100%',
//   },
//   statusBadge: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   statusWarn: { backgroundColor: 'rgba(255, 193, 7, 0.9)' },
//   statusSuccess: { backgroundColor: 'rgba(40, 167, 69, 0.9)' },
//   statusText: { fontSize: 10, fontWeight: '900', color: 'white' },
//   cardBody: {
//     padding: 20,
//   },
//   authorRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   authorLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   avatarMini: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#3a8a3a',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   authorName: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#94a3b8',
//     fontWeight: '600',
//   },
//   description: {
//     fontSize: 15,
//     color: '#475569',
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   responseForm: {
//     gap: 12,
//   },
//   textarea: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 16,
//     padding: 16,
//     fontSize: 14,
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#f1f5f9',
//     color: '#1e293b',
//   },
//   submitBtn: {
//     backgroundColor: '#3a8a3a',
//     flexDirection: 'row',
//     height: 50,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   submitBtnText: {
//     color: 'white',
//     fontWeight: '700',
//     fontSize: 15,
//   },
//   adviceCard: {
//     backgroundColor: '#f0fdf4',
//     padding: 16,
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#3a8a3a',
//   },
//   adviceHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 6,
//   },
//   adviceTitle: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#166534',
//     textTransform: 'uppercase',
//   },
//   adviceText: {
//     fontSize: 14,
//     color: '#15803d',
//     lineHeight: 20,
//     fontWeight: '600',
//   },
// });
