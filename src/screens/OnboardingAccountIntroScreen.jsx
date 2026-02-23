import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingAccountIntroScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Conta Digital"
      subtitle="Conheça os benefícios"
      sections={[{ title: 'Vantagens', items: [
        { label: 'Recebimento rápido', value: 'PIX instantâneo' },
        { label: 'Controle financeiro', value: 'Painel integrado' },
      ]}]}
      actions={[{ label: 'Continuar', route: 'OnboardingKYC', icon: 'arrow-right' }]}
    />
  );
}