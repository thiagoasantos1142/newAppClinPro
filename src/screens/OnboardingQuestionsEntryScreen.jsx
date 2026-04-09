import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';
import { colors } from '../theme/tokens';

export default function OnboardingQuestionsEntryScreen({ navigation }) {
  const { status } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);
  const didRedirect = useRef(false);

  useEffect(() => {
    console.log('[OnboardingQuestionsEntry] status:', status);

    if (!status) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    if (didRedirect.current) {
      return;
    }

    if (status.completed) {
      console.log('[OnboardingQuestionsEntry] onboard completed, going to MainTabs');
      didRedirect.current = true;
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return;
    }

    // Se o backend ainda retorna "welcome" mas a etapa ja foi concluida,
    // liberamos o fluxo de questions.
    if (status.current_step !== 'questions') {
      if (status.current_step === 'welcome' && status?.steps?.welcome) {
        console.log('[OnboardingQuestionsEntry] welcome done, forcing QuestionsClients');
        didRedirect.current = true;
        navigation.reset({
          index: 0,
          routes: [{ name: 'QuestionsClients' }],
        });
        return;
      }

      console.log('[OnboardingQuestionsEntry] redirecting to current step', status.current_step);
      didRedirect.current = true;
      navigation.reset({
        index: 0,
        routes: [{ name: getRouteForStep(status.current_step) }],
      });
      return;
    }

    console.log('[OnboardingQuestionsEntry] navigating to QuestionsClients');
    didRedirect.current = true;
    navigation.reset({
      index: 0,
      routes: [{ name: 'QuestionsClients' }],
    });
  }, [status, navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.mutedForeground }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 12, color: colors.mutedForeground }}>Redirecionando...</Text>
    </View>
  );
}
