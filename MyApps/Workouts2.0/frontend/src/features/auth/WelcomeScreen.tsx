import React from 'react';
import { View, Text, Pressable, StyleSheet} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useAppSelector } from '@/shared/store';
import { MeProfile } from '@/shared/api/client';
import { theme } from '@/shared/theme';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const displayUser = profile ?? user;

  

  return (
    <View style={styles.container}>
      <Image
        source={require('./workoutslogo.svg')}
                
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.username}>{displayUser?.displayName ?? ''}</Text>
      <Text style={styles.subtitle}>Ready to pick up where you left off?</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('MainFlow')}>
        <Text style={[styles.buttonText, { textShadowColor: '#e5ebea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }]}>Enter</Text>
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
    backgroundColor: theme.colors.background,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 24,
    /*
    shadowColor: '#FF5005', // Put your glow color here (e.g., cyan)
    shadowOffset: { width: 0, height: 0 }, // Center the glow around the image
    shadowOpacity: 0.8, // Intensity of the glow (0 to 1)
    shadowRadius: 15, // Blur radius (higher numbers = softer, wider glow)
    */
  },
  logoGlow: {
  position: 'absolute',
  opacity: 0.8,
  transform: [{ scale: 1.08 }],
  tintColor: '#FF5005',
},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  username: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: theme.colors.primaryDark, 
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 10 
  },
  button: {
    minWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',

  },
});
