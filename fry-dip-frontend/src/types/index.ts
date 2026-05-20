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