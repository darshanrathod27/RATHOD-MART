// rathod-mart/src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // You can add cart/wishlist reducers here later
  },
  devTools: process.env.NODE_ENV !== "production",
});
