import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { StorageService } from './storage';
import { Platform, NativeModules, PermissionsAndroid } from 'react-native';

const { DirectSms } = NativeModules;

export const EmergencyService = {
  triggerSOS: async (customMessage?: string) => {
    try {
      const contacts = await StorageService.getContacts();
      if (contacts.length === 0) {
        throw new Error('Please add emergency contacts in Settings first.');
      }

      // Get current location
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locationMessage = '';
      
      if (isLocationEnabled && status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = location.coords;
        locationMessage = `\nLive Location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        locationMessage = '\n(Location services disabled)';
      }

      const baseMessage = customMessage || 'EMERGENCY! I need help immediately.';
      const finalMessage = `${baseMessage} This is an automated SOS from ResQ.${locationMessage}`;
      const phoneNumbers = contacts.map(c => c.phoneNumber);

      // Automatic SMS logic for Android
      if (Platform.OS === 'android') {
        if (!DirectSms) {
          console.log('DirectSms module NOT found. If you are using Expo Go, this is normal. Automatic background SMS requires a production APK.');
        } else {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.SEND_SMS,
              {
                title: "ResQ SMS Permission",
                message: "ResQ needs permission to send automatic SOS messages in case of emergency.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Permission granted. Sending automatic SMS...');
              for (const number of phoneNumbers) {
                DirectSms.sendDirectSms(number, finalMessage);
              }
              return 'Sent Automatically';
            } else {
              console.log('SMS Permission denied by user. Falling back to manual SMS.');
            }
          } catch (e) {
            console.error('Direct SMS failed:', e);
          }
        }
      }

      // Fallback for iOS or if DirectSms/Permission is unavailable
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(phoneNumbers, finalMessage);
        return 'Sent (Manual Approval)';
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
