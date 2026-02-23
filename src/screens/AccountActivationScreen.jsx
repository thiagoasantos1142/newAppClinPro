import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function AccountActivationScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Ativação de Conta"
      subtitle="Finalize seu cadastro bancário"
      sections={[
        {
          title: 'Checklist',
          items: [
            { label: 'Documento enviado', value: 'OK' },
            { label: 'Selfie validada', value: 'OK' },
            { label: 'Análise de risco', value: 'Em processamento' },
          ],
        },
      ]}
      actions={[
        { label: 'Voltar para Conta Digital', route: 'DigitalAccountOverview', variant: 'secondary', icon: 'arrow-left' },
      ]}
    />
  );
}