import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function AccountDetailsScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Dados da Conta"
      subtitle="Informações bancárias"
      sections={[
        {
          title: 'Conta principal',
          items: [
            { label: 'Banco', value: 'Clin Bank' },
            { label: 'Agência', value: '0001' },
            { label: 'Conta', value: '12345-6' },
          ],
        },
      ]}
      actions={[
        { label: 'Ativar Conta', route: 'AccountActivation', icon: 'check-circle' },
      ]}
    />
  );
}