import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import digitalAccountReducer from './digitalAccountSlice';
import globalLoadingReducer from './globalLoadingSlice';
import onboardingReducer from './onboardingSlice';
import pixKeysReducer from './pixKeysSlice';
import questionsFlowReducer from './questionsFlowSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    digitalAccount: digitalAccountReducer,
    globalLoading: globalLoadingReducer,
    onboarding: onboardingReducer,
    pixKeys: pixKeysReducer,
    questionsFlow: questionsFlowReducer,
  },
});

export default store;
