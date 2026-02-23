import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function DigitalAccountOverviewScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Conta Digital"
      subtitle="Visão geral da conta"
      hero={{ title: 'Saldo disponível', value: 'R$ 2.180,40' }}
      sections={[
        {
          title: 'Resumo',
          items: [
            { label: 'Recebimentos pendentes', value: 'R$ 420,00' },
            { label: 'Transferências do mês', value: '7' },
          ],
        },
      ]}
      actions={[
        { label: 'Histórico da Conta', route: 'TransactionHistory', icon: 'clock' },
        { label: 'Transferir', route: 'TransferMoney', variant: 'secondary', icon: 'send' },
      ]}
    />
  );
}