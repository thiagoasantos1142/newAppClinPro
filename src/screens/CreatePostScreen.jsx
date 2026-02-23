import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function CreatePostScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      title="Criar Publicação"
      subtitle="Compartilhe uma dica com a comunidade"
      sections={[
        {
          title: 'Rascunho',
          body: 'Escreva um título claro, detalhe o contexto e finalize com uma dica prática para outros profissionais.',
        },
      ]}
      actions={[
        { label: 'Publicar', route: 'CommunityFeed', icon: 'send' },
      ]}
    />
  );
}