import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { StorageService } from './storage';

export const EmergencyService = {
  triggerSOS: async () => {
    try {
      const contacts = await StorageService.getContacts();
      if (contacts.length === 0) {
        throw new Error('No emergency contacts found. Please add some in settings.');
      }

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locationMessage = '';
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        locationMessage = `\nMy live location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        locationMessage = '\nLocation permission denied. I am in danger!';
      }

      const message = `EMERGENCY! I need help immediately. This is an automated SOS from ResQ.${locationMessage}`;
      const phoneNumbers = contacts.map(c => c.phoneNumber);

      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
        return result;
      } else {
        throw new Error('SMS is not available on this device.');
      }
    } catch (error) {
      console.error('SOS Trigger Error:', error);
      throw error;
    }
  },

  callHelpline: (number: string = '112') => {
    Linking.openURL(`tel:${number}`);
  },

  getNearbySafePlaces: async () => {
    // In a real app, this would call a Places API. 
    // For this version, we can use a direct Google Maps search link or a mock.
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    // Redirect to Google Maps search for nearby police stations
    const url = `https://www.google.com/maps/search/police+station/@${latitude},${longitude},15z`;
    Linking.openURL(url);
  }
};
