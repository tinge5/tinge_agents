import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getMe, register as apiRegister, signIn as apiSignIn, signOut as apiSignOut, restoreSessionFromStorage, type AuthSession, type MeProfile } from '@/shared/api/client';
import { AppDispatch, RootState } from '@/shared/store';

export type AuthState = {
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: MeProfile | null;
};

const initialState: AuthState = {
  hydrated: false,
  loading: false,
  error: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
};

async function hydrateSession(session: AuthSession | null) {
  if (!session) return null;
  const profile = await getMe();
  return { ...session, user: profile };
}

export const restoreSession = createAsyncThunk<AuthSession | null>(
  'auth/restoreSession',
  async () => {
    const session = await restoreSessionFromStorage();
    return session ? await hydrateSession(session) : null;
  }
);

export const login = createAsyncThunk<AuthSession, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => apiSignIn(email, password)
);

export const register = createAsyncThunk<AuthSession, { displayName: string; email: string; password: string }>(
  'auth/register',
  async ({ displayName, email, password }) => apiRegister(displayName, email, password)
);

export const logout = createAsyncThunk<void, void, { state: RootState; dispatch: AppDispatch }>(
  'auth/logout',
  async () => {
    await apiSignOut();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.hydrated = true;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error = null;
        if (action.payload) {
          state.isAuthenticated = true;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user as MeProfile;
        } else {
          state.isAuthenticated = false;
          state.accessToken = null;
          state.refreshToken = null;
          state.user = null;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.hydrated = true;
        state.isAuthenticated = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unable to sign in';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unable to register';
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
