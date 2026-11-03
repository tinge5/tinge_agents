import React from 'react';
import { Text, View } from 'react-native';

export const InvitationStatusBadge = ({ status }: { status: string }) => {
  const bg = status === 'accepted' ? '#dcfce7' : status === 'declined' ? '#fee2e2' : '#e0e7ff';
  const color = status === 'accepted' ? '#166534' : status === 'declined' ? '#991b1b' : '#3730a3';
  return <View style={{ alignSelf: 'flex-start', backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}><Text style={{ color, fontWeight: '700' }}>{status.toUpperCase()} • simulated demo</Text></View>;
};
