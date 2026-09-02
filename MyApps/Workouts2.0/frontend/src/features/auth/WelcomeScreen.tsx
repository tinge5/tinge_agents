import React from 'react';
import { View, Text, Pressable, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Image
        source={require('./workoutslogo.svg')}
                
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Ready to pick up where you left off?</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('MainFlow')}>
        <Text style={styles.buttonText}>Begin</Text>
      </Pressable>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    minWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
