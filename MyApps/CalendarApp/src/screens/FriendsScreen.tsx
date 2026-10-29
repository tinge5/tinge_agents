import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { demoFriends } from '../data/demoData';
import { useApp } from '../state/AppContext';

export const FriendsScreen = () => {
  const { state, dispatch } = useApp();
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '800' }}>Friends & Group</Text><Text style={{ color: '#64748b', marginBottom: 12 }}>Select fictional friends for the shared availability calculation.</Text>{demoFriends.map((friend) => <TouchableOpacity key={friend.id} onPress={() => dispatch({ type: 'TOGGLE_FRIEND', payload: friend.id })} style={{ marginBottom: 10, padding: 14, borderRadius: 14, backgroundColor: state.selectedFriendIds.includes(friend.id) ? '#dbeafe' : '#f8fafc' }}><Text style={{ fontWeight: '700' }}>{friend.name} • {friend.relationship}</Text><Text>{friend.homeLocation}</Text></TouchableOpacity>)}<View style={{ marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: '#eef2ff' }}><Text style={{ fontWeight: '700' }}>Selected friends (simulated):</Text><Text>{state.selectedFriendIds.join(', ') || 'None selected'}</Text></View></ScrollView>;
};
