import React, { useCallback, useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard.jsx';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';
import { useOnboarding } from '../hooks/useOnboarding';

export default function QuestionsExperienceScreen({ navigation }) {
  const { status } = useOnboarding();
  const { questionsData, updateQuestionsData } = useQuestionsFlow();
  const [selectedOption, setSelectedOption] = useState(questionsData.experience);
  const [error] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const totalSteps = 7;
  const completedSteps = status?.steps ? Object.values(status.steps).filter(Boolean).length : 0;
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);

  const options = [
    { value: 'iniciante', label: 'Começando agora' },
    { value: 'menos-1-ano', label: 'Menos de 1 ano' },
    { value: '1-3-anos', label: '1 a 3 anos' },
    { value: 'mais-3-anos', label: 'Mais de 3 anos' },
  ];

  useEffect(() => {
    if (status) {
      setIsInitialLoading(false);
    }
  }, [status]);

  const handleSelectOption = useCallback(
    (value) => {
      setSelectedOption(value);
      updateQuestionsData('experience', value);
    },
    [updateQuestionsData]
  );

  const handleContinue = useCallback(() => {
    if (!selectedOption) return;
    navigation.navigate('QuestionsGoal');
  }, [selectedOption, navigation]);

  return (
    <QuestionCard
      currentStepNumber={currentStepNumber}
      totalSteps={totalSteps}
      headerEmoji="⭐"
      headerText="Conhecendo sua jornada"
      headerTitle="Sua experiência importa"
      headerImageUrl="https://images.unsplash.com/photo-1587567971815-03f434c18a09?auto=format&fit=crop&w=1080&q=80"
      questionText="Há quanto tempo você trabalha como diarista?"
      options={options}
      selectedOption={selectedOption}
      onSelectOption={handleSelectOption}
      microText="Toda experiência é valiosa 👏"
      buttonText="Próximo"
      onContinue={handleContinue}
      isButtonLoading={false}
      error={error}
      isInitialLoading={isInitialLoading}
    />
  );
}
