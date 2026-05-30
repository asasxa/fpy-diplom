import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { ApiError } from '../../types';

export interface FileItem {
  id: number;
  original_name: string;
  comment: string;
  size: number;
  uploaded_at: string;
  last_downloaded_at: string | null;
  special_link: string;
  download_url: string;
}

export interface PaginatedFilesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FileItem[];
}

interface FilesState {
  items: FileItem[];
  count: number;
  next: string | null;
  previous: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FilesState = {
  items: [],
  count: 0,
  next: null,
  previous: null,
  status: 'idle',
  error: null,
};

export const fetchFiles = createAsyncThunk<PaginatedFilesResponse, { page?: number }, { rejectValue: ApiError }>(
  'files/fetchFiles',
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const res = await api.get('/files/', { params: { page } });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка загрузки списка файлов' });
    }
  }
);

export const uploadFile = createAsyncThunk<FileItem, { file: File; comment: string }, { rejectValue: ApiError }>(
  'files/uploadFile',
  async (data, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('comment', data.comment);
      const res = await api.post('/files/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка загрузки файла' });
    }
  }
);

export const deleteFile = createAsyncThunk<number, number, { rejectValue: ApiError }>(
  'files/deleteFile',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/files/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка удаления файла' });
    }
  }
);

export const updateFile = createAsyncThunk<
  FileItem,
  { id: number; data: Partial<Pick<FileItem, 'original_name' | 'comment'>> },
  { rejectValue: ApiError }
>(
  'files/updateFile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/files/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Ошибка обновления файла' });
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || 'Неизвестная ошибка';
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.count += 1;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter((file) => file.id !== action.payload);
        state.count -= 1;
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        const index = state.items.findIndex((file) => file.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload
          };
        }
      });
  },
});

export const { clearError } = filesSlice.actions;
export default filesSlice.reducer;