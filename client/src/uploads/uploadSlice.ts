import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import { uploadPhoto } from './uploadHandler';

type UploadStatus = 'uploading' | 'completed' | 'error';

type UploadState = {
  uploading: boolean;
  closed: boolean;
  status: { [filename: string]: UploadStatus };
  numUploading: number;
};

const initialState = {
  uploading: false,
  closed: true,
  status: {},
  numUploading: 0,
} as UploadState;

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    uploadStarted(state, action: PayloadAction<string>) {
      if (!state.uploading && state.closed) {
        state.closed = false;
        state.status = {};
      }

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
        if (state.closed) {
          state.status = {};
        }
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
        if (state.closed) {
          state.status = {};
        }
      }
    },
    clearUploads(state) {
      state.uploading = false;
      state.status = {};
      state.numUploading = 0;
    },
    setClosed(state) {
      state.closed = true;
    },
  },
});

export const { uploadStarted, uploadFinished, uploadFailed, clearUploads, setClosed } = uploadSlice.actions;

export default uploadSlice.reducer;

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
