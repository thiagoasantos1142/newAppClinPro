import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function VerificationStatusScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Status de Verificação"
      subtitle="Confiabilidade do perfil"
      sections={[
        {
          title: 'Itens de verificação',
          items: [
            { label: 'Documento oficial', value: 'Aprovado' },
            { label: 'Comprovante de endereço', value: 'Aprovado' },
            { label: 'Antecedentes', value: 'Sem pendências' },
          ],
        },
      ]}
      actions={[
        { label: 'Score Profissional', route: 'ProfessionalScore', icon: 'award' },
      ]}
    />
  );
}