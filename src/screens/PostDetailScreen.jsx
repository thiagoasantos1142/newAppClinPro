import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getCommunityPostById, getCommunityPostComments } from '../services/modules/community.service';

export default function PostDetailScreen({ navigation, route }) {
  const postId = route?.params?.postId;
  const [data, setData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadPost = async () => {
        if (!postId) {
          setError('Post não informado');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const [postResponse, commentsResponse] = await Promise.all([
            getCommunityPostById(postId),
            getCommunityPostComments(postId, { page: 1, limit: 20 }),
          ]);
          if (!isActive) return;
          setData(postResponse);
          setCommentsData(commentsResponse);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar post');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadPost();

      return () => {
        isActive = false;
      };
    }, [postId])
  );

  const post = data?.post || null;

  const subtitle = useMemo(() => {
    if (loading) return 'Carregando post...';
    if (error) return error;
    if (!post) return 'Post não encontrado';
    return `${post.author?.name || 'Autor'} • ${post.id || postId}`;
  }, [error, loading, post, postId]);

  const sections = useMemo(() => {
    if (loading) {
      return [{ title: 'Conteúdo', body: 'Carregando...' }];
    }

    if (error || !post) {
      return [{ title: 'Conteúdo', body: 'Não foi possível carregar este post.' }];
    }

    const comments = Array.isArray(commentsData?.items) ? commentsData.items : [];

    return [
      {
        title: 'Conteúdo',
        body: post.content || 'Sem conteúdo disponível.',
      },
      {
        title: 'Interações',
        items: [
          { label: 'Curtidas', value: String(post.likes_count ?? 0) },
          { label: 'Comentários', value: String(post.comments_count ?? 0) },
        ],
      },
      {
        title: 'Comentários',
        body:
          comments.length > 0
            ? comments
                .map((c) => `${c.author?.name || c.author_name || 'Usuário'}: ${c.text || ''}`)
                .join('\n')
            : 'Nenhum comentário ainda.',
      },
    ];
  }, [commentsData?.items, error, loading, post]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Detalhe do Post"
      subtitle={subtitle}
      sections={sections}
      actions={[
        { label: 'Voltar para Feed', onPress: () => navigation.goBack(), variant: 'secondary', icon: 'arrow-left' },
      ]}
    />
  );
}
