import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingTutorialScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Tutorial Inicial"
      subtitle="Você está pronta para começar"
      sections={[{ title: 'Resumo', body: 'Navegue pelos módulos de Serviços, Agenda, Comunidade e Financeiro para iniciar sua operação.' }]}
      actions={[{ label: 'Ir para Home', route: 'MainTabs', icon: 'home' }]}
    />
  );
}