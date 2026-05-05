import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmergencyService } from '@/services/emergency';
import { LocationService } from '@/services/location';
import { useEmergencyTriggers } from '@/hooks/useEmergencyTriggers';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StorageService, Contact, Settings } from '@/services/storage';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isTracking, setIsTracking] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [userName, setUserName] = useState('Shreya');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Initialize hardware triggers
  useEmergencyTriggers();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);

    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // SOS pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const s = await StorageService.getSettings();
    const c = await StorageService.getContacts();
    setSettings(s);
    setContacts(c);
  };

  const handleSOS = async (type: 'emergency' | 'unsafe' | 'location') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    let msg = 'EMERGENCY! I need help immediately.';
    if (type === 'unsafe') msg = "I don't feel safe, please check on me.";
    if (type === 'location') msg = "Here is my current location.";

    try {
      await EmergencyService.triggerSOS(msg);
      Alert.alert('ResQ Alert', 'Your emergency message and location have been sent.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleTracking = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isTracking) {
      await LocationService.stopContinuousSharing();
      setIsTracking(false);
      Alert.alert('Tracking Stopped', 'Live location sharing is now offline.');
    } else {
      try {
        await LocationService.startContinuousSharing();
        setIsTracking(true);
        Alert.alert('Live Tracking Active', 'Your trusted contacts can now see your location in real-time.');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#020617', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.ScrollView 
        style={{ opacity: fadeAnim }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.welcomeText}>PROTECTION ACTIVE</ThemedText>
            <ThemedText style={styles.nameText}>Hello, {userName}</ThemedText>
          </View>
          <TouchableOpacity style={styles.profileBadge} activeOpacity={0.8}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.profileBadgeGradient}
            >
              <ThemedText style={styles.profileInitial}>{userName[0]}</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* SOS Central Hub */}
        <View style={styles.sosContainer}>
          <Animated.View style={[styles.sosOuterRipple, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.sosInnerRipple, { transform: [{ scale: pulseAnim }] }]} />
          
          <TouchableOpacity 
            style={styles.sosButton}
            activeOpacity={0.85}
            onPress={() => handleSOS('emergency')}
            onLongPress={() => handleSOS('emergency')}
          >
            <LinearGradient
              colors={['#EF4444', '#B91C1C']}
              style={styles.sosGradient}
            >
              <IconSymbol name="exclamationmark.shield.fill" size={70} color="#fff" />
              <ThemedText style={styles.sosText}>SOS</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          <ThemedText style={styles.sosHint}>TAP OR HOLD IN DANGER</ThemedText>
        </View>

        {/* Rapid Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}
            onPress={() => handleSOS('unsafe')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <IconSymbol name="eye.fill" size={22} color="#F59E0B" />
            </View>
            <ThemedText style={styles.actionTitle}>I'm Unsafe</ThemedText>
            <ThemedText style={styles.actionDesc}>Silent Alert</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}
            onPress={() => handleSOS('location')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <IconSymbol name="location.fill" size={22} color="#10B981" />
            </View>
            <ThemedText style={styles.actionTitle}>Share Spot</ThemedText>
            <ThemedText style={styles.actionDesc}>One-tap Link</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: isTracking ? '#EF4444' : '#6366F1', borderLeftWidth: 4 }]}
            onPress={toggleTracking}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: isTracking ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
              <IconSymbol name={isTracking ? "stop.circle.fill" : "play.circle.fill"} size={22} color={isTracking ? '#EF4444' : '#6366F1'} />
            </View>
            <ThemedText style={styles.actionTitle}>{isTracking ? 'Stop Live' : 'Live Track'}</ThemedText>
            <ThemedText style={styles.actionDesc}>{isTracking ? 'Active' : 'Offline'}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Status Monitoring */}
        <View style={styles.statusSection}>
          <ThemedText style={styles.sectionTitle}>System Status</ThemedText>
          <View style={styles.statusGrid}>
            <View style={styles.statusBox}>
              <View style={[styles.statusIndicator, { backgroundColor: settings?.shakeTrigger ? '#10B981' : '#475569' }]} />
              <ThemedText style={styles.statusLabel}>Shake Detection</ThemedText>
              <ThemedText style={styles.statusValue}>{settings?.shakeTrigger ? 'ACTIVE' : 'OFF'}</ThemedText>
            </View>
            <View style={styles.statusBox}>
              <View style={[styles.statusIndicator, { backgroundColor: settings?.volumeTrigger ? '#10B981' : '#475569' }]} />
              <ThemedText style={styles.statusLabel}>Volume Trigger</ThemedText>
              <ThemedText style={styles.statusValue}>{settings?.volumeTrigger ? 'ACTIVE' : 'OFF'}</ThemedText>
            </View>
          </View>
        </View>

        {/* Trusted Contacts */}
        <View style={styles.contactsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trusted Guardians</ThemedText>
            <TouchableOpacity onPress={loadData}>
              <IconSymbol name="arrow.clockwise" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          {contacts.length === 0 ? (
            <TouchableOpacity style={styles.addContactPlaceholder} activeOpacity={0.6}>
              <IconSymbol name="person.badge.plus" size={32} color="#334155" />
              <ThemedText style={styles.placeholderText}>No guardians added yet</ThemedText>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactScroll}>
              {contacts.map(c => (
                <View key={c.id} style={styles.contactItem}>
                  <LinearGradient
                    colors={['#1E293B', '#0F172A']}
                    style={styles.contactAvatar}
                  >
                    <ThemedText style={styles.avatarLetter}>{c.name[0]}</ThemedText>
                    <View style={styles.onlineDot} />
                  </LinearGradient>
                  <ThemedText numberOfLines={1} style={styles.contactNameText}>{c.name}</ThemedText>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 2,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  profileBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileBadgeGradient: {
    flex: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sosContainer: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  sosButton: {
    width: 210,
    height: 210,
    borderRadius: 105,
    elevation: 25,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    zIndex: 10,
  },
  sosGradient: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sosText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginTop: -5,
  },
  sosOuterRipple: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  sosInnerRipple: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  sosHint: {
    marginTop: 35,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  statusSection: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 18,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  statusIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  contactsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactScroll: {
    paddingRight: 20,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 75,
  },
  contactAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 10,
    position: 'relative',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  contactNameText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textAlign: 'center',
  },
  addContactPlaceholder: {
    backgroundColor: '#0F172A',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    gap: 12,
  },
  placeholderText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
