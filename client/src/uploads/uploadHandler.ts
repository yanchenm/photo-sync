import { apiWithAuth } from '../apiWithAuth';

export const uploadPhoto = async (accessToken: string, file: File): Promise<boolean> => {
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await apiWithAuth.post('/photos', formData);
    return res.status === 200;
  } catch (err) {
    return false;
  }
};
