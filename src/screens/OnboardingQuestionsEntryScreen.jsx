import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';
import { colors } from '../theme/tokens';

/**
 * Entry point para o fluxo de questions
 * Valida o acesso e navega para a primeira tela (QuestionsClients)
 */
export default function OnboardingQuestionsEntryScreen({ navigation }) {
  const { status } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!status) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    // Se onboarding está completo, vai para MainTabs
    if (status.completed) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return;
    }

    // Se não está no step "questions", redireciona para o step correto
    if (status.current_step !== 'questions') {
      navigation.replace(getRouteForStep(status.current_step));
      return;
    }

    // Navega para a primeira tela do fluxo de questions
    navigation.replace('QuestionsClients');
  }, [status, navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.mutedForeground }}>Carregando...</Text>
      </View>
    );
  }

  return null;
}
