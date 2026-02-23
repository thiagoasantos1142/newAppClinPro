import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function WorkloadOverviewScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Carga de Trabalho"
      subtitle="Produtividade semanal"
      hero={{ title: 'Taxa de ocupação', value: '68%', progress: 68 }}
      sections={[
        {
          title: 'Indicadores',
          items: [
            { label: 'Horas trabalhadas', value: '32h' },
            { label: 'Serviços concluídos', value: '12' },
            { label: 'Tempo médio por serviço', value: '2h 40min' },
          ],
        },
      ]}
    />
  );
}