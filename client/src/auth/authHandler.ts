import api, { getAuthorizationHeader } from '../api';

export type Credentials = {
  email: string;
  password: string;
};

export const signIn = async (userData: Credentials): Promise<string | null> => {
  try {
    const res = await api.post('/login', userData);
    if (res.status !== 200) {
      return null;
    }

    return res.data['token'];
  } catch (err) {
    return null;
  }
};

export const refreshAuth = async (): Promise<string | null> => {
  try {
    const res = await api.post('/refresh');
    if (res.status !== 200) {
      return null;
    }
    return res.data['token'];
  } catch (err) {
    return null;
  }
};

export const signOut = async (accessToken: string): Promise<boolean> => {
  try {
    const res = await api.post('/logout', null, getAuthorizationHeader(accessToken));
    return res.status === 200;
  } catch (err) {
    return false;
  }
};
