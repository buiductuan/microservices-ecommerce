import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed';
  recipientId: string;
  createdAt: string;
  sentAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  currentNotification: Notification | null;
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: NotificationState = {
  notifications: [],
  currentNotification: null,
  isLoading: false,
  error: null,
  total: 0,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params: { page?: number; limit?: number; type?: string; status?: string }) => {
    const response = await notificationService.getNotifications(params);
    return response;
  }
);

export const sendNotification = createAsyncThunk(
  'notification/sendNotification',
  async (notificationData: Omit<Notification, 'id' | 'status' | 'createdAt' | 'sentAt'>) => {
    const response = await notificationService.sendNotification(notificationData);
    return response;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentNotification: (state, action) => {
      state.currentNotification = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      });
  },
});

export const { clearError, setCurrentNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
