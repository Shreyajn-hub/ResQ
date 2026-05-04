import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Settings {
  shakeTrigger: boolean;
  volumeTrigger: boolean;
  voiceTrigger: boolean;
  locationSharingInterval: number; // in seconds
  language: 'en' | 'hi';
}

const CONTACTS_KEY = '@resq_contacts';
const SETTINGS_KEY = '@resq_settings';

const DEFAULT_SETTINGS: Settings = {
  shakeTrigger: true,
  volumeTrigger: true,
  voiceTrigger: false,
  locationSharingInterval: 30,
  language: 'en',
};

export const StorageService = {
  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    try {
      const data = await AsyncStorage.getItem(CONTACTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error fetching contacts', e);
      return [];
    }
  },

  saveContacts: async (contacts: Contact[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Error saving contacts', e);
    }
  },

  addContact: async (contact: Contact): Promise<void> => {
    const contacts = await StorageService.getContacts();
    await StorageService.saveContacts([...contacts, contact]);
  },

  removeContact: async (id: string): Promise<void> => {
    const contacts = await StorageService.getContacts();
    await StorageService.saveContacts(contacts.filter(c => c.id !== id));
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error fetching settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: Settings): Promise<void> => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  updateSettings: async (updates: Partial<Settings>): Promise<void> => {
    const current = await StorageService.getSettings();
    await StorageService.saveSettings({ ...current, ...updates });
  },
};
