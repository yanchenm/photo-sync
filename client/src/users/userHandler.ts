import { api } from '../api';
import { apiWithAuth } from '../apiWithAuth';

export type SignUpData = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  name: string;
  email: string;
};

export const addNewUser = async (newUserData: SignUpData): Promise<boolean> => {
  try {
    const res = await api.post('/users/new', newUserData);
    return res.status === 201;
  } catch (err) {
    return false;
  }
};

export const getAuthenticatedUser = async (): Promise<User | null> => {
  try {
    const res = await apiWithAuth.get('/user');
    if (res.status !== 200) {
      return null;
    }
    return {
      name: res.data['name'],
      email: res.data['email'],
    };
  } catch (err) {
    return null;
  }
};
