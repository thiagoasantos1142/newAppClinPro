import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';
import { useOnboarding } from '../hooks/useOnboarding';

export default function QuestionsMEIScreen({ navigation }) {
  const { status } = useOnboarding();
  const { questionsData, updateQuestionsData } = useQuestionsFlow();
  const [selectedOption, setSelectedOption] = useState(questionsData.mei ?? null);
  const [error] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
      currentStepNumber={5}
      totalSteps={6}
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
