// /types/auth.ts

export interface SignupFormValues {
  fullname: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  remember:boolean
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: 'USER' | 'ADMIN';
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}