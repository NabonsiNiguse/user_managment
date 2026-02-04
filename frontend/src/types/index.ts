// ተጠቃሚው የሚይዛቸው መረጃዎች
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

// ለ Login የሚላክ ዳታ
export interface LoginData {
  email: string;
  password: string;
}

// ለ Register የሚላክ ዳታ
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// ከሰርቨር የሚመጣ መልስ (Response)
export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

// የ Auth ሁኔታን ለመቆጣጠር (Context ውስጥ የሚጠቅም)
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}