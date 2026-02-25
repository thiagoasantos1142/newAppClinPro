import React, { useEffect, useState } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { ActivityIndicator, Text, View } from 'react-native';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';
import { colors } from '../theme/tokens';

type Props = { navigation: NavigationProp<any> };

export default function OnboardingQuestionsEntryScreen({ navigation }: Props) {
  const { status } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!status) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    if (status.completed) {
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
          navigation.replace('QuestionsClients');
          return;
        }
      navigation.replace(getRouteForStep(status.current_step));
      return;
    }

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
