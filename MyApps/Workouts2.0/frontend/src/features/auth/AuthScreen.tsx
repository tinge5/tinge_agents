import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/shared/store';
import { login } from './authSlice';

export function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.auth.loading);

  const onSubmit = async () => {
    try {
      await dispatch(login({ email, password }) as any).unwrap();
    } catch (error: any) {
      Alert.alert('Sign in failed', error?.message ?? 'Unable to sign in');
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Sign In</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
      <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: '#111827', padding: 16, borderRadius: 14, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{loading ? 'Signing In...' : 'Continue'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={{ textAlign: 'center', color: '#2563eb' }}>Create an account</Text>
      </Pressable>
    </View>
  );
}
