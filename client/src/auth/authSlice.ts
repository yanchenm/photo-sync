import { Credentials, refreshAuth, signIn, signOut } from './authHandler';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
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

export const trySignIn = (credentials: Credentials): AppThunk => async (dispatch) => {
  let accessToken: string, user: User;
  try {
    const response = await signIn(credentials);
    if (response == null) {
      dispatch(signInFailed());
      return;
    }

    accessToken = response.token;
    user = response.user;
  } catch (err) {
    dispatch(signInFailed());
    return;
  }

  dispatch(signInSuccessful({ user, accessToken }));
};

export const tryRefresh = (): AppThunk => async (dispatch) => {
  let accessToken: string, user: User;
  try {
    const response = await refreshAuth();
    if (response == null) {
      dispatch(signInFailed());
      return;
    }

    accessToken = response.token;
    user = response.user;
  } catch (err) {
    dispatch(signInFailed());
    return;
  }

  dispatch(signInSuccessful({ user, accessToken }));
};

export const trySignOut = (): AppThunk => async (dispatch, getState) => {
  try {
    const state = getState();
    const token = state.auth.accessToken;

    if (token == null) {
      dispatch(signOutFailed());
      return;
    }

    const status = await signOut(token);
    if (!status) {
      dispatch(signOutFailed());
      return;
    }
  } catch (err) {
    dispatch(signOutFailed());
    return;
  }

  dispatch(signOutSuccessful());
};
