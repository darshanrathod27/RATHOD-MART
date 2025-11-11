// rathod-mart/src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../data/api"; // Import your customer api instance

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  isAuthenticated: localStorage.getItem("userInfo") ? true : false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
};

// NEW: Async thunk to check auth status
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
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout(state) {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.status = "idle";
      localStorage.removeItem("userInfo");
    },
  },
  // NEW: Handle the thunk's lifecycle
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

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
