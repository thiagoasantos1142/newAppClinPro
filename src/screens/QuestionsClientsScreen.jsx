import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';
import { useOnboarding } from '../hooks/useOnboarding';

export default function QuestionsClientsScreen({ navigation }) {
  const { status } = useOnboarding();
  const { questionsData, updateQuestionsData } = useQuestionsFlow();
  const [selectedOption, setSelectedOption] = useState(questionsData.clients ?? null);
  const [error] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 7;
  const completedSteps = status?.steps ? Object.values(status.steps).filter(Boolean).length : 0;
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);

  const options = [
    { value: 'varios', label: 'Sim, vários' },
    { value: 'alguns', label: 'Sim, alguns' },
    { value: 'nenhum', label: 'Ainda não' },
  ];

  useEffect(() => {
    if (status) {
      setIsInitialLoading(false);
    }
  }, [status]);

  const handleSelectOption = useCallback(
    (value) => {
      setSelectedOption(value);
      updateQuestionsData('clients', value);
    },
    [updateQuestionsData]
  );

  const handleContinue = useCallback(() => {
    if (!selectedOption) return;
    navigation.navigate('QuestionsExperience');
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={currentStepNumber}
      totalSteps={totalSteps}
      headerEmoji="💜"
      headerText="Entendendo sua estabilidade"
      headerTitle="Vamos mapear seus clientes"
      headerImageUrl="https://images.unsplash.com/photo-1624625021869-c08eef7f1ccf?auto=format&fit=crop&w=1080&q=80"
      questionText="Você já tem clientes fixos?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={handleSelectOption}
      microText="Clientes fixos trazem estabilidade 💡"
      buttonText="Próximo"
      onContinue={handleContinue}
      isButtonLoading={false}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
