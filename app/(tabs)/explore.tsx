import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Linking,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmergencyService } from '@/services/emergency';
import * as Haptics from 'expo-haptics';

export default function SafePlacesScreen() {
  const insets = useSafeAreaInsets();
  
  const helplines = [
    { name: 'Police Emergency', desc: 'Instant police assistance', number: '100', icon: 'shield.fill', color: '#3B82F6' },
    { name: 'Women Helpline', desc: 'Support for women in distress', number: '1091', icon: 'figure.wave', color: '#D946EF' },
    { name: 'Ambulance', desc: 'Emergency medical response', number: '108', icon: 'cross.case.fill', color: '#EF4444' },
    { name: 'Fire Services', desc: 'Rapid fire emergency response', number: '101', icon: 'flame.fill', color: '#F59E0B' },
  ];

  const handleCall = (number: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    EmergencyService.callHelpline(number);
  };

  const openSafePlacesMap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    EmergencyService.getNearbySafePlaces();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#020617', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Safe Haven</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Emergency network and resources</ThemedText>
        </View>

        {/* Interactive Map Card */}
        <TouchableOpacity 
          style={styles.mapCard} 
          activeOpacity={0.8}
          onPress={openSafePlacesMap}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.mapIconBg}
          >
            <IconSymbol name="map.fill" size={30} color="#fff" />
          </LinearGradient>
          <View style={styles.mapContent}>
            <ThemedText style={styles.mapTitle}>Find Safe Places</ThemedText>
            <ThemedText style={styles.mapDesc}>Locate nearest police stations and hospitals instantly</ThemedText>
          </View>
          <View style={styles.chevronBg}>
            <IconSymbol name="chevron.right" size={18} color="#3B82F6" />
          </View>
        </TouchableOpacity>

        <ThemedText style={styles.sectionTitle}>Emergency Hotlines</ThemedText>
        
        <View style={styles.helplineGrid}>
          {helplines.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.helplineCard}
              onPress={() => handleCall(item.number)}
              activeOpacity={0.7}
            >
              <View style={[styles.helplineIcon, { backgroundColor: item.color + '20' }]}>
                <IconSymbol name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.helplineInfo}>
                <ThemedText style={styles.helplineName}>{item.name}</ThemedText>
                <ThemedText style={styles.helplineNumber}>{item.number}</ThemedText>
              </View>
              <LinearGradient
                colors={[item.color, item.color + 'CC']}
                style={styles.callBtn}
              >
                <IconSymbol name="phone.fill" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Guide */}
        <View style={styles.guideContainer}>
          <View style={styles.guideHeaderWrapper}>
            <IconSymbol name="info.circle.fill" size={20} color="#3B82F6" />
            <ThemedText style={styles.guideHeader}>Proactive Safety</ThemedText>
          </View>
          <View style={styles.guideList}>
            {[
              "Keep your live tracking ON during night travel.",
              "Vigorous shake (3 times) triggers a silent alert.",
              "Ensure guardians are updated with latest phone numbers."
            ].map((text, i) => (
              <View key={i} style={styles.guideItem}>
                <View style={styles.guideIndicator} />
                <ThemedText style={styles.guideText}>{text}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
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
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 35,
    elevation: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  mapIconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  mapDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  chevronBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  helplineGrid: {
    gap: 12,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  helplineIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineInfo: {
    flex: 1,
    marginLeft: 16,
  },
  helplineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  helplineNumber: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '800',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideContainer: {
    marginTop: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  guideHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  guideHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  guideList: {
    gap: 16,
  },
  guideItem: {
    flexDirection: 'row',
    gap: 12,
  },
  guideIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 8,
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    fontWeight: '500',
  },
});
