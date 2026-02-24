import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import questionsFlowReducer from './questionsFlowSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questionsFlow: questionsFlowReducer,
  },
});

export default store;
