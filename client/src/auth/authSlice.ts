import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { User } from '../users/userHandler';

type AuthState = {
  signedIn: boolean;
  user: User | null;
  accessToken: string | null;
  error: boolean;
};

type SignInPayload = {
  user: User;
  accessToken: string;
};

const initialState = {
  signedIn: false,
  user: null,
  accessToken: null,
  error: false,
} as AuthState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInSuccessful(state, action: PayloadAction<SignInPayload>) {
      state.signedIn = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = false;
    },
    signInFailed(state) {
      state.signedIn = false;
      state.user = null;
      state.accessToken = null;
      state.error = true;
    },
    signOutSuccessful(state) {
      state.signedIn = false;
      state.user = null;
      state.accessToken = null;
      state.error = false;
    },
    signOutFailed(state) {
      state.signedIn = false;
      state.user = null;
      state.accessToken = null;
      state.error = true;
    },
    clearError(state) {
      state.error = false;
    },
  },
});

export const { signInSuccessful, signInFailed, signOutSuccessful, signOutFailed, clearError } = authSlice.actions;

export default authSlice.reducer;
