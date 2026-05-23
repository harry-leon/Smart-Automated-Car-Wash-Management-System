export type InternalRole = "staff" | "admin";

export interface InternalUser {
  id?: string;
  email?: string;
  fullName?: string;
  role: InternalRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: InternalUser;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T;
  timestamp?: string;
  errorCode?: string;
}

export interface BackendLoginData {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    email?: string;
    fullName?: string;
    name?: string;
    role?: string;
  };
  role?: string;
}
