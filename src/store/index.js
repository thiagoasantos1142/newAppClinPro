import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import digitalAccountReducer from './digitalAccountSlice';
import globalLoadingReducer from './globalLoadingSlice';
import onboardingReducer from './onboardingSlice';
import questionsFlowReducer from './questionsFlowSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    digitalAccount: digitalAccountReducer,
    globalLoading: globalLoadingReducer,
    onboarding: onboardingReducer,
    questionsFlow: questionsFlowReducer,
  },
});

export default store;
