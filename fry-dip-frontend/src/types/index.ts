export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  storage_path: string;
  last_login: string | null;
}

export interface AuthResponse {
  message: string;
  is_admin: boolean;
  username?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  is_admin: boolean;
  username: string | null;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
}

export interface ValidationError {
  [key: string]: string[] | string;
}

export interface ApiError {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}

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

export interface FilesState {
  items: FileItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}