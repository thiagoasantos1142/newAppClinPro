import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingWelcomeScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Bem-vinda"
      subtitle="Vamos configurar sua jornada"
      sections={[{ title: 'Introdução', body: 'Em poucos passos você configura seu perfil profissional e começa a receber oportunidades.' }]}
      actions={[{ label: 'Começar', route: 'OnboardingQuestions', icon: 'arrow-right' }]}
    />
  );
}