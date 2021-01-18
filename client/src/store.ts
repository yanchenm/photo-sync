import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import uploadReducer from './uploads/uploadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
