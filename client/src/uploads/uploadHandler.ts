import { apiWithAuth } from '../api';

export const uploadPhoto = async (file: File): Promise<boolean> => {
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await apiWithAuth.post('/photos', formData);
    return res.status === 200;
  } catch (err) {
    return false;
  }
};
