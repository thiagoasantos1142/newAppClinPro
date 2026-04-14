import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  completeOnboardingStep as completeOnboardingStepThunk,
  refreshOnboarding,
} from '../store/onboardingSlice';
import { getForcedOnboardingStatus } from '../config/onboardingDev';

export const useOnboarding = () => {
  const dispatch = useDispatch();
  const state = useSelector((rootState) => rootState.onboarding);
  const effectiveStatus = getForcedOnboardingStatus(state.status);

  return useMemo(
    () => ({
      ...state,
      status: effectiveStatus,
      refresh: () => dispatch(refreshOnboarding()).unwrap(),
      completeStep: (step, answers) =>
        dispatch(completeOnboardingStepThunk({ step, answers })).unwrap(),
    }),
    [dispatch, effectiveStatus, state]
  );
};
