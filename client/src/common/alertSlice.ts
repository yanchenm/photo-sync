import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type AlertType = 'negative' | 'positive';

type AlertState = {
  showAlert: boolean;
  alertType: AlertType | null;
  alertTitle: string;
  alertMessage: string;
};

type SendAlertPayload = {
  type: AlertType;
  title: string;
  message: string;
};

const initialState = {
  showAlert: false,
  alertType: null,
  alertTitle: '',
  alertMessage: '',
} as AlertState;

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    sendAlert(state, action: PayloadAction<SendAlertPayload>) {
      state.showAlert = true;
      state.alertType = action.payload.type;
      state.alertTitle = action.payload.title;
      state.alertMessage = action.payload.message;
    },
    clearAlert(state) {
      state.showAlert = false;
      state.alertType = null;
      state.alertTitle = '';
      state.alertMessage = '';
    },
  },
});

export const { sendAlert, clearAlert } = alertSlice.actions;

export default alertSlice.reducer;
