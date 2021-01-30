import { signInFailed, signInSuccessful, signOutFailed, signOutSuccessful } from './authSlice';

import { AppThunk } from '../store';
import { User } from '../users/userHandler';
import { api } from '../api';

export type Credentials = {
  email: string;
  password: string;
};

type SignInResponse = {
  token: string;
  user: User;
};

export const signIn = async (userData: Credentials): Promise<SignInResponse | null> => {
  try {
    const res = await api.post('/login', userData);
    if (res.status !== 200) {
      return null;
    }

    return {
      token: res.data['token'],
      user: {
        name: res.data['user']['name'],
        email: res.data['user']['email'],
      },
    };
  } catch (err) {
    return null;
  }
};

export const refreshAuth = async (): Promise<SignInResponse | null> => {
  try {
    const res = await api.post('/refresh');
    if (res.status !== 200) {
      return null;
    }

    return {
      token: res.data['token'],
      user: {
        name: res.data['user']['name'],
        email: res.data['user']['email'],
      },
    };
  } catch (err) {
    return null;
  }
};

export const signOut = async (accessToken: string): Promise<boolean> => {
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };

  try {
    const res = await api.post('/logout', null, config);
    return res.status === 200;
  } catch (err) {
    return false;
  }
};

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
