import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAppDispatch } from '@/shared/store';
import { saveSession } from './authSlice';

export function AuthScreen() {
  const [email, setEmail] = useState('demo@workouts.app');
  const [password, setPassword] = useState('password123');
  const dispatch = useAppDispatch();
  return <View style={{ padding: 20, gap: 12 }}><Text style={{ fontSize: 28, fontWeight: '700' }}>Sign In</Text><TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} /><TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} /><Pressable onPress={() => dispatch(saveSession({ accessToken: 'demo-token', user: { id: 'u1', email, displayName: 'Demo Athlete' } }) as any)} style={{ backgroundColor: '#111827', padding: 16, borderRadius: 14 }}><Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Continue</Text></Pressable></View>;
}
