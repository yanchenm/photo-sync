import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type AlertType = 'negative' | 'positive';

type AlertState = {
  showAlert: boolean;
  alertType: AlertType | null;
  alertTitle: string;
  alertMessage: string;
  onAlertClick?: () => void;
};

type SendAlertPayload = {
  type: AlertType;
  title: string;
  message: string;
  onClick?: () => void;
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
      state.onAlertClick = action.payload.onClick;
    },
    clearAlert(state) {
      state.showAlert = false;
      state.onAlertClick = undefined;
    },
  },
});

export const { sendAlert, clearAlert } = alertSlice.actions;

export default alertSlice.reducer;
