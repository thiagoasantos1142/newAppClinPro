import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingFirstGoalScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Primeira Meta"
      subtitle="Defina seu objetivo inicial"
      sections={[{ title: 'Sugestão', body: 'Meta recomendada: concluir 10 serviços com nota acima de 4.8 no primeiro mês.' }]}
      actions={[{ label: 'Continuar', route: 'OnboardingTutorial', icon: 'arrow-right' }]}
    />
  );
}