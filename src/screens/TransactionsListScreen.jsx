import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function TransactionsListScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Lista de Transações"
      subtitle="Entradas e saídas recentes"
      sections={[
        {
          title: 'Últimas movimentações',
          items: [
            { label: '19 Fev - Serviço Maria Fernandes', value: '+ R$ 130,00' },
            { label: '18 Fev - Produtos de limpeza', value: '- R$ 89,90' },
            { label: '17 Fev - Serviço João Santos', value: '+ R$ 150,00' },
          ],
        },
      ]}
      actions={[
        { label: 'Abrir Detalhe de Pagamento', route: 'PaymentDetail', params: { paymentId: '1' }, icon: 'credit-card' },
      ]}
    />
  );
}