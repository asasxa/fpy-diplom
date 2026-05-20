import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { AuthResponse, ApiError } from '../../types';

interface AuthState {
  isAuthenticated: boolean;
  is_admin: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
}

const loadPersistedState = (): Partial<AuthState> => {
  try {
    const saved = localStorage.getItem('auth_state');
    if (saved) {
      const { isAuthenticated, is_admin } = JSON.parse(saved);
      return { isAuthenticated, is_admin };
    }
  } catch { /* ignore */ }
  return {};
};

const initialState: AuthState = {
  isAuthenticated: false,
  is_admin: false,
  isLoading: false,
  isChecking: true,
  error: null,
  ...loadPersistedState(),
};

export const loginUser = createAsyncThunk<AuthResponse, { username: string; password: string }, { rejectValue: ApiError }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/login/', credentials);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка сети' });
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: ApiError }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/users/logout/');
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка выхода' });
    }
  }
);

export const checkAuth = createAsyncThunk<boolean, void, { rejectValue: boolean }>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/current/');
      return res.data.is_admin;
    } catch {
      return rejectWithValue(false);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.is_admin = action.payload.is_admin;
        state.isChecking = false;
        localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated: true, is_admin: action.payload.is_admin }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isChecking = false;
        state.error = action.payload?.error || 'Неверный логин или пароль';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.is_admin = false;
        state.error = null;
        state.isChecking = false;
        localStorage.removeItem('auth_state');
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isChecking = false;
        state.isAuthenticated = true;
        state.is_admin = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isChecking = false;
        state.isAuthenticated = false;
        state.is_admin = false;
        localStorage.removeItem('auth_state');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;