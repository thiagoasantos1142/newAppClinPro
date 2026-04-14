import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingClientsScreen({ navigation }) {
  const { status, loading } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const options = [
    { value: 'varios', label: 'Sim, varios' },
    { value: 'alguns', label: 'Sim, alguns' },
    { value: 'nenhum', label: 'Ainda nao' },
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
    // This screen is within the profile step, so we only show if current_step is profile
    if (status.current_step !== 'profile') {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    if (!selectedOption) return;
    try {
      setError(null);
      navigation.navigate('OnboardingExperience');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erro ao salvar resposta.';
      setError(message);
    }
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={2}
      totalSteps={6}
      headerEmoji="💜"
      headerText="Entendendo sua estabilidade"
      headerTitle="Vamos mapear seus clientes"
      headerImageUrl="https://images.unsplash.com/photo-1624625021869-c08eef7f1ccf?auto=format&fit=crop&w=1080&q=80"
      questionText="Voce ja tem clientes fixos?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={setSelectedOption}
      microText="Clientes fixos trazem estabilidade"
      onContinue={handleContinue}
      isButtonLoading={loading}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
