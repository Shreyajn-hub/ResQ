import { useEffect, useRef } from 'react';
import RNShake from 'react-native-shake';
import { VolumeManager } from 'react-native-volume-manager';
import { StorageService } from '../services/storage';
import { EmergencyService } from '../services/emergency';
import { Alert } from 'react-native';

export const useEmergencyTriggers = () => {
  const lastVolumePress = useRef<number>(0);
  const volumePressCount = useRef<number>(0);

  useEffect(() => {
    let shakeSubscription: any;
    let volumeSubscription: any;

    const setupTriggers = async () => {
      const settings = await StorageService.getSettings();

      // Shake Trigger
      if (settings.shakeTrigger) {
        shakeSubscription = RNShake.addListener(() => {
          Alert.alert(
            'Shake Detected',
            'Do you want to trigger SOS?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Trigger SOS', onPress: () => EmergencyService.triggerSOS(), style: 'destructive' },
            ]
          );
        });
      }

      // Volume Trigger (Simulated sequence: Press volume 3 times quickly)
      if (settings.volumeTrigger) {
        volumeSubscription = VolumeManager.addVolumeListener((data) => {
          const now = Date.now();
          if (now - lastVolumePress.current < 1000) {
            volumePressCount.current += 1;
          } else {
            volumePressCount.current = 1;
          }
          lastVolumePress.current = now;

          if (volumePressCount.current >= 3) {
            volumePressCount.current = 0;
            EmergencyService.triggerSOS();
          }
        });
      }
    };

    setupTriggers();

    return () => {
      shakeSubscription?.remove();
      volumeSubscription?.remove();
    };
  }, []);
};
