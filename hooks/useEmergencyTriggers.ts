import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { StorageService } from '../services/storage';
import { EmergencyService } from '../services/emergency';
import RNShake from 'react-native-shake';

// Dynamically import VolumeManager to prevent crash in Expo Go
let VolumeManager: any;
try {
  VolumeManager = require('react-native-volume-manager').VolumeManager;
} catch (e) {
  console.log('VolumeManager not available in this environment');
}

export const useEmergencyTriggers = () => {
  const pressCount = useRef<number>(0);
  const lastPressTime = useRef<number>(0);
  
  // Accelerometer fallback state
  const lastUpdate = useRef<number>(0);
  const shakeCount = useRef<number>(0);
  const lastShakeTime = useRef<number>(0);

  const ACCEL_THRESHOLD = 2.5; // G-force threshold for shake
  const SHAKE_WAIT_TIME = 800; // Time between shakes in ms
  const MIN_SHAKES = 3; // Number of shakes required

  useEffect(() => {
    let accelerometerSubscription: any;
    let volumeSubscription: any;

    const setupTriggers = async () => {
      const settings = await StorageService.getSettings();
      if (!settings.shakeTrigger && !settings.volumeTrigger) return;

      // 1. Native Shake Detection (Reliable for Production)
      if (settings.shakeTrigger) {
        try {
          const shakeSub = RNShake.addListener(() => {
            console.log('Native shake detected');
            triggerEmergencyAlert('Native Shake');
          });
          
          // 2. Accelerometer Fallback (Works in Expo Go/Development)
          Accelerometer.setUpdateInterval(100);
          accelerometerSubscription = Accelerometer.addListener(data => {
            const { x, y, z } = data;
            const currentTime = Date.now();
            
            // Calculate total G-force magnitude
            const totalForce = Math.sqrt(x * x + y * y + z * z);
            const delta = Math.abs(totalForce - 1); // Subtract gravity (1G)

            if (delta > ACCEL_THRESHOLD) {
              if (currentTime - lastShakeTime.current > SHAKE_WAIT_TIME) {
                shakeCount.current = 0; // Reset if too slow
              }
              
              shakeCount.current += 1;
              lastShakeTime.current = currentTime;

              if (shakeCount.current >= MIN_SHAKES) {
                shakeCount.current = 0;
                triggerEmergencyAlert('Motion Trigger');
              }
            }
          });
          
          return () => shakeSub.remove();
        } catch (e) {
          console.log('Native shake listener failed, relying on Accelerometer');
        }
      }

      // 3. Volume Trigger (Requires Development Build)
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
              EmergencyService.triggerSOS("Emergency volume trigger!").catch(err => console.log('Volume trigger error:', err));
            }
          });
        } catch (e) {
          console.error('Error adding volume listener:', e);
        }
      }
    };

    const triggerEmergencyAlert = (source: string) => {
      console.log(`SOS triggered via ${source}`);
      Alert.alert(
        'Emergency SOS',
        'Vigorous movement detected. Do you want to send an SOS alert to your guardians?',
        [
          { text: 'I AM SAFE', style: 'cancel' },
          { text: 'SEND SOS NOW', onPress: () => EmergencyService.triggerSOS(), style: 'destructive' },
        ],
        { cancelable: false }
      );
    };

    setupTriggers();

    return () => {
      accelerometerSubscription?.remove();
      volumeSubscription?.remove();
      RNShake.removeAllListeners();
    };
  }, []);
};
