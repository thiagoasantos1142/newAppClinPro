import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function TransferMoneyScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Transferir Dinheiro"
      subtitle="Envie valores para outra conta"
      sections={[
        {
          title: 'Transferência rápida',
          items: [
            { label: 'Chave PIX', value: '***@email.com' },
            { label: 'Valor sugerido', value: 'R$ 100,00' },
          ],
        },
      ]}
      actions={[
        { label: 'Confirmar Transferência', route: 'DigitalAccountOverview', icon: 'check' },
      ]}
    />
  );
}