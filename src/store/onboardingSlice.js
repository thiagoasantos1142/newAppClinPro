import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  completeOnboardingStep as completeOnboardingStepApi,
  getOnboardingStatus as getOnboardingStatusApi,
} from '../services/modules/onboarding.service';

const ONBOARDING_ORDER = [
  'welcome',
  'questions',
  'profile',
  'account_intro',
  'kyc',
  'goal',
  'tutorial',
];

function normalizeOnboardingStatus(status) {
  if (!status || typeof status !== 'object') return status;
  const steps = status.steps || {};
  const currentStep = status.current_step;

  if (currentStep && steps[currentStep] === false) {
    return status;
  }

  const nextPendingStep = ONBOARDING_ORDER.find((step) => steps[step] === false);
  if (!nextPendingStep) {
    return status;
  }

  return {
    ...status,
    current_step: nextPendingStep,
  };
}

const getErrorMessage = (err) => {
  if (err && typeof err === 'object') {
    const message = err.response?.data?.message;
    if (message) return message;
  }
  return err instanceof Error ? err.message : 'Erro inesperado.';
};

export const refreshOnboarding = createAsyncThunk(
  'onboarding/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const status = await getOnboardingStatusApi();
      return normalizeOnboardingStatus(status);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: (_, { getState }) => {
      const { onboarding, auth } = getState();

      if (!auth?.token) {
        return false;
      }

      if (onboarding?.loading) {
        return false;
      }

      return true;
    },
  }
);

export const completeOnboardingStep = createAsyncThunk(
  'onboarding/completeStep',
  async ({ step, answers }, { dispatch, rejectWithValue }) => {
    try {
      const result = await completeOnboardingStepApi(step, answers);
      await dispatch(refreshOnboarding()).unwrap();
      return result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    status: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetOnboardingState: () => ({
      status: null,
      loading: false,
      error: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshOnboarding.fulfilled, (state, action) => {
        state.status = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao carregar onboarding.';
      })
      .addCase(completeOnboardingStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeOnboardingStep.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(completeOnboardingStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao salvar onboarding.';
      });
  },
});

export const { resetOnboardingState } = onboardingSlice.actions;
export default onboardingSlice.reducer;
