import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StorageService, Contact, Settings } from '@/services/storage';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedContacts = await StorageService.getContacts();
    const storedSettings = await StorageService.getSettings();
    setContacts(storedContacts);
    setSettings(storedSettings);
    setProfileName(storedSettings.userName);
  };

  const handleAddContact = async () => {
    if (!newName || !newPhone) {
      Alert.alert('Missing Details', 'Please enter a name and phone number.');
      return;
    }
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newName,
      phoneNumber: newPhone,
    };
    await StorageService.addContact(newContact);
    setContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRemoveContact = async (id: string) => {
    await StorageService.removeContact(id);
    setContacts(contacts.filter(c => c.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTrigger = async (key: keyof Settings) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    await StorageService.updateSettings(updated);
    setSettings(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleUpdateProfile = async () => {
    if (!settings || !profileName) return;
    await StorageService.updateSettings({ userName: profileName });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Profile Updated', 'Your name has been updated successfully.');
  };

  if (!settings) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#020617', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Configuration</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Personalize your security layers</ThemedText>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Profile Details</ThemedText>
            <View style={styles.card}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#475569"
                  value={profileName}
                  onChangeText={setProfileName}
                />
              </View>
              <TouchableOpacity 
                style={styles.addBtn} 
                onPress={handleUpdateProfile}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.addBtnGradient}
                >
                  <ThemedText style={styles.addBtnText}>Update Profile</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hardware Triggers */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Smart Triggers</ThemedText>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Shake Alert</ThemedText>
                  <ThemedText style={styles.settingDesc}>Send SOS by vigorously shaking phone</ThemedText>
                </View>
                <Switch
                  value={settings.shakeTrigger}
                  onValueChange={() => toggleTrigger('shakeTrigger')}
                  trackColor={{ true: '#3B82F6', false: '#1E293B' }}
                  thumbColor={settings.shakeTrigger ? '#fff' : '#475569'}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Volume Sequence</ThemedText>
                  <ThemedText style={styles.settingDesc}>3 rapid volume button presses</ThemedText>
                </View>
                <Switch
                  value={settings.volumeTrigger}
                  onValueChange={() => toggleTrigger('volumeTrigger')}
                  trackColor={{ true: '#3B82F6', false: '#1E293B' }}
                  thumbColor={settings.volumeTrigger ? '#fff' : '#475569'}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Fall Detection</ThemedText>
                  <ThemedText style={styles.settingDesc}>Detect sudden impact and stillness</ThemedText>
                </View>
                <Switch
                  value={settings.fallDetection}
                  onValueChange={() => toggleTrigger('fallDetection')}
                  trackColor={{ true: '#10B981', false: '#1E293B' }}
                  thumbColor={settings.fallDetection ? '#fff' : '#475569'}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Voice Command</ThemedText>
                  <ThemedText style={styles.settingDesc}>Trigger SOS via voice (Beta)</ThemedText>
                </View>
                <Switch
                  value={settings.voiceDetection}
                  onValueChange={() => toggleTrigger('voiceDetection')}
                  trackColor={{ true: '#8B5CF6', false: '#1E293B' }}
                  thumbColor={settings.voiceDetection ? '#fff' : '#475569'}
                />
              </View>
            </View>
          </View>

          {/* Guardians Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Manage Guardians</ThemedText>
            <View style={styles.card}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Guardian Name"
                  placeholderTextColor="#475569"
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="Phone Number"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                  value={newPhone}
                  onChangeText={setNewPhone}
                />
              </View>
              <TouchableOpacity 
                style={styles.addBtn} 
                onPress={handleAddContact}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.addBtnGradient}
                >
                  <ThemedText style={styles.addBtnText}>Secure New Guardian</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* List of Contacts */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Active Guardians ({contacts.length})</ThemedText>
            {contacts.length === 0 ? (
              <View style={styles.emptyCard}>
                <IconSymbol name="person.crop.circle.badge.questionmark" size={40} color="#1E293B" />
                <ThemedText style={styles.emptyText}>Add at least one trusted contact</ThemedText>
              </View>
            ) : (
              contacts.map(item => (
                <View key={item.id} style={styles.contactItem}>
                  <View style={styles.contactAvatar}>
                    <ThemedText style={styles.avatarText}>{item.name[0]}</ThemedText>
                  </View>
                  <View style={styles.contactMeta}>
                    <ThemedText style={styles.contactName}>{item.name}</ThemedText>
                    <ThemedText style={styles.contactPhone}>{item.phoneNumber}</ThemedText>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleRemoveContact(item.id)}
                    style={styles.removeBtn}
                  >
                    <IconSymbol name="xmark" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 20,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  settingDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 15,
  },
  input: {
    backgroundColor: '#020617',
    padding: 16,
    borderRadius: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
    fontWeight: '600',
  },
  addBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addBtnGradient: {
    padding: 16,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  contactItem: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
  },
  contactMeta: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  contactPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
});
