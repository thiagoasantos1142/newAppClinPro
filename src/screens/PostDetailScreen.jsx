import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import {
  createCommunityPostComment,
  getCommunityPostById,
  getCommunityPostComments,
  likeCommunityPost,
} from '../services/modules/community.service';

export default function PostDetailScreen({ navigation, route }) {
  const postId = route?.params?.postId;
  const [data, setData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const reloadPost = useCallback(async () => {
    const [postResponse, commentsResponse] = await Promise.all([
      getCommunityPostById(postId),
      getCommunityPostComments(postId, { page: 1, limit: 20 }),
    ]);
    setData(postResponse);
    setCommentsData(commentsResponse);
  }, [postId]);

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

  const handleLike = useCallback(async () => {
    if (!postId || liking) return;
    setLiking(true);
    try {
      await likeCommunityPost(postId);
      await reloadPost();
    } catch {
      // mantém UX silenciosa aqui; os dados atuais permanecem
    } finally {
      setLiking(false);
    }
  }, [liking, postId, reloadPost]);

  const handleComment = useCallback(async () => {
    const text = commentText.trim();
    if (!postId || commenting || !text) return;
    setCommenting(true);
    try {
      await createCommunityPostComment(postId, { text });
      setCommentText('');
      await reloadPost();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao comentar');
    } finally {
      setCommenting(false);
    }
  }, [commentText, commenting, postId, reloadPost]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Detalhe do Post"
      subtitle={subtitle}
      sections={sections}
      actions={[
        { label: liking ? 'Curtindo...' : 'Curtir Post', onPress: handleLike, disabled: liking, icon: 'heart' },
        { label: 'Voltar para Feed', onPress: () => navigation.goBack(), variant: 'secondary', icon: 'arrow-left' },
      ]}
    >
      <AppCard>
        <Text style={styles.commentTitle}>Adicionar comentário</Text>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Escreva um comentário..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={styles.commentInput}
        />
        <View style={styles.commentActions}>
          <Pressable
            onPress={handleComment}
            disabled={commenting || !commentText.trim()}
            style={({ pressed }) => [
              styles.commentButton,
              (commenting || !commentText.trim()) && styles.commentButtonDisabled,
              pressed && !commenting && !!commentText.trim() && styles.commentButtonPressed,
            ]}
          >
            <Text style={styles.commentButtonText}>{commenting ? 'Enviando...' : 'Comentar'}</Text>
          </Pressable>
        </View>
      </AppCard>
    </ModuleTemplate>
  );
}

const styles = StyleSheet.create({
  commentTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  commentInput: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.cardForeground,
    textAlignVertical: 'top',
    backgroundColor: '#FFF',
  },
  commentActions: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  commentButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  commentButtonDisabled: {
    opacity: 0.5,
  },
  commentButtonPressed: {
    opacity: 0.9,
  },
  commentButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
