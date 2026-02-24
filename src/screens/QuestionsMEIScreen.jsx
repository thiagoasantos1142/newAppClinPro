import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard.jsx';
import { useQuestionsFlow } from '../context/QuestionsFlowContext';
import { useOnboarding } from '../hooks/useOnboarding';

export default function QuestionsMEIScreen({ navigation }) {
  const { status } = useOnboarding();
  const { questionsData, updateQuestionsData } = useQuestionsFlow();
  const [selectedOption, setSelectedOption] = useState(questionsData.mei);
  const [error] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 7;
  const completedSteps = status?.steps ? Object.values(status.steps).filter(Boolean).length : 0;
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);

  const options = [
    { value: 'sim', label: 'Sim' },
    { value: 'processo', label: 'Estou em processo' },
    { value: 'nao', label: 'Ainda não' },
  ];

  useEffect(() => {
    if (status) {
      setIsInitialLoading(false);
    }
  }, [status]);

  const handleSelectOption = useCallback(
    (value) => {
      setSelectedOption(value);
      updateQuestionsData('mei', value);
    },
    [updateQuestionsData]
  );

  const handleContinue = useCallback(() => {
    if (!selectedOption) return;
    navigation.navigate('QuestionsTransition');
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={currentStepNumber}
      totalSteps={totalSteps}
      headerEmoji="📋"
      headerText="Formalização profissional"
      headerTitle="Vamos regularizar"
      headerImageUrl="https://images.unsplash.com/photo-1635442962671-584193cdf451?auto=format&fit=crop&w=1080&q=80"
      questionText="Você já é MEI?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={handleSelectOption}
      microText="Podemos te orientar nisso depois 💡"
      buttonText="Próximo"
      onContinue={handleContinue}
      isButtonLoading={false}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
