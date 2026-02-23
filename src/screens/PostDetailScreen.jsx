import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function PostDetailScreen({ navigation, route }) {
  const postId = route?.params?.postId || '1';

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Detalhe do Post"
      subtitle={`Post #${postId}`}
      sections={[
        {
          title: 'Conteúdo',
          body: 'Planejar o deslocamento por região pode reduzir atrasos e aumentar sua produtividade ao longo da semana.',
        },
        {
          title: 'Interações',
          items: [
            { label: 'Curtidas', value: '124' },
            { label: 'Comentários', value: '18' },
          ],
        },
      ]}
      actions={[
        { label: 'Voltar para Feed', route: 'CommunityFeed', variant: 'secondary', icon: 'arrow-left' },
      ]}
    />
  );
}