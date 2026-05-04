import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StorageService, Contact, Settings } from '@/services/storage';

export default function SettingsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [fullName, setFullName] = useState('Shreya. JN');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedContacts = await StorageService.getContacts();
    const storedSettings = await StorageService.getSettings();
    setContacts(storedContacts);
    setSettings(storedSettings);
  };

  const handleAddContact = async () => {
    if (!newName || !newPhone) {
      Alert.alert('Error', 'Please enter both name and phone number');
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
  };

  const handleRemoveContact = async (id: string) => {
    await StorageService.removeContact(id);
    setContacts(contacts.filter(c => c.id !== id));
  };

  const toggleTrigger = async (key: keyof Settings) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    await StorageService.updateSettings(updated);
    setSettings(updated);
  };

  if (!settings) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Settings & Profile</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Profile</ThemedText>
            <View style={styles.card}>
              <ThemedText style={styles.label}>Full Name</ThemedText>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name"
                placeholderTextColor="#8B949E"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert('Saved', 'Profile name updated.')}>
                <ThemedText style={styles.primaryBtnText}>Save Name</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Emergency Contacts Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Emergency Contacts</ThemedText>
            <View style={styles.card}>
              <ThemedText style={styles.label}>Contact Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mom, Dad, Friend"
                placeholderTextColor="#8B949E"
                value={newName}
                onChangeText={setNewName}
              />
              <ThemedText style={[styles.label, { marginTop: 15 }]}>Phone Number</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., +911234567890"
                placeholderTextColor="#8B949E"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddContact}>
                <ThemedText style={styles.primaryBtnText}>Add Contact</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.sectionTitle, { marginTop: 20 }]}>Saved Contacts</ThemedText>
            {contacts.map(item => (
              <View key={item.id} style={styles.contactCard}>
                <View style={styles.contactAvatar}>
                  <IconSymbol name="person.fill" size={24} color="#58A6FF" />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactName}>{item.name}</ThemedText>
                  <ThemedText style={styles.contactPhone}>{item.phoneNumber}</ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleRemoveContact(item.id)}>
                  <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Triggers Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Triggers & Toggles</ThemedText>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Shake Detection</ThemedText>
                  <ThemedText style={styles.settingDesc}>Trigger SOS on shake</ThemedText>
                </View>
                <Switch
                  value={settings.shakeTrigger}
                  onValueChange={() => toggleTrigger('shakeTrigger')}
                  trackColor={{ true: '#34A853' }}
                />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Volume Trigger</ThemedText>
                  <ThemedText style={styles.settingDesc}>3 quick volume presses</ThemedText>
                </View>
                <Switch
                  value={settings.volumeTrigger}
                  onValueChange={() => toggleTrigger('volumeTrigger')}
                  trackColor={{ true: '#34A853' }}
                />
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58A6FF',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#161B22',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  label: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0D1117',
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  primaryBtn: {
    backgroundColor: '#58A6FF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  secondaryBtn: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9D1D9',
  },
  contactPhone: {
    fontSize: 13,
    color: '#58A6FF',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9D1D9',
  },
  settingDesc: {
    fontSize: 12,
    color: '#8B949E',
    marginTop: 2,
  },
});
