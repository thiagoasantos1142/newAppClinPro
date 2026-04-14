import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingMEIScreen({ navigation }) {
  const { status, loading } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 6;
  const currentStepNumber = 5;

  const options = [
    { value: 'sim', label: 'Sim' },
    { value: 'processo', label: 'Estou no processo' },
    { value: 'nao', label: 'Ainda nao' },
  ];

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
    // Tela legada: serve como transição de UX e não representa etapa própria no contrato.
    if (status.current_step !== 'profile' && status.current_step !== 'account_intro') {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    if (!selectedOption) return;
    try {
      setError(null);
      navigation.navigate('OnboardingFirstAction');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erro ao salvar resposta.';
      setError(message);
    }
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={currentStepNumber}
      totalSteps={totalSteps}
      headerEmoji="📋"
      headerText="Formalizacao profissional"
      headerTitle="Vamos regularizar"
      headerImageUrl="https://images.unsplash.com/photo-1635442962671-584193cdf451?auto=format&fit=crop&w=1080&q=80"
      questionText="Voce ja e MEI?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={setSelectedOption}
      microText="Podemos te orientar nisso depois"
      onContinue={handleContinue}
      isButtonLoading={loading}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
