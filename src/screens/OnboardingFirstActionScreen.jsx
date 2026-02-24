import React, { useEffect } from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingFirstActionScreen({ navigation }) {
  const { status, loading } = useOnboarding();

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    const canShow = status.steps?.profile && status.current_step === 'account_intro';
    if (!canShow) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Sua primeira ação 💙"
      subtitle="Vamos dar o primeiro passo juntas"
      sections={[
        {
          title: 'Escolha o que faz sentido agora',
          body: 'Essas acoes ja colocam você em movimento no app.',
        },
      ]}
      actions={[
        { label: 'Ativar disponibilidade', route: 'WeeklySchedule', icon: 'calendar', disabled: loading || !status },
        { label: 'Ver oportunidades na sua regiao', route: 'AvailableServicesImproved', icon: 'map-pin', disabled: loading || !status },
        { label: 'Continuar onboarding', route: 'OnboardingAccountIntro', variant: 'secondary', icon: 'arrow-right', disabled: loading || !status },
      ]}
    />
  );
}
