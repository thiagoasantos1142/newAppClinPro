import { createSlice } from '@reduxjs/toolkit';

export const PIX_KEYS_MAX_COUNT = 5;
export const PIX_KEY_CREATION_COOLDOWN_MS = 60 * 1000;

const initialState = {
  totalKeys: 0,
  lastCreatedAt: null,
};

const pixKeysSlice = createSlice({
  name: 'pixKeys',
  initialState,
  reducers: {
    setPixKeysInventory(state, action) {
      state.totalKeys = Math.max(0, Number(action.payload) || 0);
    },
    registerPixKeyCreated(state, action) {
      state.lastCreatedAt = Number(action.payload) || Date.now();
    },
    registerPixKeyRemoved(state) {
      state.totalKeys = Math.max(0, state.totalKeys - 1);
    },
    resetPixKeysState: () => initialState,
  },
});

export const selectPixKeysTotal = (state) => state.pixKeys?.totalKeys ?? 0;
export const selectPixKeyLastCreatedAt = (state) => state.pixKeys?.lastCreatedAt ?? null;
export const selectPixKeysRemainingCooldownMs = (state, now = Date.now()) => {
  const lastCreatedAt = selectPixKeyLastCreatedAt(state);

  if (!lastCreatedAt) {
    return 0;
  }

  return Math.max(0, lastCreatedAt + PIX_KEY_CREATION_COOLDOWN_MS - now);
};

export const {
  setPixKeysInventory,
  registerPixKeyCreated,
  registerPixKeyRemoved,
  resetPixKeysState,
} = pixKeysSlice.actions;

export default pixKeysSlice.reducer;
