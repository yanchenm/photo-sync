import { api, apiWithAuth } from '../api';
import { signInFailed, signInSuccessful, signOutFailed, signOutSuccessful } from './authSlice';

import { AppThunk } from '../store';
import { User } from '../users/userHandler';

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

export const signOut = async (): Promise<boolean> => {
  try {
    const res = await apiWithAuth.post('/logout');
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

export const trySignOut = (): AppThunk => async (dispatch) => {
  try {
    const status = await signOut();
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
