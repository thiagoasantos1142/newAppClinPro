export const FORCE_ONBOARDING_ACTIVE = false;

export function getForcedOnboardingStatus(status) {
  if (!FORCE_ONBOARDING_ACTIVE || !status || typeof status !== 'object') {
    return status;
  }

  const steps = status.steps && typeof status.steps === 'object' ? { ...status.steps } : {};
  const currentStep = status.current_step || 'welcome';

  // Quando o onboarding ja terminou, mantemos o fluxo acessivel para edicao/teste.
  if (status.completed) {
    if (currentStep === 'welcome') {
      steps.welcome = false;
    }

    return {
      ...status,
      completed: false,
      current_step: currentStep,
      steps,
    };
  }

  return {
    ...status,
    current_step: currentStep,
    steps,
  };
}
