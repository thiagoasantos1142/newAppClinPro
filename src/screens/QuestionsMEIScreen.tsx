import React, { useCallback, useEffect, useState } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import QuestionCard from '../components/QuestionCard';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';
import { useOnboarding } from '../hooks/useOnboarding';

type OptionValue = 'sim' | 'processo' | 'nao';
type Props = { navigation: NavigationProp<any> };

export default function QuestionsMEIScreen({ navigation }: Props) {
  const { status } = useOnboarding();
  const { questionsData, updateQuestionsData } = useQuestionsFlow();
  const [selectedOption, setSelectedOption] = useState<OptionValue | null>(
    (questionsData.mei as OptionValue | null) ?? null
  );
  const [error] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 7;
  const completedSteps = status?.steps ? Object.values(status.steps).filter(Boolean).length : 0;
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);

  const options: Array<{ value: OptionValue; label: string }> = [
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
    (value: OptionValue) => {
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
