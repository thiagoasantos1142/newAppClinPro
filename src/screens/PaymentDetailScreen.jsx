import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function PaymentDetailScreen({ navigation, route }) {
  const paymentId = route?.params?.paymentId || '1';

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Detalhe de Pagamento"
      subtitle={`Pagamento #${paymentId}`}
      sections={[
        {
          title: 'Informações',
          items: [
            { label: 'Cliente', value: 'Maria Fernandes' },
            { label: 'Valor', value: 'R$ 130,00' },
            { label: 'Status', value: 'Pago' },
            { label: 'Método', value: 'PIX' },
          ],
        },
      ]}
    />
  );
}