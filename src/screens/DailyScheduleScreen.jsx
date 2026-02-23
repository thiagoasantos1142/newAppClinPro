import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function DailyScheduleScreen({ navigation, route }) {
  const date = route?.params?.date || '2026-02-19';

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Agenda do Dia"
      subtitle={`Data: ${date}`}
      sections={[
        {
          title: 'Compromissos',
          items: [
            { label: '09:00 - 11:00', value: 'Maria Fernandes' },
            { label: '12:00 - 13:00', value: 'Deslocamento' },
            { label: '14:00 - 16:30', value: 'João Santos' },
          ],
        },
      ]}
      actions={[
        { label: 'Ver Carga de Trabalho', route: 'WorkloadOverview', icon: 'bar-chart-2' },
      ]}
    />
  );
}