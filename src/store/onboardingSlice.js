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

function mergeCompletedStepIntoStatus(previousStatus, result, completedStep) {
  const nextStatus = {
    ...(previousStatus && typeof previousStatus === 'object' ? previousStatus : {}),
    ...(result && typeof result === 'object' ? result : {}),
  };

  const previousSteps =
    previousStatus?.steps && typeof previousStatus.steps === 'object' ? previousStatus.steps : {};
  const resultSteps = result?.steps && typeof result.steps === 'object' ? result.steps : {};

  nextStatus.steps = {
    ...previousSteps,
    ...resultSteps,
    ...(completedStep ? { [completedStep]: true } : {}),
  };

  return normalizeOnboardingStatus(nextStatus);
}

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
    condition: (arg, { getState }) => {
      const { onboarding, auth } = getState();
      const ignoreLoading = Boolean(arg?.ignoreLoading);

      if (!auth?.token) {
        return false;
      }

      if (onboarding?.loading && !ignoreLoading) {
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
      try {
        await dispatch(refreshOnboarding({ ignoreLoading: true })).unwrap();
      } catch (refreshError) {
        console.error('[onboardingSlice] erro ao atualizar status apos concluir step', {
          step,
          message: refreshError?.message,
          payload: refreshError?.response?.data,
          status: refreshError?.response?.status,
        });
        // Alguns ambientes ainda falham ao consultar o status logo apos concluir um step.
        // Mantemos o fluxo seguindo com o retorno da propria conclusao.
      }
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
    saving: false,
    error: null,
  },
  reducers: {
    resetOnboardingState: () => ({
      status: null,
      loading: false,
      saving: false,
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
        state.saving = true;
        state.error = null;
      })
      .addCase(completeOnboardingStep.fulfilled, (state, action) => {
        const completedStep = action.meta?.arg?.step;
        const result = action.payload;
        state.status = mergeCompletedStepIntoStatus(state.status, result, completedStep);
        state.saving = false;
        state.error = null;
      })
      .addCase(completeOnboardingStep.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Erro ao salvar onboarding.';
      });
  },
});

export const { resetOnboardingState } = onboardingSlice.actions;
export default onboardingSlice.reducer;
