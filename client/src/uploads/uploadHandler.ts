import api, { getAuthorizationHeader } from '../api';

export const uploadPhoto = async (accessToken: string, file: File): Promise<boolean> => {
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await api.post('/photos', formData, getAuthorizationHeader(accessToken));
    return res.status === 200;
  } catch (err) {
    return false;
  }
};
