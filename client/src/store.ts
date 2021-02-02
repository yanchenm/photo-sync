import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';

import alertReducer from './common/alertSlice';
import authReducer from './auth/authSlice';
import uploadReducer from './uploads/uploadSlice';

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
