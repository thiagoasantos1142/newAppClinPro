export type OnboardingStep =
  | 'welcome'
  | 'questions'
  | 'profile'
  | 'account_intro'
  | 'kyc'
  | 'goal'
  | 'tutorial';

export interface OnboardingStatusData {
  completed: boolean;
  current_step: OnboardingStep;
  progress_percent: number;
  steps: Record<OnboardingStep, boolean>;
}

export interface OnboardingStatusResponse {
  success: boolean;
  message: string;
  data: OnboardingStatusData;
}

export interface CompleteStepResponse {
  success: boolean;
  message: string;
  data: {
    completed: boolean;
    current_step: OnboardingStep;
    progress_percent: number;
  };
}
