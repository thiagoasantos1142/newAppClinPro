import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_MESSAGE = 'Carregando...';

const globalLoadingSlice = createSlice({
  name: 'globalLoading',
  initialState: {
    visible: false,
    message: DEFAULT_MESSAGE,
    pendingCount: 0,
  },
  reducers: {
    showGlobalLoading: (state, action) => {
      state.pendingCount += 1;
      state.visible = true;
      state.message = action.payload?.message || state.message || DEFAULT_MESSAGE;
    },
    hideGlobalLoading: (state) => {
      state.pendingCount = Math.max(0, state.pendingCount - 1);
      state.visible = state.pendingCount > 0;

      if (!state.visible) {
        state.message = DEFAULT_MESSAGE;
      }
    },
    resetGlobalLoading: () => ({
      visible: false,
      message: DEFAULT_MESSAGE,
      pendingCount: 0,
    }),
  },
});

export const {
  showGlobalLoading,
  hideGlobalLoading,
  resetGlobalLoading,
} = globalLoadingSlice.actions;

export default globalLoadingSlice.reducer;
