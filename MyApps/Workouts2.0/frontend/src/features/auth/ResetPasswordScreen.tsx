import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { resetPassword } from '@/shared/api/client';
import { theme } from '@/shared/theme';

export function ResetPasswordScreen({ navigation, route }: any) {
  const initialToken = useMemo(() => {
    const routeToken = route?.params?.token;

    if (routeToken) {
      return routeToken;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') ?? '';
    }

    return '';
  }, [route?.params?.token]);  
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await resetPassword(token, password);
      Alert.alert('Password reset', 'Your password has been updated. Please sign in again.', [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]);
    } catch (error: any) {
      Alert.alert('Reset failed', error?.message ?? 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flex: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Reset Password</Text>
      <Text style={{ color: theme.colors.textMuted }}>Enter the reset token from your email and choose a new password.</Text>
      <TextInput value={token} onChangeText={setToken} placeholder="Reset token" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="New password" placeholderTextColor={theme.colors.textMuted} secureTextEntry style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }} />
      <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: theme.colors.primaryDark, padding: 16, borderRadius: 14, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{loading ? 'Updating...' : 'Reset Password'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SignIn')}>
        <Text style={{ textAlign: 'center', color: theme.colors.primary }}>Back to Sign In</Text>
      </Pressable>
    </View>
  );
}
