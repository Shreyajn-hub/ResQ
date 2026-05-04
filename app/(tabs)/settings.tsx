import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  FlatList
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
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Emergency Contacts</ThemedText>
          <View style={styles.addContactCard}>
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
              <ThemedText style={styles.addButtonText}>Add Contact</ThemedText>
            </TouchableOpacity>
          </View>

          {contacts.map(item => (
            <View key={item.id} style={styles.contactItem}>
              <View>
                <ThemedText style={styles.contactName}>{item.name}</ThemedText>
                <ThemedText style={styles.contactPhone}>{item.phoneNumber}</ThemedText>
              </View>
              <TouchableOpacity onPress={() => handleRemoveContact(item.id)}>
                <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Emergency Triggers</ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Shake Detection</ThemedText>
              <ThemedText style={styles.settingDesc}>Trigger SOS when device is shaken</ThemedText>
            </View>
            <Switch
              value={settings.shakeTrigger}
              onValueChange={() => toggleTrigger('shakeTrigger')}
              trackColor={{ true: '#FF3B30' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Volume Button Press</ThemedText>
              <ThemedText style={styles.settingDesc}>Press volume buttons 3 times quickly</ThemedText>
            </View>
            <Switch
              value={settings.volumeTrigger}
              onValueChange={() => toggleTrigger('volumeTrigger')}
              trackColor={{ true: '#FF3B30' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Voice Activation</ThemedText>
              <ThemedText style={styles.settingDesc}>Listen for emergency keywords (Beta)</ThemedText>
            </View>
            <Switch
              value={settings.voiceTrigger}
              onValueChange={() => toggleTrigger('voiceTrigger')}
              trackColor={{ true: '#FF3B30' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Language</ThemedText>
            <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Multi-language support is in development.')}>
              <ThemedText style={styles.settingValue}>{settings.language === 'en' ? 'English' : 'Hindi'}</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Tracking Interval</ThemedText>
            <ThemedText style={styles.settingValue}>{settings.locationSharingInterval}s</ThemedText>
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
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    opacity: 0.8,
  },
  addContactCard: {
    backgroundColor: 'rgba(150,150,150,0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(150,150,150,0.1)',
    padding: 12,
    borderRadius: 10,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(150,150,150,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    opacity: 0.6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
