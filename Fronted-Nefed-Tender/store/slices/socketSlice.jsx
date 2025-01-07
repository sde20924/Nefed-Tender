import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    socket_instance: null,
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket_instance = action.payload;
    },
    clearSocket: (state) => {
      state.instance = null;
    },
  },
});

export const { setSocket, clearSocket } = socketSlice.actions;
export default socketSlice.reducer;
