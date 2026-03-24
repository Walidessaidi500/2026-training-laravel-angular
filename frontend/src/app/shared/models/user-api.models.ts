export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  }
}

export interface ApiValidationError {
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

