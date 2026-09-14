import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/shared/store';
import { register } from './authSlice';
import { theme } from '@/shared/theme';

export function RegisterScreen({ navigation }: any) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.auth.loading);

  const onSubmit = async () => {
    try {
      await dispatch(register({ displayName, email, password }) as any).unwrap();
    } catch (error: any) {
      Alert.alert('Registration failed', error?.message ?? 'Unable to register');
    }
  };

  return (
    <View style={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flex: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Create Account</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor={theme.colors.textMuted} style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }} />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={theme.colors.textMuted} secureTextEntry style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }} />
      <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 14, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{loading ? 'Creating...' : 'Create Account'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SignIn')}>
        <Text style={{ textAlign: 'center', color: theme.colors.primary }}>Back to Sign In</Text>
      </Pressable>
    </View>
  );
}
