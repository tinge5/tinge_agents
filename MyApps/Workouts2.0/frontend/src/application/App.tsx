import React, { useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { store, RootState } from '@/shared/store';
import { restoreSession } from '@/features/auth/authSlice';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { RegisterScreen } from '@/features/auth/RegisterScreen';
import { WelcomeScreen } from '@/features/auth/WelcomeScreen';
import { TodayScreen } from '@/features/workouts/TodayScreen';
import { PlanEditorScreen } from '@/features/plans/PlanEditorScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { WorkoutDetailScreen } from '@/features/workouts/WorkoutDetailScreen';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Today" component={TodayScreen} />
      <Tabs.Screen name="Plans" component={PlanEditorScreen} />
      <Tabs.Screen name="History" component={HistoryScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function MainFlow() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Workout" component={WorkoutDetailScreen} options={{ title: 'Workout' }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { hydrated, isAuthenticated, restoredSession } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession() as any);
  }, [dispatch]);

  const initialRouteName = useMemo(() => {
    if (!isAuthenticated) return 'SignIn';
    return restoredSession ? 'Welcome' : 'MainFlow';
  }, [isAuthenticated, restoredSession]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="SignIn" component={AuthScreen} options={{ title: 'Sign In' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainFlow" component={MainFlow} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
