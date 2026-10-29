import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';

export const DemoEntryScreen = () => {
  const { state, dispatch, currentUser } = useApp();
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text style={{ fontSize: 24, fontWeight: '800' }}>Social Calendar Demo</Text><Text style={{ marginTop: 8, color: '#475569' }}>All people, schedules, and invitation responses below are simulated demo data.</Text>{['u1','u2','u3'].map((id) => <TouchableOpacity key={id} onPress={() => dispatch({ type: 'SET_USER', payload: id })} style={{ marginTop: 12, padding: 14, borderRadius: 14, backgroundColor: state.currentUserId === id ? '#c7d2fe' : '#f8fafc' }}><Text style={{ fontWeight: '700' }}>{id === 'u1' ? 'Avery Chen' : id === 'u2' ? 'Jordan Patel' : 'Mina Torres'}</Text></TouchableOpacity>)}<View style={{ marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: '#eef2ff' }}><Text style={{ fontWeight: '700' }}>Selected demo user: {currentUser.name}</Text><Text>Home location: {currentUser.homeLocation}</Text><Text>Budget: {currentUser.budgetLevel}</Text></View></ScrollView>;
};
