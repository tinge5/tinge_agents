import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { demoFriends } from '../data/demoData';
import { useApp } from '../state/AppContext';

export const FriendsScreen = () => {
  const { state, dispatch } = useApp();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Group planner</Text>
        <Text style={styles.title}>Friends & Group</Text>
        <Text style={styles.subtitle}>Mix and match your social circle to shape the shared calendar plan.</Text>
      </View>

      {demoFriends.map((friend) => {
        const selected = state.selectedFriendIds.includes(friend.id);
        return (
          <TouchableOpacity
            key={friend.id}
            onPress={() => dispatch({ type: 'TOGGLE_FRIEND', payload: friend.id })}
            style={[styles.friendCard, selected && styles.selectedFriendCard]}
          >
            <View style={[styles.avatar, selected && styles.selectedAvatar]}>
              <Text style={styles.avatarText}>{friend.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendMeta}>{friend.relationship}</Text>
              <Text style={styles.friendLocation}>{friend.homeLocation}</Text>
            </View>
            <Text style={[styles.selectBadge, selected && styles.selectBadgeActive]}>{selected ? 'Added' : 'Add'}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Selected friends</Text>
        <Text style={styles.summaryText}>{state.selectedFriendIds.join(', ') || 'None selected'}</Text>
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
    backgroundColor: '#eaf7ff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d8f1ff'
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
    color: '#214c63',
    marginBottom: 6
  },
  subtitle: {
    color: '#58748a',
    fontSize: 14,
    lineHeight: 20
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dfefff',
    shadowColor: '#98d6ff',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2
  },
  selectedFriendCard: {
    backgroundColor: '#f0fbff',
    borderColor: '#7ad7ff'
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffb0d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  selectedAvatar: {
    backgroundColor: '#62c7ff'
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800'
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2b3f52'
  },
  friendMeta: {
    color: '#5d7a8f',
    textTransform: 'capitalize',
    marginTop: 2
  },
  friendLocation: {
    color: '#738ca0',
    marginTop: 2
  },
  selectBadge: {
    color: '#6a8da6',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#edf7ff'
  },
  selectBadgeActive: {
    backgroundColor: '#c7eeff',
    color: '#1b5d83'
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dfefff'
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#214c63',
    marginBottom: 6
  },
  summaryText: {
    color: '#5d7a8f',
    fontSize: 14
  }
});
