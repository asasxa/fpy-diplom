import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { ApiError } from '../../types';

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  storage_path: string;
  last_login: string | null;
}

interface UsersState {
  items: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = { items: [], status: 'idle', error: null };

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: ApiError }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка загрузки пользователей' });
    }
  }
);

export const deleteUser = createAsyncThunk<number, number, { rejectValue: ApiError }>(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка удаления' });
    }
  }
);

export const updateAdminStatus = createAsyncThunk<User, { id: number; is_admin: boolean }, { rejectValue: ApiError }>(
  'users/updateAdminStatus',
  async ({ id, is_admin }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/users/${id}/`, { is_admin });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка изменения прав' });
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload?.error || 'Ошибка'; })
      .addCase(deleteUser.fulfilled, (state, action) => { state.items = state.items.filter(u => u.id !== action.payload); })
      .addCase(updateAdminStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default usersSlice.reducer;