import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  completeOnboardingStep as completeOnboardingStepThunk,
  refreshOnboarding,
} from '../store/onboardingSlice';

export const useOnboarding = () => {
  const dispatch = useDispatch();
  const state = useSelector((rootState) => rootState.onboarding);

  return useMemo(
    () => ({
      ...state,
      refresh: (arg) => dispatch(refreshOnboarding(arg)).unwrap(),
      completeStep: (step, answers) =>
        dispatch(completeOnboardingStepThunk({ step, answers })).unwrap(),
    }),
    [dispatch, state]
  );
};
