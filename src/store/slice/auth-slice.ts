// eslint-disable-next-line import/named
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { ForgotPasswordFormValues, SignupFormValues } from '@/types/auth';

interface AuthState {
  loading: boolean;
  user: Record<string, unknown> | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
  successMessage: null
};

// Signup Thunk
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (values: SignupFormValues, { rejectWithValue }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      const { confirmPassword, ...payload } = values;
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || data.message || 'Signup failed.');
      }

      toast.success(data.message || 'Your account has been created successfully!');

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';

      return rejectWithValue(message);
    }
  }
);

// Forgot Password Thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (values: ForgotPasswordFormValues, { rejectWithValue }) => {
    try {
      const email = values.email.trim().toLowerCase();
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to send reset email');
      }

      // API always responds with a success message regardless of existence
      toast.success('If this email exists, a reset link was sent.');

      return data.message;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';

      return rejectWithValue(message);
    }
  }
);

// Reset Password Thunk
export const resetPassword = createAsyncThunk<
  { success: boolean; message: string },
  { token: string; password: string; confirmPassword: string },
  { rejectValue: string }
>('auth/resetPassword', async (values, { rejectWithValue }) => {
  try {
    if (values.password !== values.confirmPassword) {
      return rejectWithValue('Passwords do not match');
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: values.token, password: values.password })
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.error || 'Reset failed');
    }

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return rejectWithValue('Something went wrong');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<Record<string, unknown>>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Reset failed');
      });
  }
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
