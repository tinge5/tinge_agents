import AsyncStorage from '@react-native-async-storage/async-storage';
import { setHydrated, setSession, signOut } from '@/shared/store';

export const restoreSession = () => async (dispatch: any) => {
  const raw = await AsyncStorage.getItem('workouts2-session');
  if (raw) dispatch(setSession(JSON.parse(raw)));
  dispatch(setHydrated());
};

export const saveSession = (session: { accessToken: string; user: { id: string; email: string; displayName: string } } | null) => async (dispatch: any) => {
  if (session) {
    await AsyncStorage.setItem('workouts2-session', JSON.stringify(session));
    dispatch(setSession(session));
  } else {
    await AsyncStorage.removeItem('workouts2-session');
    dispatch(signOut());
  }
};
