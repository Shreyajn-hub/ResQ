import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmergencyService } from '@/services/emergency';
import { LocationService } from '@/services/location';
import { useEmergencyTriggers } from '@/hooks/useEmergencyTriggers';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StorageService, Contact, Settings } from '@/services/storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [userName, setUserName] = useState('Shreya');

  // Initialize hardware triggers
  useEmergencyTriggers();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh data periodically
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const s = await StorageService.getSettings();
    const c = await StorageService.getContacts();
    setSettings(s);
    setContacts(c);
  };

  const handleSOS = async (type: 'emergency' | 'unsafe' | 'location') => {
    let msg = 'EMERGENCY! I need help immediately.';
    if (type === 'unsafe') msg = "I don't feel safe, please check on me.";
    if (type === 'location') msg = "Here is my current location.";

    try {
      await EmergencyService.triggerSOS(msg);
      Alert.alert('Alert Sent', 'Your contacts have been notified.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleTracking = async () => {
    if (isTracking) {
      await LocationService.stopContinuousSharing();
      setIsTracking(false);
    } else {
      try {
        await LocationService.startContinuousSharing();
        setIsTracking(true);
        Alert.alert('Tracking Enabled', 'Live location sharing is now active.');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <ThemedText style={styles.welcomeText}>Welcome to ResQ Safety</ThemedText>
          <ThemedText style={styles.nameText}>{userName}.</ThemedText>
          <ThemedText style={styles.contextText}>Your personal security assistant is active and monitoring your safety triggers.</ThemedText>
        </View>

        {/* Manual SOS Trigger Button */}
        <View style={styles.mainActionContainer}>
          <TouchableOpacity 
            style={styles.sosCircle} 
            activeOpacity={0.8}
            onPress={() => handleSOS('emergency')}
          >
            <View style={styles.sosInnerCircle}>
              <IconSymbol name="exclamationmark.triangle.fill" size={50} color="#fff" />
              <ThemedText style={styles.sosLabel}>SOS</ThemedText>
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.sosHint}>TAP TO TRIGGER EMERGENCY ALERT</ThemedText>
        </View>

        {/* Quick Help Grid */}
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: '#FF9500' }]} 
            onPress={() => handleSOS('unsafe')}
          >
            <IconSymbol name="exclamationmark.shield.fill" size={24} color="#fff" />
            <ThemedText style={styles.gridText}>I Don't Feel Safe</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: '#007AFF' }]} 
            onPress={() => handleSOS('location')}
          >
            <IconSymbol name="paperplane.fill" size={24} color="#fff" />
            <ThemedText style={styles.gridText}>Send My Location</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Live Tracking Section */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <IconSymbol name="map.fill" size={20} color="#58A6FF" />
            <ThemedText style={styles.cardTitle}>Live Location Tracking</ThemedText>
          </View>
          <ThemedText style={styles.cardDesc}>Continuously share your location every 30 seconds with emergency contacts.</ThemedText>
          <TouchableOpacity 
            style={[styles.trackingBtn, isTracking ? styles.trackingActive : styles.trackingInactive]}
            onPress={toggleTracking}
          >
            <ThemedText style={styles.trackingBtnText}>
              {isTracking ? 'STOP LIVE TRACKING' : 'START LIVE TRACKING'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Emergency Contacts</ThemedText>
          <TouchableOpacity onPress={() => Alert.alert('Settings', 'Manage contacts in Settings tab.')}>
            <ThemedText style={styles.editBtn}>Manage</ThemedText>
          </TouchableOpacity>
        </View>
        
        {contacts.length === 0 ? (
          <ThemedText style={styles.emptyText}>No contacts added yet.</ThemedText>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactList}>
            {contacts.map(c => (
              <View key={c.id} style={styles.contactChip}>
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>{c.name[0]}</ThemedText>
                </View>
                <ThemedText numberOfLines={1} style={styles.chipName}>{c.name}</ThemedText>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Safety Status Cards */}
        <View style={styles.statusSection}>
           <View style={styles.statusBox}>
              <IconSymbol name="hand.raised.fill" size={20} color={settings?.shakeTrigger ? "#34C759" : "#8B949E"} />
              <ThemedText style={styles.statusBoxText}>Shake: {settings?.shakeTrigger ? 'ON' : 'OFF'}</ThemedText>
           </View>
           <View style={styles.statusBox}>
              <IconSymbol name="phone.fill" size={20} color={settings?.volumeTrigger ? "#34C759" : "#8B949E"} />
              <ThemedText style={styles.statusBoxText}>Volume: {settings?.volumeTrigger ? 'ON' : 'OFF'}</ThemedText>
           </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050A0F',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8B949E',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 4,
  },
  contextText: {
    fontSize: 14,
    color: '#8B949E',
    lineHeight: 20,
  },
  mainActionContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  sosCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  sosInnerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  sosLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginTop: 5,
  },
  sosHint: {
    marginTop: 20,
    fontSize: 12,
    color: '#8B949E',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 10,
  },
  gridItem: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
  },
  gridText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 24,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 20,
  },
  trackingBtn: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  trackingInactive: {
    backgroundColor: '#374151',
  },
  trackingActive: {
    backgroundColor: '#EA4335',
  },
  trackingBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  editBtn: {
    color: '#58A6FF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  contactChip: {
    width: 80,
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  avatarText: {
    color: '#58A6FF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chipName: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  statusSection: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  statusBoxText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
