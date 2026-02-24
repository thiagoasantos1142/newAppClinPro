import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useOnboarding } from '../hooks/useOnboarding';
import { getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingExperienceScreen({ navigation }) {
  const { status, loading } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 7;
  const completedSteps = status?.steps ? Object.values(status.steps).filter(Boolean).length : 0;
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);

  const options = [
    { value: 'iniciante', label: 'Estou comecando agora' },
    { value: 'menos-1-ano', label: 'Menos de 1 ano' },
    { value: '1-3-anos', label: '1 a 3 anos' },
    { value: 'mais-3-anos', label: 'Mais de 3 anos' },
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
    // This screen is within the profile step
    if (status.current_step !== 'profile') {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    if (!selectedOption) return;
    try {
      setError(null);
      navigation.navigate('OnboardingGoal');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erro ao salvar resposta.';
      setError(message);
    }
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={currentStepNumber}
      totalSteps={totalSteps}
      headerEmoji="⭐"
      headerText="Conhecendo sua jornada"
      headerTitle="Sua experiencia importa"
      headerImageUrl="https://images.unsplash.com/photo-1587567971815-03f434c18a09?auto=format&fit=crop&w=1080&q=80"
      questionText="Ha quanto tempo voce trabalha como diarista?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={setSelectedOption}
      microText="Toda experiencia e valiosa"
      onContinue={handleContinue}
      isButtonLoading={loading}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
