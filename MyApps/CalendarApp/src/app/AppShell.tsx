import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider } from '../state/AppContext';
import { DemoEntryScreen } from '../screens/DemoEntryScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { AvailabilityScreen } from '../screens/AvailabilityScreen';
import { RecommendationsScreen } from '../screens/RecommendationsScreen';
import { InvitationScreen } from '../screens/InvitationScreen';

const Tab = createBottomTabNavigator();

export const AppShell = () => (
  <AppProvider>
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#e0e7ff' }, tabBarActiveTintColor: '#4338ca' }}>
        <Tab.Screen name="Demo" component={DemoEntryScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
        <Tab.Screen name="Availability" component={AvailabilityScreen} />
        <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
        <Tab.Screen name="Invitations" component={InvitationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  </AppProvider>
);
