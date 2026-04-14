import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingGoalScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 6;
  const currentStepNumber = 4;

  const options = [
    { value: 'ate-2000', label: 'Ate R$ 2.000' },
    { value: '2000-4000', label: 'R$ 2.000 a R$ 4.000' },
    { value: '4000-6000', label: 'R$ 4.000 a R$ 6.000' },
    { value: 'acima-6000', label: 'Acima de R$ 6.000' },
  ];

  const goalPayloadMap = {
    'ate-2000': { goal_type: 'income', target_value: 2000, period: 'first_month' },
    '2000-4000': { goal_type: 'income', target_value: 4000, period: 'first_month' },
    '4000-6000': { goal_type: 'income', target_value: 6000, period: 'first_month' },
    'acima-6000': { goal_type: 'income', target_value: 7000, period: 'first_month' },
  };

  useEffect(() => {
    if (!status) {
      setIsInitialLoading(true);
      return;
    }
    setIsInitialLoading(false);
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (status.current_step !== 'goal') {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    if (!selectedOption) return;
    try {
      setError(null);
      await completeStep('goal', goalPayloadMap[selectedOption] || goalPayloadMap['ate-2000']);
      navigation.navigate('OnboardingMEI');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erro ao salvar resposta.';
      setError(message);
    }
  }, [selectedOption, completeStep, navigation]);

  return (
    <QuestionCard
      currentStepNumber={currentStepNumber}
      totalSteps={totalSteps}
      headerEmoji="🎯"
      headerText="Vamos sonhar junto"
      headerTitle="Suas metas importam"
      headerImageUrl="https://images.unsplash.com/photo-1661903574853-d722c40fe0a0?auto=format&fit=crop&w=1080&q=80"
      questionText="Quanto voce gostaria de ganhar por mes?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={setSelectedOption}
      microText="Com organizacao e visibilidade, isso e possivel"
      onContinue={handleContinue}
      isButtonLoading={loading}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
