import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function MEIControlScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Controle MEI"
      subtitle="Obrigações e emissão fiscal"
      sections={[
        {
          title: 'Competência atual',
          items: [
            { label: 'DAS mensal', value: 'R$ 76,90' },
            { label: 'Vencimento', value: '20/02/2026' },
            { label: 'Situação', value: 'Em dia' },
          ],
        },
      ]}
    />
  );
}