import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';

export default function OnboardingTutorialScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();

  const handleFinish = useCallback(async () => {
    try {
      if (saving || !status) {
        return;
      }
      await completeStep('tutorial', { completed: true });
      navigation.navigate('MainTabs');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, saving]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Tutorial Inicial"
      subtitle="Você está pronta para começar"
      sections={[{ title: 'Resumo', body: 'Navegue pelos módulos de Serviços, Agenda, Comunidade e Financeiro para iniciar sua operação.' }]}
      actions={[{ label: 'Ir para Home', onPress: handleFinish, icon: 'home', disabled: saving || !status }]}
    />
  );
}
