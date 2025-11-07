// eslint-disable-next-line import/named
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { SignupFormValues } from '@/types/auth';

interface AuthState {
  loading: boolean;
  user: Record<string, unknown> | null;
  error: string | null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
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
      });
  }
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
