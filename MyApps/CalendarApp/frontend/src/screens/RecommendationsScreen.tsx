import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { EmptyState } from '../components/EmptyState';

const accentPalette = ['#ffe4f1', '#e7f9ff', '#fff1d5', '#eafae7'];

export const RecommendationsScreen = () => {
  const { recommendations, state, dispatch, selectedSlot, currentUser, friends } = useApp();
  const data = recommendations.recommendations ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Fresh picks</Text>
        <Text style={styles.title}>Recommendations</Text>
        <Text style={styles.subtitle}>Matched to the shared slot, lifestyle, and energy of your current crew.</Text>
      </View>

      <TouchableOpacity
        onPress={() => dispatch({ type: 'SET_BUDGET', payload: 'medium' })}
        style={styles.filterChip}
      >
        <Text style={styles.filterText}>Demo filter: medium budget</Text>
      </TouchableOpacity>

      {!selectedSlot ? (
        <EmptyState title="Select a time slot" message="Pick a shared availability slot to see recommended activities." />
      ) : data.length === 0 ? (
        <EmptyState title="No matching recommendations" message={recommendations.reason ?? 'Relax a filter or choose another slot.'} />
      ) : (
        data.map((activity, index) => (
          <View key={activity.id} style={[styles.card, { backgroundColor: accentPalette[index % accentPalette.length] }]}>
            <Text style={styles.cardTitle}>{activity.title}</Text>
            <Text style={styles.cardText}>{activity.description}</Text>
            <Text style={styles.cardMeta}>Why suggested: {activity.reasons.join(' • ')}</Text>
            <TouchableOpacity
              onPress={() => dispatch({
                type: 'CREATE_INVITATION',
                payload: {
                  id: `inv-${Date.now()}`,
                  organizerId: currentUser.id,
                  invitedFriendIds: friends.map((friend) => friend.id),
                  activityId: activity.id,
                  timeSlot: selectedSlot,
                  location: activity.location,
                  status: 'draft',
                  createdAtISO: new Date().toISOString()
                }
              })}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Create simulated invitation</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
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
    backgroundColor: '#ebf9ff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d7f0ff'
  },
  kicker: {
    color: '#3ea9ff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1d4d64',
    marginBottom: 6
  },
  subtitle: {
    color: '#58748a',
    fontSize: 14,
    lineHeight: 20
  },
  filterChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dfefff'
  },
  filterText: {
    color: '#2d4d68',
    fontWeight: '700'
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3d8e9'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3d2850',
    marginBottom: 6
  },
  cardText: {
    color: '#5e4669',
    lineHeight: 20,
    marginBottom: 8
  },
  cardMeta: {
    color: '#5b4a63',
    fontSize: 13,
    lineHeight: 18
  },
  cta: {
    marginTop: 12,
    backgroundColor: '#ff4fa3',
    borderRadius: 12,
    padding: 12
  },
  ctaText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '800'
  }
});
