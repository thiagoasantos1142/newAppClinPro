export const onboardingStepToRoute = {
  welcome: 'OnboardingWelcome',
  questions: 'QuestionsClients',
  profile: 'OnboardingProfile',
  select_day_of_week: 'OnboardingSelectDayOfWeek',
  kyc: 'OnboardingKYC',
  tutorial: 'OnboardingTutorial',
};

export const getRouteForStep = (step) => onboardingStepToRoute[step] || 'OnboardingWelcome';

export const canAccessStep = (status, step) => Boolean(status?.steps?.[step] || status?.current_step === step);
