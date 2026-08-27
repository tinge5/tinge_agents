import React from 'react';
import { View, Text, ScrollView } from 'react-native';
export function ProfileScreen() { return <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}><Text style={{ fontSize: 28, fontWeight: '800' }}>Profile</Text><View style={{ backgroundColor: '#ecfeff', padding: 16, borderRadius: 16 }}><Text style={{ fontWeight: '700' }}>Demo Athlete</Text><Text>Active plan: Strength Base</Text><Text>Completed plans: 1</Text><Text>Workout history: 4 sessions</Text><Text>Exercise history: Bench Press, Row, Squat</Text></View></ScrollView>; }
