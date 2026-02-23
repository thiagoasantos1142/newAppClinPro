import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function TransactionHistoryScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Histórico da Conta"
      subtitle="Movimentações bancárias"
      sections={[
        {
          title: 'Últimas transações',
          items: [
            { label: 'PIX recebido - Cliente Ana', value: '+ R$ 180,00' },
            { label: 'Transferência para carteira', value: '- R$ 120,00' },
            { label: 'PIX recebido - Cliente João', value: '+ R$ 150,00' },
          ],
        },
      ]}
    />
  );
}