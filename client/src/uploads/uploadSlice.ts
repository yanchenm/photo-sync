import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import { uploadPhoto } from './uploadHandler';

export type UploadStatus = 'uploading' | 'completed' | 'error';

type UploadState = {
  uploading: boolean;
  status: { [filename: string]: UploadStatus };
  numUploading: number;
};

const initialState = {
  uploading: false,
  status: {},
  numUploading: 0,
} as UploadState;

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    uploadStarted(state, action: PayloadAction<string>) {
      state.uploading = true;
      state.status = { ...state.status, [action.payload]: 'uploading' };
      state.numUploading++;
    },
    uploadFinished(state, action: PayloadAction<string>) {
      const filename = action.payload;
      if (filename in state.status) {
        state.numUploading--;
        state.status[filename] = 'completed';
      }
      if (state.numUploading === 0) {
        state.uploading = false;
      }
    },
    uploadFailed(state, action: PayloadAction<string>) {
      const filename = action.payload;
      if (filename in state.status) {
        state.status[filename] = 'error';
        state.numUploading--;
      }
      if (state.numUploading === 0) {
        state.uploading = false;
      }
    },
    clearUploads(state) {
      state.uploading = false;
      state.status = {};
      state.numUploading = 0;
    },
  },
});

export const { uploadStarted, uploadFinished, uploadFailed, clearUploads } = uploadSlice.actions;

export default uploadSlice.reducer;

export const startUpload = (file: File): AppThunk => async (dispatch, getState) => {
  try {
    const state = getState();
    const token = state.auth.accessToken;

    if (token == null) {
      return;
    }

    dispatch(uploadStarted(file.name));

    const status = await uploadPhoto(token, file);
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
