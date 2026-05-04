import { TouchableOpacity, Text } from 'react-native';

export default function SOSButton({ onPress, label }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'red',
        padding: 70,
        borderRadius: 200,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Text style={{ color: '#fff', fontSize: 28 }}>{label}</Text>
    </TouchableOpacity>
  );
}