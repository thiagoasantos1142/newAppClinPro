import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function ServiceHistoryScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Histórico de Serviços"
      subtitle="Últimos atendimentos finalizados"
      sections={[
        {
          title: 'Fevereiro 2026',
          items: [
            { label: '19 Fev - Limpeza Residencial', value: 'R$ 150,00' },
            { label: '18 Fev - Limpeza Profunda', value: 'R$ 180,00' },
            { label: '16 Fev - Limpeza Comercial', value: 'R$ 220,00' },
          ],
        },
      ]}
    />
  );
}