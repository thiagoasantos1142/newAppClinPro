import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function OnboardingQuestionsScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Perguntas Iniciais"
      subtitle="Entendendo seu perfil"
      sections={[
        { title: 'Preferências', items: [
          { label: 'Área de atuação', value: 'Residencial e Comercial' },
          { label: 'Disponibilidade', value: 'Segunda a Sexta' },
        ]},
      ]}
      actions={[{ label: 'Continuar', route: 'OnboardingProfile', icon: 'arrow-right' }]}
    />
  );
}