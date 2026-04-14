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
  resetDigitalAccountDraft,
} = digitalAccountSlice.actions;

export default digitalAccountSlice.reducer;
