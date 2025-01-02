import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./slices/profileSlice";
import buyersReducer from "./slices/buyersSlice";
import sellersReducer from "./slices/sellerSlice";
import managersReducer from "./slices/managersSlice";
import clientsReducer from "./slices/clientsSlice";
import socketReducer from "./slices/socketSlice";
export const store = configureStore({
  reducer: {
    profileData: profileReducer,
    buyers: buyersReducer,
    sellers: sellersReducer,
    managers: managersReducer,
    clients: clientsReducer,
    socket: socketReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
