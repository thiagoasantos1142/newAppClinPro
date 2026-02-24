import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingAccountIntroScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const progressPercent = status?.progress_percent ?? 0;

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (!canAccessStep(status, 'account_intro')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleActivate = useCallback(async () => {
    try {
      if (loading || !status) {
        return;
      }
      if (status.current_step !== 'account_intro') {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      if (status?.steps?.account_intro) {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      const result = await completeStep('account_intro', { understood: true, accept_terms: true });
      navigation.navigate(getRouteForStep(result.current_step));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, loading]);

  const handleSkip = useCallback(() => {
    Alert.alert('Etapa obrigatoria', 'Para seguir, precisamos concluir esta etapa.' );
  }, []);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Fase 3 - Receber com Seguranca"
      subtitle="Receba direto no app, sem depender de terceiros 💳"
      hero={{
        title: 'Progresso da jornada',
        value: `${progressPercent}%`,
        progress: progressPercent,
        note: 'Conquista desbloqueada: Conta Ativada.',
      }}
      sections={[
        {
          title: 'Com a conta digital voce:',
          body: '✔ Recebe via Pix\n✔ Organiza seus ganhos\n✔ Separa vida pessoal do trabalho',
        },
      ]}
      actions={[
        { label: 'Ativar minha conta', onPress: handleActivate, icon: 'arrow-right', disabled: loading || !status },
        { label: 'Deixar para depois', onPress: handleSkip, variant: 'secondary', icon: 'clock', disabled: loading || !status },
      ]}
    />
  );
}