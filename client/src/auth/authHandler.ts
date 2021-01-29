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
