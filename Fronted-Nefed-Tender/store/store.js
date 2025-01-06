import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import profileReducer from "./slices/profileSlice";
import buyersReducer from "./slices/buyersSlice";
import sellersReducer from "./slices/sellerSlice";
import managersReducer from "./slices/managersSlice";
import clientsReducer from "./slices/clientsSlice";
import socketReducer from "./slices/socketSlice";
import notificationReducer from "./slices/notificationSlice";

const persistConfig = {
  key: "notifications",
  storage,
  whitelist: ["notifications"],
};

const rootReducer = combineReducers({
  notifications: notificationReducer,
  profileData: profileReducer,
  buyers: buyersReducer,
  sellers: sellersReducer,
  managers: managersReducer,
  clients: clientsReducer,
  socket: socketReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
