import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export type User = { id: string; email: string; displayName: string } | null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { hydrated: false, isAuthenticated: false, accessToken: null as string | null, user: null as User },
  reducers: {
    setSession: (state, action: PayloadAction<{ accessToken: string; user: Exclude<User, null> }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    signOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setHydrated: (state) => { state.hydrated = true; },
  },
});

export const { setSession, signOut, setHydrated } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export async function persistSession(session: { accessToken: string; user: Exclude<User, null> } | null) {
  if (!session) await AsyncStorage.removeItem('workouts2-session');
  else await AsyncStorage.setItem('workouts2-session', JSON.stringify(session));
}
