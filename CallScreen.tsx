import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
  ShieldCheck,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type CallStatus = 'ringing' | 'connected' | 'ended';

export default function CallScreen() {
  const router = useRouter();
  const { name, mode, id } = useLocalSearchParams<{ name: string; mode: 'audio' | 'video'; id: string }>();

  const [status, setStatus] = useState<CallStatus>('ringing');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(mode === 'video');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [permission, requestPermission] = useCameraPermissions();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Permission & Ringing Transition
  useEffect(() => {
    if (mode === 'video') {
      requestPermission();
    }

    // Auto-connect after 5 seconds
    const ringingTimeout = setTimeout(() => {
      setStatus('connected');
    }, 5000);

    return () => clearTimeout(ringingTimeout);
  }, []);

  // In-Call Timer Logic
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (status === 'ended') {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleEndCall = () => {
    setStatus('ended');
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFacing = () => {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  if (mode === 'video' && !permission) {
    return <View style={styles.darkContainer}><Text style={styles.statusText}>Requesting Camera...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* BACKGROUND LAYER */}
      {mode === 'video' && status !== 'ended' ? (
        <CameraView style={styles.fullCamera} facing={facing} />
      ) : (
        <View style={styles.audioBg}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />
          <View style={styles.avatarRings}>
            {status === 'ringing' && (
              <View style={styles.pulseRing} />
            )}
            <View style={styles.largeAvatar}>
              <User size={60} color="white" />
            </View>
          </View>
        </View>
      )}

      {/* OVERLAY UI */}
      <View style={styles.overlay}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.encryptedBadge}>
            <ShieldCheck size={14} color="#22c55e" />
            <Text style={styles.encryptedText}>End-to-End Encrypted</Text>
          </View>
        </View>

        {/* Center Info */}
        <View style={styles.callerInfo}>
          <Text style={styles.callerName}>{name || "Agro Expert"}</Text>
          <Text style={styles.statusText}>
            {status === 'ringing' ? 'Ringing...' :
              status === 'connected' ? formatTime(timer) :
                'Call Ended'}
          </Text>
        </View>

        {/* CONTROLS (Bottom) */}
        <View style={styles.controlsContainer}>
          <BlurView intensity={30} style={styles.glassControls}>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={[styles.circleBtn, isMuted && styles.activeBtn]} onPress={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.circleBtn, isSpeaker && styles.activeBtn]} onPress={() => setIsSpeaker(!isSpeaker)}>
                {isSpeaker ? <Volume2 size={24} color="white" /> : <VolumeX size={24} color="white" />}
              </TouchableOpacity>

              {mode === 'video' && (
                <TouchableOpacity style={styles.circleBtn} onPress={toggleFacing}>
                  <RefreshCw size={24} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
                <PhoneOff size={30} color="white" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>

      {/* PIP PREVIEW (Hidden in Audio mode) */}
      {mode === 'video' && status === 'connected' && (
        <View style={styles.pipContainer}>
          <View style={styles.pipInner}>
            <CameraView style={StyleSheet.absoluteFill} facing={facing === 'front' ? 'front' : 'back'} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullCamera: {
    flex: 1,
  },
  audioBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 60,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    alignItems: 'center',
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  encryptedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textShadow: '0 2 10 rgba(0,0,0,0.5)',
  },
  statusText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    fontWeight: '600',
  },
  avatarRings: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  controlsContainer: {
    paddingHorizontal: 20,
  },
  glassControls: {
    borderRadius: 40,
    overflow: 'hidden',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  circleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: '#fff',
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 10 15 -3 rgba(239, 68, 68, 0.4)',
    elevation: 8,
  },
  pipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 10,
  },
  pipInner: {
    flex: 1,
  }
});
