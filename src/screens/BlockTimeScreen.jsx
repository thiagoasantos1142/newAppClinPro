import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function BlockTimeScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Bloquear Horário"
      subtitle="Defina períodos indisponíveis"
      sections={[
        {
          title: 'Bloqueios ativos',
          items: [
            { label: '20 Fev 13:00 - 15:00', value: 'Compromisso pessoal' },
            { label: '22 Fev 08:00 - 12:00', value: 'Curso de atualização' },
          ],
        },
      ]}
      actions={[
        { label: 'Salvar Bloqueio', route: 'WeeklySchedule', icon: 'check' },
      ]}
    />
  );
}