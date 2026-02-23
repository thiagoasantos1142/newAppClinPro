import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function FinancialDashboardScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Painel Financeiro"
      subtitle="Controle de ganhos e despesas"
      hero={{ title: 'Saldo do mês', value: 'R$ 4.280,00', progress: 78, note: 'Meta mensal: R$ 5.500,00' }}
      sections={[
        {
          title: 'Resumo',
          items: [
            { label: 'Receitas', value: 'R$ 6.200,00' },
            { label: 'Despesas', value: 'R$ 1.920,00' },
            { label: 'Lucro líquido', value: 'R$ 4.280,00' },
          ],
        },
      ]}
      actions={[
        { label: 'Ver Transações', route: 'Transactions', icon: 'list' },
        { label: 'Controle MEI', route: 'MEIControl', variant: 'secondary', icon: 'file-text' },
      ]}
    />
  );
}