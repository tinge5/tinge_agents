import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { forgotPassword } from '@/shared/api/client';
import { theme } from '@/shared/theme';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await forgotPassword(email);
      Alert.alert('Check your email', 'If an account exists for that email, you will receive a password reset link shortly.');
      navigation.navigate('SignIn');
    } catch (error: any) {
      Alert.alert('Unable to process request', error?.message ?? 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flex: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Forgot Password</Text>
      <Text style={{ color: theme.colors.textMuted }}>Enter your email address and we&apos;ll send you a reset link if an account exists.</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }} />
      <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: theme.colors.primaryDark, padding: 16, borderRadius: 14, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SignIn')}>
        <Text style={{ textAlign: 'center', color: theme.colors.primary }}>Back to Sign In</Text>
      </Pressable>
    </View>
  );
}
