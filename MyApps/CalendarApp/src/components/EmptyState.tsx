import React from 'react';
import { Text, View } from 'react-native';

export const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#eef2ff', marginVertical: 8 }}>
    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e1b4b', marginBottom: 4 }}>{title}</Text>
    <Text style={{ color: '#4338ca' }}>{message}</Text>
  </View>
);
