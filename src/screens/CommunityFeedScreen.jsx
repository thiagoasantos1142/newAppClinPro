import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppCard } from '../components/ui.jsx';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import { colors } from '../theme/tokens';
import { getCommunityPosts } from '../services/modules/community.service';

moment.locale('pt-br');

const filters = ['Todas', 'Dicas', 'Conquistas', 'Perguntas', 'Treinamentos', 'Motivação'];
const avatars = ['👩', '👩‍🦱', '👩‍🦰', '👨', '🧑'];

function toApiCategory(category) {
  if (category === 'Motivação') return 'Motivacao';
  return category;
}

function formatPostTime(value) {
  if (!value) return '';
  const m = moment(value);
  if (!m.isValid()) return '';
  return m.fromNow();
}

function pickAvatar(seed = '') {
  const index = Math.abs(String(seed).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % avatars.length;
  return avatars[index];
}

export default function CommunityFeedScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadingMoreRef = useRef(false);

  const loadPosts = useCallback(async ({ page = 1, append = false, category = 'Todas' } = {}) => {
    if (append) {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await getCommunityPosts({ page, category: toApiCategory(category), limit: 20 });
      const nextItems = Array.isArray(data?.items) ? data.items : [];

      setItems((prev) => {
        if (!append) return nextItems;
        const seen = new Set(prev.map((item) => String(item?.id)));
        const deduped = nextItems.filter((item) => {
          const id = String(item?.id);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return [...prev, ...deduped];
      });

      setPagination(data?.pagination || { page, limit: 20, total: append ? items.length : 0 });
      if (!append) setHighlights(data?.highlights || null);
      if (!append) setError(null);
    } catch (err) {
      if (!append) {
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar posts');
      }
    } finally {
      if (append) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [items.length]);

  useFocusEffect(
    useCallback(() => {
      void loadPosts({ page: 1, append: false, category: activeFilter });

      return () => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      };
    }, [activeFilter, loadPosts])
  );

  const posts = useMemo(
    () =>
      items.map((post) => ({
        id: String(post.id),
        author: post.author?.name || 'Usuário',
        avatar: pickAvatar(post.author?.name || post.id),
        region: '',
        level: 'N1',
        category: post.category || 'Geral',
        title: post.title || '',
        content: post.content_preview || '',
        likes: post.likes_count ?? 0,
        comments: post.comments_count ?? 0,
        timestamp: formatPostTime(post.created_at),
        liked: false,
        saved: false,
      })),
    [items]
  );

  const hasMore = posts.length < (pagination.total || 0);

  const handleScroll = useCallback((e) => {
    if (loading || loadingMore || error || !hasMore) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distanceFromBottom < 180) {
      void loadPosts({ page: (pagination.page || 1) + 1, append: true, category: activeFilter });
    }
  }, [activeFilter, error, hasMore, loadPosts, loading, loadingMore, pagination.page]);

  const onChangeFilter = (filter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    setItems([]);
    setPagination({ page: 1, limit: 20, total: 0 });
    setHighlights(null);
  };

  const mostLiked = highlights?.most_liked;
  const mostActive = highlights?.most_active;

  return (
    <RequireClinPro>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.menuSlot} />
            <Text style={styles.headerTitle}>Comunidade</Text>
          </View>
          <Text style={styles.headerSubtitle}>Dicas e trocas com outros profissionais</Text>
        </View>

        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => onChangeFilter(filter)}
                style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.content} onScroll={handleScroll} scrollEventThrottle={16}>
          {loading ? (
            <AppCard style={styles.infoCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.footerText}>Carregando posts...</Text>
            </AppCard>
          ) : null}

          {!loading && error ? (
            <AppCard style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </AppCard>
          ) : null}

          <View style={styles.highlightBox}>
            <View style={styles.highlightTitleRow}>
              <Feather name="trending-up" size={16} color="#7C3AED" />
              <Text style={styles.highlightTitle}>Destaques da Semana</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightEmoji}>{pickAvatar(mostLiked?.author_name || 'liked')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightName}>{mostLiked?.author_name || 'Sem destaque'}</Text>
                <Text style={styles.highlightDesc}>Post mais curtido: {mostLiked?.likes_count ?? 0} likes</Text>
              </View>
              <Feather name="award" size={16} color="#7C3AED" />
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightEmoji}>{pickAvatar(mostActive?.author_name || 'active')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightName}>{mostActive?.author_name || 'Sem destaque'}</Text>
                <Text style={styles.highlightDesc}>Mais ativa: {mostActive?.posts_count ?? 0} publicações</Text>
              </View>
              <Feather name="star" size={16} color="#CA8A04" />
            </View>
          </View>

          {!loading && !error && posts.length === 0 ? (
            <AppCard>
              <Text style={styles.highlightName}>Nenhum post encontrado</Text>
              <Text style={styles.highlightDesc}>Tente outro filtro ou volte mais tarde.</Text>
            </AppCard>
          ) : null}

          {posts.map((post) => (
            <Pressable key={post.id} onPress={() => navigation.navigate('PostDetail', { postId: post.id })}>
              <AppCard style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{post.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.postNameRow}>
                      <Text style={styles.postName}>{post.author}</Text>
                      <View style={styles.levelPill}>
                        <Text style={styles.levelPillText}>{post.level}</Text>
                      </View>
                    </View>
                    {!!post.region && <Text style={styles.postRegion}>{post.region}</Text>}
                  </View>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{post.category}</Text>
                  </View>
                </View>

                {!!post.title && <Text style={styles.postTitle}>{post.title}</Text>}
                <Text style={styles.postContent}>{post.content || 'Sem prévia de conteúdo.'}</Text>

                <View style={styles.postFooter}>
                  <View style={styles.footerLeft}>
                    <View style={styles.footerAction}>
                      <Feather name="heart" size={16} color={post.liked ? '#DC2626' : colors.mutedForeground} />
                      <Text style={styles.footerText}>{post.likes}</Text>
                    </View>
                    <View style={styles.footerAction}>
                      <Feather name="message-circle" size={16} color={colors.mutedForeground} />
                      <Text style={styles.footerText}>{post.comments}</Text>
                    </View>
                  </View>
                  <View style={styles.footerRight}>
                    <Feather name="bookmark" size={16} color={post.saved ? colors.primary : colors.mutedForeground} />
                    <Text style={styles.timestamp}>{post.timestamp}</Text>
                  </View>
                </View>
              </AppCard>
            </Pressable>
          ))}

          {!loading && !error && loadingMore ? (
            <AppCard style={styles.infoCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.footerText}>Carregando mais posts...</Text>
            </AppCard>
          ) : null}

          {!loading && !error && !hasMore && posts.length > 0 ? (
            <Text style={styles.endListText}>Todos os posts foram carregados.</Text>
          ) : null}
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
          <Feather name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </RequireClinPro>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  headerTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 3, marginLeft: 46 },
  filterBar: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: '#FFFFFF', paddingVertical: 8 },
  filterRow: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  filterPill: {
    height: 38,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: { backgroundColor: colors.primary },
  filterText: { color: colors.cardForeground, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  content: { padding: 16, gap: 12, paddingBottom: 90 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  errorCard: { borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF7F7' },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  endListText: { textAlign: 'center', color: colors.mutedForeground, fontSize: 12, paddingVertical: 6 },
  highlightBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
    padding: 12,
    gap: 8,
  },
  highlightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightTitle: { color: colors.cardForeground, fontSize: 15, fontWeight: '700' },
  highlightCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightEmoji: { fontSize: 20 },
  highlightName: { color: colors.cardForeground, fontSize: 13, fontWeight: '700' },
  highlightDesc: { color: colors.mutedForeground, fontSize: 11 },
  postCard: { borderWidth: 1, borderColor: colors.border },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20 },
  postNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postName: { color: colors.cardForeground, fontSize: 14, fontWeight: '700' },
  levelPill: { borderRadius: 8, backgroundColor: 'rgba(31,128,234,0.1)', paddingHorizontal: 7, paddingVertical: 2 },
  levelPillText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  postRegion: { color: colors.mutedForeground, fontSize: 11, marginTop: 2 },
  categoryPill: { borderRadius: 8, backgroundColor: colors.accent, paddingHorizontal: 9, paddingVertical: 5 },
  categoryPillText: { color: colors.cardForeground, fontSize: 11, fontWeight: '600' },
  postTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  postContent: { color: colors.cardForeground, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { color: colors.mutedForeground, fontSize: 12, fontWeight: '600' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timestamp: { color: colors.mutedForeground, fontSize: 11 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 78,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A3E70',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
  },
});
