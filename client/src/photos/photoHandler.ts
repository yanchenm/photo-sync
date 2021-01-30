import { apiWithAuth } from '../api';

export type Photo = {
  id: string;
  user: string;
  filename: string;
  key: string;
  url: string;
  thumbnail: string;
  thumbnail_url: string;
  uploaded_at: string;
  details: PhotoDetails;
};

export type PhotoDetails = {
  id: string;
  file_type: string;
  height: number;
  width: number;
  size: number;
};

export type PhotoList = {
  photos: Array<Photo> | null;
};

export type GetPhotosResponse = {
  items: PhotoList;
  has_more: boolean;
  total: number;
};

export const getPhotos = async (start: number, count: number): Promise<GetPhotosResponse | null> => {
  try {
    const res = await apiWithAuth.get(`/photos?start=${start}&count=${count}`);
    if (res.status !== 200) {
      return null;
    }

    return res.data;
  } catch (err) {
    return null;
  }
};

export const getPhotoById = async (id: string): Promise<Photo | null> => {
  try {
    const res = await apiWithAuth.get(`/photos/${id}`);
    if (res.status !== 200) {
      return null;
    }

    return res.data;
  } catch (err) {
    return null;
  }
};
