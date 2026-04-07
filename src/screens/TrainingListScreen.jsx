import React, { useCallback, useMemo, useState } from 'react';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import HeaderActionButton from '../components/HeaderActionButton.jsx';
import { AppCard, Badge, ProgressBar } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { getTrainingTrails } from '../services/modules/training.service';

const trailColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function TrainingListScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadTraining = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getTrainingTrails({ include_recommended: true });
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar treinamentos');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadTraining();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const journey = data?.journey || {
    completed_lessons: 0,
    total_lessons: 0,
    progress_percent: 0,
  };

  const trails = useMemo(
    () =>
      (Array.isArray(data?.trails) ? data.trails : []).map((trail, index) => ({
        id: String(trail.id),
        title: trail.title || 'Trilha',
        description: trail.description || '',
        emoji: trail.emoji || null,
        lessonsCount: trail.lessons_count ?? 0,
        duration: trail.duration_label || '-',
        progress: Number(trail.progress_percent || 0),
        completed: Boolean(trail.completed) || Number(trail.progress_percent || 0) >= 100,
        color: trailColors[index % trailColors.length],
      })),
    [data?.trails]
  );

  const recommendedLessons = useMemo(
    () =>
      (Array.isArray(data?.recommended_lessons) ? data.recommended_lessons : []).map((item) => ({
        id: String(item.id),
        title: item.title || 'Aula',
        duration: item.duration_label || '-',
        emoji: item.emoji || '📘',
      })),
    [data?.recommended_lessons]
  );

  return (
    <RequireClinPro>
      <View style={styles.container}>
        <AppScreenHeader
          title="Treinamentos"
          subtitle="Aprenda e desenvolva suas habilidades"
          showBack={false}
          leftContent={<HeaderActionButton onPress={() => navigation.dispatch(DrawerActions.openDrawer())} icon="menu" />}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          rightContent={
            <HeaderActionButton>
              <MaterialCommunityIcons name="school-outline" size={22} color="#FFF" />
            </HeaderActionButton>
          }
        />

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <AppCard style={styles.infoCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.muted}>Carregando trilhas...</Text>
            </AppCard>
          ) : null}

          {!loading && error ? (
            <AppCard style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </AppCard>
          ) : null}

          <AppCard>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.muted}>Sua Jornada</Text>
                <Text style={styles.journeyValue}>{journey.completed_lessons}/{journey.total_lessons} aulas</Text>
              </View>
              <View style={styles.journeyBadge}><Text style={styles.journeyBadgeText}>{journey.progress_percent || 0}%</Text></View>
            </View>
            <ProgressBar value={Number(journey.progress_percent || 0)} style={{ marginTop: 12 }} />
          </AppCard>

          <View>
            <Text style={styles.sectionTitle}>Trilhas de Aprendizado</Text>
            <View style={styles.listGap}>
              {!loading && !error && trails.length === 0 ? (
                <AppCard>
                  <Text style={styles.emptyTitle}>Nenhuma trilha disponível</Text>
                  <Text style={styles.muted}>Tente novamente em alguns minutos.</Text>
                </AppCard>
              ) : null}

              {trails.map((trail) => (
                <AppCard key={trail.id}>
                  <View style={styles.rowTop}>
                    <View style={[styles.trailIcon, { backgroundColor: trail.color }]}>
                      {trail.emoji ? (
                        <Text style={styles.trailEmoji}>{trail.emoji}</Text>
                      ) : (
                        <MaterialCommunityIcons name="school" size={20} color="#FFF" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.trailTitle}>{trail.title}</Text>
                      <Text style={styles.muted}>{trail.description}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.muted}>{trail.lessonsCount} aulas</Text>
                    <Text style={styles.muted}>{trail.duration}</Text>
                  </View>

                  <View style={styles.rowBetween}>
                    <Text style={styles.muted}>{Math.round((trail.progress / 100) * trail.lessonsCount)}/{trail.lessonsCount} concluídas</Text>
                    <Text style={styles.percent}>{trail.progress}%</Text>
                  </View>
                  <ProgressBar value={trail.progress} color={trail.color} style={{ marginTop: 6 }} />

                  {trail.completed && <Badge text="Certificado disponível" tone="success" />}

                  <View style={{ marginTop: 12 }}>
                    <Text onPress={() => navigation.navigate('TrailDetail', { trailId: trail.id })} style={styles.linkButton}>
                      Abrir trilha
                    </Text>
                  </View>
                </AppCard>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Recomendados para Você</Text>
            {!loading && !error && recommendedLessons.length === 0 ? (
              <AppCard>
                <Text style={styles.muted}>Sem recomendações no momento.</Text>
              </AppCard>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalList}
              >
                {recommendedLessons.map((item) => (
                  <AppCard key={item.id} style={styles.recCard}>
                    <View style={styles.emojiArea}><Text style={styles.emoji}>{item.emoji}</Text></View>
                    <Text style={styles.recTitle}>{item.title}</Text>
                    <Text style={styles.muted}>{item.duration}</Text>
                  </AppCard>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </View>
    </RequireClinPro>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13, marginLeft: 46 },
  content: { padding: 16, gap: 16, paddingBottom: 28 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  errorCard: { borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF7F7' },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  emptyTitle: { color: colors.cardForeground, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  muted: { color: colors.mutedForeground, fontSize: 12 },
  journeyValue: { color: colors.primary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  journeyBadge: { width: 60, height: 60, borderRadius: 999, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  journeyBadgeText: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  sectionTitle: { color: colors.cardForeground, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  listGap: { gap: 10 },
  trailIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trailEmoji: { fontSize: 20 },
  trailTitle: { color: colors.cardForeground, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 8 },
  percent: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  linkButton: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  horizontalList: { gap: 10, paddingRight: 6, paddingBottom: 6 },
  horizontalScroll: { overflow: 'visible' },
  recCard: { width: 150, marginVertical: 4 },
  emojiArea: { height: 90, borderRadius: 12, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emoji: { fontSize: 44 },
  recTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginBottom: 4 },
});
