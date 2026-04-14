import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import globalLoadingReducer from './globalLoadingSlice';
import onboardingReducer from './onboardingSlice';
import questionsFlowReducer from './questionsFlowSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    globalLoading: globalLoadingReducer,
    onboarding: onboardingReducer,
    questionsFlow: questionsFlowReducer,
  },
});

export default store;
