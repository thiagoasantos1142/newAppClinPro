import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';

export default function OnboardingFirstGoalScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();

  const handleContinue = useCallback(async () => {
    try {
      if (saving || !status) {
        return;
      }
      await completeStep('goal', {
        goal_type: 'services_count',
        target_value: 10,
        period: 'first_month',
      });
      navigation.navigate('OnboardingTutorial');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, saving]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Primeira Meta"
      subtitle="Defina seu objetivo inicial"
      sections={[{ title: 'Sugestão', body: 'Meta recomendada: concluir 10 serviços com nota acima de 4.8 no primeiro mês.' }]}
      actions={[{ label: 'Continuar', onPress: handleContinue, icon: 'arrow-right', disabled: saving || !status }]}
    />
  );
}
