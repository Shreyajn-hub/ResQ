import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmergencyService } from '@/services/emergency';

export default function SafePlacesScreen() {
  const helplines = [
    { name: 'National Emergency', number: '112', icon: 'shield.fill', color: '#FF3B30' },
    { name: 'Police', number: '100', icon: 'person.badge.shield.checkmark.fill', color: '#007AFF' },
    { name: 'Ambulance', number: '102', icon: 'cross.case.fill', color: '#34C759' },
    { name: 'Women Helpline', number: '1091', icon: 'figure.wave', color: '#AF52DE' },
    { name: 'Fire Brigade', number: '101', icon: 'flame.fill', color: '#FF9500' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Safe Places</ThemedText>
        <ThemedText style={styles.subtitle}>Nearby help and helplines</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.mapPreview} 
          onPress={() => EmergencyService.getNearbySafePlaces()}
        >
          <View style={styles.mapOverlay}>
            <IconSymbol name="map.fill" size={40} color="#fff" />
            <ThemedText style={styles.mapText}>Find Nearby Police Stations</ThemedText>
            <ThemedText style={styles.mapSubtext}>Opens in Google Maps</ThemedText>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Emergency Helplines</ThemedText>
          <View style={styles.helplineGrid}>
            {helplines.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.helplineCard}
                onPress={() => EmergencyService.callHelpline(item.number)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <IconSymbol name={item.icon as any} size={24} color={item.color} />
                </View>
                <ThemedText style={styles.helplineName}>{item.name}</ThemedText>
                <ThemedText style={[styles.helplineNumber, { color: item.color }]}>{item.number}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tipsSection}>
          <ThemedText style={styles.sectionTitle}>Safety Tips</ThemedText>
          <View style={styles.tipCard}>
            <IconSymbol name="lightbulb.fill" size={20} color="#FFD60A" />
            <ThemedText style={styles.tipText}>Keep your phone charged and enable continuous sharing in crowded areas.</ThemedText>
          </View>
          <View style={styles.tipCard}>
            <IconSymbol name="hand.raised.fill" size={20} color="#FFD60A" />
            <ThemedText style={styles.tipText}>Shake your phone 3 times to trigger a silent SOS alert.</ThemedText>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  mapPreview: {
    height: 180,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mapOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    gap: 8,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  helplineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  helplineCard: {
    width: '48%',
    backgroundColor: 'rgba(150,150,150,0.1)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  helplineNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(150,150,150,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
