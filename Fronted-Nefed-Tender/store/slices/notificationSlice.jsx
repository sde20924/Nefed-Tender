import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    Notifications: [],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.Notifications = [...state.Notifications, action.payload];
    },
    removeNotificationsByIndex: (state, action) => {
      state.Notifications = state.Notifications.filter(
        (n, index) => index !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.Notifications = [];
    },
  },
});

export const {
  setNotifications,
  removeNotificationsByIndex,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
