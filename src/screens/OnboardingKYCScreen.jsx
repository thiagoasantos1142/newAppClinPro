import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingKYCScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Validação de Identidade"
      subtitle="Etapa KYC"
      sections={[{ title: 'Documentos', items: [
        { label: 'RG/CNH', value: 'Obrigatório' },
        { label: 'Selfie', value: 'Obrigatório' },
      ]}]}
      actions={[{ label: 'Próximo', route: 'OnboardingFirstGoal', icon: 'arrow-right' }]}
    />
  );
}