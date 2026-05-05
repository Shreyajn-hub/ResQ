import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { StorageService } from '../services/storage';
import { EmergencyService } from '../services/emergency';

// Safe imports for native modules
let NativeShake: any = null;
try {
  NativeShake = require('react-native-shake').default;
} catch (e) {
  console.log('RNShake not available');
}

let VolumeManager: any = null;
try {
  VolumeManager = require('react-native-volume-manager').VolumeManager;
} catch (e) {
  console.log('VolumeManager not available');
}

export const useEmergencyTriggers = () => {
  const pressCount = useRef<number>(0);
  const lastPressTime = useRef<number>(0);
  
  // Accelerometer state
  const shakeCount = useRef<number>(0);
  const lastShakeTime = useRef<number>(0);
  
  // Fall Detection state
  const lastImpactTime = useRef<number>(0);
  const isWaitingForStillness = useRef<boolean>(false);

  const ACCEL_THRESHOLD = 2.8; // G-force threshold for shake
  const SHAKE_WAIT_TIME = 800; // Time between shakes in ms
  const MIN_SHAKES = 3; // Number of shakes required
  
  const FALL_IMPACT_THRESHOLD = 4.0; // High G-force for impact
  const STILLNESS_THRESHOLD = 0.2; // Low delta for stillness
  const STILLNESS_DURATION = 3000; // 3 seconds of stillness after impact

  useEffect(() => {
    let accelerometerSubscription: any;
    let volumeSubscription: any;
    let isMounted = true;

    const triggerEmergencyAlert = (source: string, isAuto = true) => {
      console.log(`SOS triggered via ${source}`);
      
      if (isAuto) {
        // Trigger SOS immediately for hardware sequences
        EmergencyService.triggerSOS(`SOS! ${source} detected. I need help.`).catch(err => console.log('Auto SOS error:', err));
        
        Alert.alert(
          'Emergency SOS Sent',
          `An automated SOS alert has been triggered via ${source}.`,
          [{ text: 'I AM SAFE', style: 'cancel' }],
          { cancelable: true }
        );
        return;
      }
    };

    const setupTriggers = async () => {
      const settings = await StorageService.getSettings();
      if (!isMounted) return;

      // 1. Native Shake Detection
      if (settings.shakeTrigger && NativeShake) {
        try {
          NativeShake.addListener(() => {
            triggerEmergencyAlert('Shake');
          });
        } catch (e) {
          console.log('Shake listener failed:', e);
        }
      }

      // 2. Accelerometer Triggers (Shake & Fall)
      if (settings.shakeTrigger || settings.fallDetection) {
        try {
          Accelerometer.setUpdateInterval(100);
          accelerometerSubscription = Accelerometer.addListener(data => {
            const { x, y, z } = data;
            const currentTime = Date.now();
            const totalForce = Math.sqrt(x * x + y * y + z * z);
            const delta = Math.abs(totalForce - 1);

            // Shake Logic (Accelerometer Fallback)
            if (settings.shakeTrigger && delta > ACCEL_THRESHOLD) {
              if (currentTime - lastShakeTime.current > SHAKE_WAIT_TIME) {
                shakeCount.current = 0;
              }
              shakeCount.current += 1;
              lastShakeTime.current = currentTime;

              if (shakeCount.current >= MIN_SHAKES) {
                shakeCount.current = 0;
                triggerEmergencyAlert('Vigorous Motion');
              }
            }

            // Fall Detection Logic
            if (settings.fallDetection) {
              if (delta > FALL_IMPACT_THRESHOLD) {
                lastImpactTime.current = currentTime;
                isWaitingForStillness.current = true;
                console.log('Fall impact detected, waiting for stillness...');
              }

              if (isWaitingForStillness.current && currentTime - lastImpactTime.current > 1000) {
                if (delta < STILLNESS_THRESHOLD) {
                  // Detected stillness after impact
                  if (currentTime - lastImpactTime.current > STILLNESS_DURATION) {
                    isWaitingForStillness.current = false;
                    triggerEmergencyAlert('Sudden Fall', true);
                  }
                } else {
                  // Movement detected, reset stillness check
                  if (currentTime - lastImpactTime.current > 5000) {
                    isWaitingForStillness.current = false;
                  }
                }
              }
            }
          });
        } catch (e) {
          console.log('Accelerometer failed:', e);
        }
      }

      // 3. Volume Trigger
      if (settings.volumeTrigger && VolumeManager) {
        try {
          volumeSubscription = VolumeManager.addVolumeListener((result: any) => {
            const now = Date.now();
            if (now - lastPressTime.current < 1500) {
              pressCount.current += 1;
            } else {
              pressCount.current = 1;
            }
            lastPressTime.current = now;

            if (pressCount.current >= 3) {
              pressCount.current = 0;
              triggerEmergencyAlert('Volume Sequence');
            }
          });
        } catch (e) {
          console.error('Error adding volume listener:', e);
        }
      }

      // 4. Voice Trigger (Placeholder for future implementation)
      if (settings.voiceDetection) {
        console.log('Voice trigger active (requires specialized recognition library)');
      }
    };

    setupTriggers();

    return () => {
      isMounted = false;
      accelerometerSubscription?.remove();
      volumeSubscription?.remove();
      NativeShake?.removeAllListeners();
    };
  }, []);
};
