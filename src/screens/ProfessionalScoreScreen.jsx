import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function ProfessionalScoreScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Score Profissional"
      subtitle="Como evoluir seu nível"
      hero={{ title: 'Score atual', value: '820', progress: 82, note: 'Nível Profissional' }}
      sections={[
        {
          title: 'Próximos critérios',
          items: [
            { label: 'Concluir 10 serviços sem cancelamento', value: '+30 pts' },
            { label: 'Manter nota acima de 4.8', value: '+20 pts' },
          ],
        },
      ]}
    />
  );
}