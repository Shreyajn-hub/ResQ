import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmergencyService } from '@/services/emergency';

export default function SafePlacesScreen() {
  const helplines = [
    { name: 'Police Emergency', desc: 'Dial 100 for police assistance', number: '100', icon: 'person.badge.shield.checkmark.fill', color: '#007AFF' },
    { name: 'Women Helpline', desc: 'Dedicated support for women', number: '1091', icon: 'figure.wave', color: '#AF52DE' },
    { name: 'Ambulance', desc: 'Emergency medical services', number: '108', icon: 'cross.case.fill', color: '#FF3B30' },
    { name: 'Fire Services', desc: 'Dial 101 for fire brigade', number: '101', icon: 'flame.fill', color: '#FF9500' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Emergency Directory</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quick access to helplines and safe zones</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Map Action Card */}
          <TouchableOpacity 
            style={styles.mapCard} 
            activeOpacity={0.9}
            onPress={() => EmergencyService.getNearbySafePlaces()}
          >
            <View style={styles.mapIconBg}>
              <IconSymbol name="map.fill" size={30} color="#fff" />
            </View>
            <View style={styles.mapContent}>
              <ThemedText style={styles.mapTitle}>Safe Places Map</ThemedText>
              <ThemedText style={styles.mapDesc}>Locate nearby police stations and hospitals on Google Maps</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#4B5563" />
          </TouchableOpacity>

          <ThemedText style={styles.sectionTitle}>Emergency Helplines</ThemedText>
          
          <View style={styles.helplineList}>
            {helplines.map((item, index) => (
              <View key={index} style={styles.helplineItem}>
                <View style={[styles.helplineIcon, { backgroundColor: item.color + '15' }]}>
                  <IconSymbol name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.helplineText}>
                  <ThemedText style={styles.helplineName}>{item.name}</ThemedText>
                  <ThemedText style={styles.helplineDesc}>{item.desc}</ThemedText>
                </View>
                <TouchableOpacity 
                  style={[styles.callAction, { backgroundColor: item.color }]}
                  onPress={() => EmergencyService.callHelpline(item.number)}
                >
                  <IconSymbol name="phone.fill" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.guideCard}>
            <ThemedText style={styles.guideTitle}>Safety Guide</ThemedText>
            <View style={styles.guideItem}>
               <ThemedText style={styles.guideDot}>•</ThemedText>
               <ThemedText style={styles.guideText}>Stay in well-lit areas if walking alone at night.</ThemedText>
            </View>
            <View style={styles.guideItem}>
               <ThemedText style={styles.guideDot}>•</ThemedText>
               <ThemedText style={styles.guideText}>Keep your phone battery above 20% when traveling.</ThemedText>
            </View>
            <View style={styles.guideItem}>
               <ThemedText style={styles.guideDot}>•</ThemedText>
               <ThemedText style={styles.guideText}>Double-tap the SOS button for instant silent alert.</ThemedText>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
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
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B949E',
    marginTop: 5,
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 30,
  },
  mapIconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#34A853',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContent: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  helplineList: {
    gap: 12,
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  helplineIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineText: {
    flex: 1,
    marginLeft: 15,
  },
  helplineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  helplineDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  callAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  guideCard: {
    marginTop: 40,
    backgroundColor: 'rgba(88, 166, 255, 0.05)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(88, 166, 255, 0.1)',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58A6FF',
    marginBottom: 15,
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  guideDot: {
    color: '#58A6FF',
    marginRight: 10,
    fontSize: 18,
  },
  guideText: {
    color: '#C9D1D9',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
