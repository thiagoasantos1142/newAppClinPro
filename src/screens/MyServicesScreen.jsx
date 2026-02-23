import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function MyServicesScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Meus Serviços"
      subtitle="Acompanhe os serviços aceitos"
      hero={{ title: 'Serviços em andamento', value: '4' }}
      sections={[
        {
          title: 'Hoje',
          items: [
            { label: '09:00 - 11:30', value: 'Maria Fernandes' },
            { label: '14:00 - 16:00', value: 'João Santos' },
          ],
        },
        {
          title: 'Próximos',
          items: [
            { label: 'Amanhã 10:00', value: 'Ana Costa' },
            { label: 'Sexta 08:30', value: 'Carla Oliveira' },
          ],
        },
      ]}
      actions={[
        { label: 'Ver Histórico', route: 'ServiceHistory', icon: 'clock' },
      ]}
    />
  );
}