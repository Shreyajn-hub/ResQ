import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { saveData, getData } from '../utils/storage';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const c = await getData('contacts');
    const n = await getData('name');
    if (c) setContacts(c);
    if (n) setName(n);
  };

  const addContact = async () => {
    const updated = [...contacts, contact];
    setContacts(updated);
    await saveData('contacts', updated);
    setContact('');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} />
      <Button title="Save Name" onPress={() => saveData('name', name)} />

      <Text>Add Contact</Text>
      <TextInput value={contact} onChangeText={setContact} />
      <Button title="Add Contact" onPress={addContact} />

      <Text>Language</Text>
      <Button title="English" onPress={() => saveData('language', 'en')} />
      <Button title="Hindi" onPress={() => saveData('language', 'hi')} />
      <Button title="Kannada" onPress={() => saveData('language', 'kn')} />
      <Button title="Tamil" onPress={() => saveData('language', 'ta')} />
    </View>
  );
}