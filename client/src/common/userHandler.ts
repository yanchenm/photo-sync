import api from '../api';

export type SignUpData = {
  name: string;
  email: string;
  password: string;
};

export const addNewUser = async (newUserData: SignUpData): Promise<boolean> => {
  try {
    const res = await api.post('/users/new', newUserData);
    return res.status === 201;
  } catch (error) {
    return false;
  }
};
