import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';

const userConfig = {
  u1: { name: 'Avery Chen', accent: '#ff7eb6', mood: 'Creative energy' },
  u2: { name: 'Jordan Patel', accent: '#7ad7ff', mood: 'Active flow' },
  u3: { name: 'Mina Torres', accent: '#ffd166', mood: 'Warm plans' }
};

export const DemoEntryScreen = () => {
  const { state, dispatch, currentUser } = useApp();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Moodboard</Text>
        <Text style={styles.title}>Social Calendar Demo</Text>
        <Text style={styles.subtitle}>Simulated plans, friend energy, and invite responses designed like a playful planner.</Text>
      </View>

      <View style={styles.grid}>
        {['u1', 'u2', 'u3'].map((id) => {
          const selected = state.currentUserId === id;
          const profile = userConfig[id as keyof typeof userConfig];
          return (
            <TouchableOpacity
              key={id}
              onPress={() => dispatch({ type: 'SET_USER', payload: id })}
              style={[styles.userCard, selected && styles.selectedUserCard]}
            >
              <View style={[styles.avatar, { backgroundColor: profile.accent }]}>
                <Text style={styles.avatarText}>{profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text>
              </View>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userMood}>{profile.mood}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Selected profile</Text>
        <Text style={styles.summaryName}>{currentUser.name}</Text>
        <Text style={styles.summaryText}>Home location: {currentUser.homeLocation}</Text>
        <Text style={styles.summaryText}>Budget: {currentUser.budgetLevel}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fffafc'
  },
  heroCard: {
    backgroundColor: '#ffeaf5',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffd4eb'
  },
  kicker: {
    color: '#ff4fa3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4a234d',
    marginBottom: 6
  },
  subtitle: {
    color: '#7c6d89',
    fontSize: 14,
    lineHeight: 20
  },
  grid: {
    marginBottom: 16
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffe0f1',
    shadowColor: '#ffbfdc',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2
  },
  selectedUserCard: {
    backgroundColor: '#fff1f8',
    borderColor: '#ff7eb6',
    shadowOpacity: 0.22
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#40213d'
  },
  userMood: {
    color: '#7a5a7c',
    fontSize: 12,
    fontWeight: '700'
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe0f1'
  },
  summaryLabel: {
    color: '#ff4fa3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  summaryName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4a234d',
    marginBottom: 6
  },
  summaryText: {
    color: '#6a516c',
    fontSize: 14,
    marginTop: 3
  }
});
