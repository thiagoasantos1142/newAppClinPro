import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function NavigationGuideScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Guia de Navegação"
      subtitle="Mapa de rotas do aplicativo"
      sections={[
        { title: 'Stacks principais', items: [
          { label: 'MainTabs', value: 'Home, Serviços, Treinar, Perfil' },
          { label: 'Módulos', value: 'Financeiro, Banco, Comunidade, Agenda, Reputação' },
        ]},
      ]}
    />
  );
}