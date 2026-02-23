import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function ReputationOverviewScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Reputação"
      subtitle="Sua performance profissional"
      hero={{ title: 'Nota geral', value: '4.9 / 5', progress: 98 }}
      sections={[
        {
          title: 'Indicadores',
          items: [
            { label: 'Pontualidade', value: '97%' },
            { label: 'Qualidade', value: '96%' },
            { label: 'Recorrência', value: '89%' },
          ],
        },
      ]}
      actions={[
        { label: 'Ver Avaliações', route: 'ReviewsList', icon: 'message-circle' },
        { label: 'Status de Verificação', route: 'VerificationStatus', variant: 'secondary', icon: 'shield' },
      ]}
    />
  );
}