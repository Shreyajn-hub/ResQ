import React, { useEffect, useState } from 'react';
import { View, Button, Text, Linking, Switch } from 'react-native';
import SOSButton from '../components/SOSButton';
import { sendSOS } from '../services/sosService';
import { getData } from '../utils/storage';
import { translations } from '../utils/translations';

import Shake from 'react-native-shake';
import { VolumeManager } from 'react-native-volume-manager';
import Voice from '@react-native-voice/voice';

export default function HomeScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [language, setLanguage] = useState('en');
  const [live, setLive] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const c = await getData('contacts');
    const l = await getData('language');
    if (c) setContacts(c);
    if (l) setLanguage(l);
  };

  // 🔁 LIVE TRACKING
  useEffect(() => {
    let interval;
    if (live) {
      interval = setInterval(() => {
        sendSOS(contacts);
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [live, contacts]);

  // 📳 SHAKE TRIGGER
  useEffect(() => {
    const sub = Shake.addListener(() => {
      sendSOS(contacts);
    });
    return () => sub.remove();
  }, [contacts]);

  // 🔊 VOLUME BUTTON TRIGGER
  useEffect(() => {
    const listener = VolumeManager.addVolumeListener((result) => {
      if (result.volume > 0.9) {
        sendSOS(contacts);
      }
    });
    return () => listener.remove();
  }, [contacts]);

  // 🎤 VOICE TRIGGER
  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value[0]?.toLowerCase() || '';
      if (text.includes("raksha help")) {
        sendSOS(contacts);
      }
    };

    Voice.start('en-US');

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [contacts]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

      <SOSButton
        label={translations[language].sos}
        onPress={() => sendSOS(contacts)}
      />

      <Button title="Share Location" onPress={() => sendSOS(contacts)} />

      <Text>Live Tracking</Text>
      <Switch value={live} onValueChange={setLive} />

      <Button title="Police" onPress={() => Linking.openURL('tel:100')} />
      <Button title="Women Helpline" onPress={() => Linking.openURL('tel:1091')} />
      <Button title="Ambulance" onPress={() => Linking.openURL('tel:102')} />
      <Button title="Fire" onPress={() => Linking.openURL('tel:101')} />

      <Button
        title="Find Safe Place"
        onPress={() =>
          Linking.openURL('https://www.google.com/maps/search/police+station+near+me')
        }
      />

      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}