import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';
import { useOnboarding } from '../hooks/useOnboarding';

export default function QuestionsGoalScreen({ navigation }) {
  const { status } = useOnboarding();
  const { questionsData, updateQuestionsData } = useQuestionsFlow();
  const [selectedOption, setSelectedOption] = useState(questionsData.goal ?? null);
  const [error] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const options = [
    { value: 'ate-2000', label: 'Até R$ 2.000' },
    { value: '2000-4000', label: 'R$ 2.000 a R$ 4.000' },
    { value: '4000-6000', label: 'R$ 4.000 a R$ 6.000' },
    { value: 'acima-6000', label: 'Acima de R$ 6.000' },
  ];

  useEffect(() => {
    if (status) {
      setIsInitialLoading(false);
    }
  }, [status]);

  const handleSelectOption = useCallback(
    (value) => {
      setSelectedOption(value);
      updateQuestionsData('goal', value);
    },
    [updateQuestionsData]
  );

  const handleContinue = useCallback(() => {
    if (!selectedOption) return;
    navigation.navigate('QuestionsMEI');
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={4}
      totalSteps={6}
      headerEmoji="🎯"
      headerText="Vamos sonhar junto"
      headerTitle="Suas metas importam"
      headerImageUrl="https://images.unsplash.com/photo-1661903574853-d722c40fe0a0?auto=format&fit=crop&w=1080&q=80"
      questionText="Quanto você gostaria de ganhar por mês?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={handleSelectOption}
      microText="Com organização e visibilidade, isso é possível 💪"
      buttonText="Próximo"
      onContinue={handleContinue}
      isButtonLoading={false}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
