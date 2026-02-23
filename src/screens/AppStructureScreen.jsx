import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function AppStructureScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Estrutura do App"
      subtitle="Visão de módulos"
      sections={[
        { title: 'Núcleo', items: [
          { label: 'Home', value: 'Resumo e atalhos' },
          { label: 'Serviços', value: 'Captação e execução' },
          { label: 'Perfil', value: 'Identidade e reputação' },
        ]},
      ]}
    />
  );
}