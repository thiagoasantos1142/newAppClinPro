import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  clinProAccess: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
    setAuthSession(state, action) {
      state.token = action.payload?.token ?? null;
      state.refreshToken = action.payload?.refreshToken ?? null;
      state.user = action.payload?.user ?? null;
      state.clinProAccess = action.payload?.clinProAccess ?? null;
    },
    clearAuthSession(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.clinProAccess = null;
      state.loading = false;
    },
  },
});

export const { setAuthLoading, setAuthSession, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
