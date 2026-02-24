import React, { useEffect } from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingQuestionsCompleteScreen({ navigation }) {
  const { status, loading } = useOnboarding();

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    const canShow = status.steps?.questions && status.current_step === 'profile';
    if (!canShow) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Parabens!"
      subtitle="Voce concluiu o primeiro passo da sua jornada."
      sections={[
        {
          title: 'Proxima etapa',
          body: 'Agora vamos ativar seu perfil para comecar a crescer.',
        },
      ]}
      actions={[{ label: 'Completar meu perfil', route: 'OnboardingProfile', icon: 'user', disabled: loading || !status }]}
    />
  );
}
