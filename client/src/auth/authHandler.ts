import api from '../api';

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
  } catch (error) {
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
