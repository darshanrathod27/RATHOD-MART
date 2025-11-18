// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../data/api";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  isAuthenticated: localStorage.getItem("userInfo") ? true : false,
  status: "idle",
  isLoginDrawerOpen: false, // NEW STATE
};

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Auth failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.isLoginDrawerOpen = false; // Close drawer on login
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout(state) {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.isLoginDrawerOpen = false;
      localStorage.removeItem("userInfo");
    },
    openLoginDrawer: (state) => {
      state.isLoginDrawerOpen = true;
    },
    closeLoginDrawer: (state) => {
      state.isLoginDrawerOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.userInfo = null;
        state.isAuthenticated = false;
        state.status = "failed";
        localStorage.removeItem("userInfo");
      });
  },
});

export const { setCredentials, logout, openLoginDrawer, closeLoginDrawer } =
  authSlice.actions;
export default authSlice.reducer;
