import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { StorageService } from '../services/storage';
import { EmergencyService } from '../services/emergency';

// Dynamically import native modules to prevent crash in Expo Go
let RNShake: any;
try {
  RNShake = require('react-native-shake').default;
} catch (e) {
  console.log('RNShake not available');
}

let VolumeManager: any;
try {
  VolumeManager = require('react-native-volume-manager').VolumeManager;
} catch (e) {
  console.log('VolumeManager not available');
}

export const useEmergencyTriggers = () => {
  const pressCount = useRef<number>(0);
  const lastPressTime = useRef<number>(0);

  useEffect(() => {
    let shakeSubscription: any;
    let volumeSubscription: any;

    const setupTriggers = async () => {
      const settings = await StorageService.getSettings();

      // Shake Trigger
      if (settings.shakeTrigger && RNShake) {
        try {
          shakeSubscription = RNShake.addListener(() => {
            Alert.alert(
              'Emergency Alert',
              'Shake detected! Do you want to send an SOS?',
              [
                { text: 'No, I am safe', style: 'cancel' },
                { text: 'YES, SEND SOS', onPress: () => EmergencyService.triggerSOS(), style: 'destructive' },
              ]
            );
          });
        } catch (e) {
          console.error('Error adding shake listener:', e);
        }
      }

      // Volume Trigger
      if (settings.volumeTrigger && VolumeManager) {
        try {
          volumeSubscription = VolumeManager.addVolumeListener((result: any) => {
            const now = Date.now();
            if (now - lastPressTime.current < 2000) {
              pressCount.current += 1;
            } else {
              pressCount.current = 1;
            }
            lastPressTime.current = now;

            if (pressCount.current >= 3) {
              pressCount.current = 0;
              EmergencyService.triggerSOS().catch(err => console.log('Volume trigger error:', err));
            }
          });
        } catch (e) {
          console.error('Error adding volume listener:', e);
        }
      }
    };

    setupTriggers();

    return () => {
      shakeSubscription?.remove();
      volumeSubscription?.remove();
    };
  }, []);
};
