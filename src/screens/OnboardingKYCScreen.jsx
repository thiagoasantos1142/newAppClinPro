import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingKYCScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (!canAccessStep(status, 'kyc')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    try {
      if (loading || !status) {
        return;
      }
      if (status.current_step !== 'kyc') {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      if (status?.steps?.kyc) {
        navigation.navigate('MainTabs');
        return;
      }
      const result = await completeStep('kyc', {});
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
      title="Validação de Identidade"
      subtitle="Etapa KYC"
      sections={[{ title: 'Documentos', items: [
        { label: 'RG/CNH', value: 'Obrigatório' },
        { label: 'Selfie', value: 'Obrigatório' },
      ]}]}
      actions={[{ label: 'Proximo', onPress: handleContinue, icon: 'arrow-right', disabled: loading || !status }]}
    />
  );
}