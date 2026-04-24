import { createSlice } from '@reduxjs/toolkit';

const emptyForm = {
  name: '',
  birthDate: '',
  email: '',
  mobilePhone: '',
  cpfCnpj: '',
  address: '',
  addressNumber: '',
  complement: '',
  province: '',
  postalCode: '',
  city: '',
  state: '',
  incomeValue: '',
};

const initialState = {
  form: emptyForm,
  currentStep: 0,
  selectedPhoneCountryCode: 'BR',
  hydrated: false,
  accessUnlockedAt: null,
  providerBalance: {
    availableBalance: null,
    pendingBalance: null,
    lastUpdate: null,
    loadedAt: null,
  },
};

const digitalAccountSlice = createSlice({
  name: 'digitalAccount',
  initialState,
  reducers: {
    hydrateDigitalAccountDraft(state, action) {
      state.form = {
        ...emptyForm,
        ...(action.payload?.form || {}),
      };
      state.currentStep = Number.isInteger(action.payload?.currentStep) ? action.payload.currentStep : 0;
      state.selectedPhoneCountryCode = action.payload?.selectedPhoneCountryCode || 'BR';
      state.hydrated = true;
    },
    updateDigitalAccountField(state, action) {
      const field = action.payload?.field;
      if (!field) return;
      state.form[field] = action.payload?.value ?? '';
    },
    setDigitalAccountStep(state, action) {
      state.currentStep = Math.max(0, Number(action.payload) || 0);
    },
    setDigitalAccountPhoneCountry(state, action) {
      state.selectedPhoneCountryCode = action.payload || 'BR';
    },
    grantDigitalAccountAccess(state, action) {
      state.accessUnlockedAt = Number(action.payload) || Date.now();
    },
    clearDigitalAccountAccess(state) {
      state.accessUnlockedAt = null;
    },
    setDigitalAccountProviderBalance(state, action) {
      const payload = action.payload || {};
      state.providerBalance = {
        availableBalance: Number(payload.availableBalance ?? 0),
        pendingBalance: Number(payload.pendingBalance ?? 0),
        lastUpdate: payload.lastUpdate || 'Atualizado agora',
        loadedAt: payload.loadedAt || Date.now(),
      };
    },
    resetDigitalAccountDraft() {
      return initialState;
    },
  },
});

export const {
  hydrateDigitalAccountDraft,
  updateDigitalAccountField,
  setDigitalAccountStep,
  setDigitalAccountPhoneCountry,
  grantDigitalAccountAccess,
  clearDigitalAccountAccess,
  setDigitalAccountProviderBalance,
  resetDigitalAccountDraft,
} = digitalAccountSlice.actions;

export const selectDigitalAccountProviderBalance = (state) => state.digitalAccount?.providerBalance || initialState.providerBalance;

export default digitalAccountSlice.reducer;
