import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingFirstGoalScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (!canAccessStep(status, 'goal')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    try {
      if (loading || !status) {
        return;
      }
      if (status.current_step !== 'goal') {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      if (status?.steps?.goal) {
        navigation.navigate('MainTabs');
        return;
      }
      const result = await completeStep('goal', {});
      if (result.completed) {
        navigation.navigate('MainTabs');
        return;
      }
      navigation.navigate(getRouteForStep(result.current_step));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, loading]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Primeira Meta"
      subtitle="Defina seu objetivo inicial"
      sections={[{ title: 'Sugestão', body: 'Meta recomendada: concluir 10 serviços com nota acima de 4.8 no primeiro mês.' }]}
      actions={[{ label: 'Continuar', onPress: handleContinue, icon: 'arrow-right', disabled: loading || !status }]}
    />
  );
}