import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingProfileScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Perfil Profissional"
      subtitle="Complete seus dados"
      sections={[{ title: 'Dados essenciais', body: 'Adicione experiência, especialidades e região de atendimento.' }]}
      actions={[{ label: 'Próximo', route: 'OnboardingAccountIntro', icon: 'arrow-right' }]}
    />
  );
}