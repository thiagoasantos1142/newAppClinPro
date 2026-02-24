import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingTutorialScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (!canAccessStep(status, 'tutorial')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleFinish = useCallback(async () => {
    try {
      if (loading || !status) {
        return;
      }
      if (status.current_step !== 'tutorial') {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      if (status?.steps?.tutorial) {
        navigation.navigate('MainTabs');
        return;
      }
      await completeStep('tutorial', { completed: true });
      navigation.navigate('MainTabs');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, loading]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Tutorial Inicial"
      subtitle="Você está pronta para começar"
      sections={[{ title: 'Resumo', body: 'Navegue pelos módulos de Serviços, Agenda, Comunidade e Financeiro para iniciar sua operação.' }]}
      actions={[{ label: 'Ir para Home', onPress: handleFinish, icon: 'home', disabled: loading || !status }]}
    />
  );
}