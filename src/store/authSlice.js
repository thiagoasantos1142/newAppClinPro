import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
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
      state.user = action.payload?.user ?? null;
    },
    clearAuthSession(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
    },
  },
});

export const { setAuthLoading, setAuthSession, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
