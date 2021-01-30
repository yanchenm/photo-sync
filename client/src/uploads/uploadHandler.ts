import { uploadFailed, uploadFinished, uploadStarted } from './uploadSlice';

import { AppThunk } from '../store';
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

export const startUpload = (file: File): AppThunk => async (dispatch) => {
  try {
    dispatch(uploadStarted(file.name));

    const status = await uploadPhoto(file);
    if (!status) {
      dispatch(uploadFailed(file.name));
      return;
    }
  } catch (err) {
    dispatch(uploadFailed(file.name));
    return;
  }

  dispatch(uploadFinished(file.name));
};
