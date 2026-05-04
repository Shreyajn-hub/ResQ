import * as SMS from 'expo-sms';
import { getLocation } from './locationService';

export const sendSOS = async (contacts) => {
  const coords = await getLocation();
  if (!coords || contacts.length === 0) return;

  const message = `🚨 RESQ ALERT!
I need help!
https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;

  await SMS.sendSMSAsync(contacts, message);
};