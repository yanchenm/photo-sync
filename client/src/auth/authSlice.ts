import { Credentials, signIn, signOut } from './authHandler';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';

type AuthState = {
  signedIn: boolean;
  accessToken: string | null;
  error: boolean;
};

const initialState = {
  signedIn: false,
  accessToken: null,
  error: false,
} as AuthState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInSuccessful(state, action: PayloadAction<string>) {
      state.signedIn = true;
      state.accessToken = action.payload;
      state.error = false;
    },
    signInFailed(state) {
      state.signedIn = false;
      state.accessToken = null;
      state.error = true;
    },
    signOutSuccessful(state) {
      state.signedIn = false;
      state.accessToken = null;
      state.error = false;
    },
    signOutFailed(state) {
      state.signedIn = false;
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
  let accessToken;
  try {
    accessToken = await signIn(credentials);
    if (accessToken == null) {
      dispatch(signInFailed());
      return;
    }
  } catch (err) {
    dispatch(signInFailed());
    return;
  }

  dispatch(signInSuccessful(accessToken));
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
