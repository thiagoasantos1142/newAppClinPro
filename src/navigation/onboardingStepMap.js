export const onboardingStepToRoute = {
  welcome: 'OnboardingWelcome',
  questions: 'QuestionsClients',
  profile: 'OnboardingProfile',
  account_intro: 'OnboardingAccountIntro',
  kyc: 'OnboardingKYC',
  goal: 'OnboardingFirstGoal',
  tutorial: 'OnboardingTutorial',
};

export const getRouteForStep = (step) => onboardingStepToRoute[step] || 'OnboardingWelcome';

export const canAccessStep = (status, step) => Boolean(status?.steps?.[step] || status?.current_step === step);
