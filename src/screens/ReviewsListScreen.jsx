import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function ReviewsListScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Avaliações"
      subtitle="Feedbacks dos clientes"
      sections={[
        {
          title: 'Comentários recentes',
          items: [
            { label: 'Maria Fernandes', value: 'Excelente atendimento e organização.' },
            { label: 'João Santos', value: 'Muito pontual e cuidadosa.' },
          ],
        },
      ]}
    />
  );
}