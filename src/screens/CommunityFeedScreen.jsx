import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppCard } from '../components/ui.jsx';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import { colors } from '../theme/tokens';

const filters = ['Todas', 'Dicas', 'Conquistas', 'Perguntas', 'Treinamentos', 'Motivação'];

const posts = [
  {
    id: '1',
    author: 'Maria Silva',
    avatar: '👩',
    region: 'São Paulo, SP',
    level: 'N3',
    category: 'Conquistas',
    content: 'Acabei de completar 100 serviços! Muito feliz com essa conquista.',
    likes: 45,
    comments: 12,
    timestamp: 'Há 2 horas',
    liked: false,
    saved: false,
  },
  {
    id: '2',
    author: 'Ana Costa',
    avatar: '👩‍🦱',
    region: 'Rio de Janeiro, RJ',
    level: 'N2',
    category: 'Treinamentos',
    content: 'Concluiu a trilha Atendimento Profissional e recebeu novo certificado.',
    likes: 32,
    comments: 8,
    timestamp: 'Há 3 horas',
    liked: true,
    saved: false,
  },
  {
    id: '3',
    author: 'Juliana Santos',
    avatar: '👩‍🦰',
    region: 'Belo Horizonte, MG',
    level: 'N4',
    category: 'Dicas',
    content: 'Sempre leve um kit de emergência com produtos básicos. Ajuda muito em clientes novos.',
    likes: 67,
    comments: 23,
    timestamp: 'Há 5 horas',
    liked: false,
    saved: true,
  },
];

export default function CommunityFeedScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Todas');

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'Todas') return posts;
    return posts.filter((post) => post.category === activeFilter);
  }, [activeFilter]);

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
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.highlightBox}>
          <View style={styles.highlightTitleRow}>
            <Feather name="trending-up" size={16} color="#7C3AED" />
            <Text style={styles.highlightTitle}>Destaques da Semana</Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightEmoji}>👩‍🦰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightName}>Juliana Santos</Text>
              <Text style={styles.highlightDesc}>Post mais curtido: 67 likes</Text>
            </View>
            <Feather name="award" size={16} color="#7C3AED" />
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightEmoji}>👩</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightName}>Maria Silva</Text>
              <Text style={styles.highlightDesc}>Mais ativa: 8 publicações</Text>
            </View>
            <Feather name="star" size={16} color="#CA8A04" />
          </View>
        </View>

        {filteredPosts.map((post) => (
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
                  <Text style={styles.postRegion}>{post.region}</Text>
                </View>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{post.category}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

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
