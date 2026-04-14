import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';

export default function OnboardingFirstActionScreen({ navigation }) {
  const { status, loading } = useOnboarding();

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
