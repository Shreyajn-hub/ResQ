import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { SOSButton } from '@/components/SOSButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmergencyService } from '@/services/emergency';
import { LocationService } from '@/services/location';
import { useEmergencyTriggers } from '@/hooks/use-emergencyTriggers';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StorageService } from '@/services/storage';

export default function HomeScreen() {
  const [isUnsafe, setIsUnsafe] = useState(false);
  const [contactCount, setContactCount] = useState(0);

  // Initialize hardware triggers (Shake, Volume)
  useEmergencyTriggers();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const contacts = await StorageService.getContacts();
    setContactCount(contacts.length);
  };

  const handleSOS = async () => {
    try {
      await EmergencyService.triggerSOS();
      Alert.alert('SOS Sent', 'Your emergency contacts have been notified with your location.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleSafetyStatus = async () => {
    const nextStatus = !isUnsafe;
    setIsUnsafe(nextStatus);
    
    if (nextStatus) {
      try {
        await LocationService.startContinuousSharing();
        Alert.alert('Tracking Enabled', 'Your location is now being shared every 30 seconds.');
      } catch (error: any) {
        setIsUnsafe(false);
        Alert.alert('Permission Denied', error.message);
      }
    } else {
      await LocationService.stopContinuousSharing();
      Alert.alert('Tracking Disabled', 'Continuous location sharing has stopped.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>ResQ</ThemedText>
        <ThemedText style={styles.subtitle}>Personal Safety Assistant</ThemedText>
      </View>

      <View style={styles.statusSection}>
        <View style={[styles.statusCard, isUnsafe ? styles.unsafeCard : styles.safeCard]}>
          <IconSymbol 
            name={isUnsafe ? "exclamationmark.shield.fill" : "checkmark.shield.fill"} 
            size={32} 
            color="#fff" 
          />
          <View style={styles.statusTextContainer}>
            <ThemedText style={styles.statusLabel}>Current Status</ThemedText>
            <ThemedText style={styles.statusValue}>
              {isUnsafe ? "UNSAFE - Sharing Location" : "SAFE - Monitoring Triggers"}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={toggleSafetyStatus} style={styles.toggleBtn}>
            <ThemedText style={styles.toggleBtnText}>{isUnsafe ? "I'm Safe" : "I'm Unsafe"}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainAction}>
        <SOSButton onPress={handleSOS} />
        <ThemedText style={styles.hint}>One-tap to alert emergency contacts</ThemedText>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => EmergencyService.callHelpline('112')}>
          <IconSymbol name="phone.fill" size={24} color="#FF3B30" />
          <ThemedText style={styles.actionLabel}>Police (112)</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => EmergencyService.getNearbySafePlaces()}>
          <IconSymbol name="map.fill" size={24} color="#34C759" />
          <ThemedText style={styles.actionLabel}>Safe Places</ThemedText>
        </TouchableOpacity>
      </View>

      {contactCount === 0 && (
        <View style={styles.warningBanner}>
          <IconSymbol name="exclamationmark.circle.fill" size={20} color="#FF9500" />
          <ThemedText style={styles.warningText}>No emergency contacts added! Go to Settings.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  statusSection: {
    marginBottom: 40,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  safeCard: {
    backgroundColor: '#34C759',
  },
  unsafeCard: {
    backgroundColor: '#FF3B30',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  statusValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toggleBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 20,
    fontSize: 14,
    opacity: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(150,150,150,0.1)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  warningText: {
    color: '#FF9500',
    fontSize: 13,
    fontWeight: '600',
  },
});
