import axios from 'axios';

export type SignUpData = {
  name: string;
  email: string;
  password: string;
};

const url = 'http://localhost:8080/users';

export const addNewUser = async (newUserData: SignUpData): Promise<boolean> => {
  try {
    const res = await axios.post(url + '/new', newUserData);
    return res.status === 201;
  } catch (error) {
    return false;
  }
};
