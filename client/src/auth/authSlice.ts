import { Credentials, refreshAuth, signIn, signOut } from './authHandler';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User, getAuthenticatedUser } from '../users/userHandler';

import { AppThunk } from '../store';

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
  let accessToken, user;
  try {
    accessToken = await signIn(credentials);
    if (accessToken == null) {
      dispatch(signInFailed());
      return;
    }

    user = await getAuthenticatedUser(accessToken);
    if (user == null) {
      dispatch(signInFailed());
      return;
    }
  } catch (err) {
    dispatch(signInFailed());
    return;
  }

  dispatch(signInSuccessful({ user, accessToken }));
};

export const tryRefresh = (): AppThunk => async (dispatch) => {
  let accessToken, user;
  try {
    accessToken = await refreshAuth();
    if (accessToken == null) {
      dispatch(signInFailed());
      return;
    }

    user = await getAuthenticatedUser(accessToken);
    if (user == null) {
      dispatch(signInFailed());
      return;
    }
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
