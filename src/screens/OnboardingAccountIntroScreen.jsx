import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { useOnboarding } from '../hooks/useOnboarding';

export default function OnboardingAccountIntroScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();
  const progressPercent = status?.progress_percent ?? 0;

  const handleActivate = useCallback(async () => {
    try {
      if (saving || !status) {
        return;
      }
      await completeStep('account_intro', { understood: true, accept_terms: true });
      navigation.navigate('OnboardingKYC');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, saving]);

  const handleSkip = useCallback(() => {
    Alert.alert('Etapa obrigatoria', 'Para seguir, precisamos concluir esta etapa.' );
  }, []);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Conta digital"
      subtitle="Receba com seguranca direto pelo app."
      hero={{
        title: 'Fase 3 da jornada',
        value: `${progressPercent}%`,
        progress: progressPercent,
        note: 'Ative sua conta para organizar ganhos e receber com mais controle.',
      }}
      sections={[
        {
          title: 'Com a conta digital voce:',
          body: '✔ Recebe via Pix\n✔ Organiza seus ganhos\n✔ Separa vida pessoal do trabalho',
        },
      ]}
      actions={[
        { label: 'Ativar minha conta', onPress: handleActivate, icon: 'arrow-right', disabled: saving || !status },
        { label: 'Deixar para depois', onPress: handleSkip, variant: 'secondary', icon: 'clock', disabled: saving || !status },
      ]}
    />
  );
}
