import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, AppButton, ProgressBar } from '../components/ui.jsx';
import { getTrainingTrailById } from '../services/modules/training.service';
import { colors } from '../theme/tokens';

export default function TrailDetailScreen({ route, navigation }) {
  const { trailId } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadTrail = async () => {
        if (!trailId) {
          setError('Trilha não informada');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const response = await getTrainingTrailById(trailId);
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar trilha');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadTrail();

      return () => {
        isActive = false;
      };
    }, [trailId])
  );

  const trail = useMemo(() => {
    const t = data?.trail;
    if (!t) return null;

    return {
      id: String(t.id),
      title: t.title || 'Trilha',
      description: t.description || '',
      lessonsCount: t.lessons_count ?? 0,
      duration: t.duration_label || '-',
      progress: Number(t.progress_percent || 0),
      completed: Boolean(t.completed) || Number(t.progress_percent || 0) >= 100,
    };
  }, [data?.trail]);

  const lessons = useMemo(
    () =>
      (Array.isArray(data?.lessons) ? data.lessons : []).map((lesson, index) => ({
        id: String(lesson.id),
        trailId: String(lesson.trail_id || trailId || ''),
        title: lesson.title || `Aula ${index + 1}`,
        duration: lesson.duration_label || '-',
        completed: Boolean(lesson.completed),
        isQuiz: Boolean(lesson.is_quiz),
        progress: Number(lesson.progress_percent || 0),
        locked: false,
      })),
    [data?.lessons, trailId]
  );

  const completedLessonsCount = useMemo(
    () => lessons.filter((lesson) => lesson.completed || lesson.progress >= 100).length,
    [lessons]
  );

  const onOpenLesson = (lesson) => {
    if (lesson.locked) return;
    if (lesson.isQuiz) {
      navigation.navigate('Quiz', { trailId: trail?.id, quizId: lesson.id });
      return;
    }
    navigation.navigate('VideoLesson', { trailId: trail?.id, lessonId: lesson.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Detalhes da Trilha</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Carregando trilha...</Text>
        </View>
      ) : error || !trail ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateText, styles.errorText]}>{error || 'Trilha não encontrada'}</Text>
          <AppButton title="Voltar" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <AppCard>
            <Text style={styles.title}>{trail.title}</Text>
            <Text style={styles.muted}>{trail.description}</Text>
            <Text style={[styles.muted, { marginTop: 10 }]}>{trail.lessonsCount} aulas • {trail.duration}</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>{completedLessonsCount}/{trail.lessonsCount} concluídas</Text>
              <Text style={styles.percent}>{trail.progress}%</Text>
            </View>
            <ProgressBar value={trail.progress} style={{ marginTop: 8 }} />
          </AppCard>

          <Text style={styles.sectionTitle}>Aulas</Text>
          <View style={styles.lessonList}>
            {lessons.length === 0 ? (
              <AppCard>
                <Text style={styles.muted}>Nenhuma aula disponível para esta trilha.</Text>
              </AppCard>
            ) : (
              lessons.map((lesson, index) => (
                <Pressable key={lesson.id} onPress={() => onOpenLesson(lesson)}>
                  <AppCard style={lesson.locked ? { opacity: 0.6 } : null}>
                    <View style={styles.lessonRow}>
                      <View style={[styles.lessonIcon, lesson.completed ? styles.iconDone : lesson.locked ? styles.iconLocked : styles.iconOpen]}>
                        {lesson.locked ? (
                          <Feather name="lock" size={16} color="#6B7280" />
                        ) : lesson.completed ? (
                          <Feather name="check-circle" size={18} color={colors.success} />
                        ) : lesson.isQuiz ? (
                          <MaterialCommunityIcons name="medal-outline" size={18} color={colors.primary} />
                        ) : (
                          <Feather name="play-circle" size={18} color={colors.primary} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.muted}>Aula {index + 1}</Text>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <Text style={styles.muted}>{lesson.duration}</Text>
                      </View>
                      {!lesson.locked && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
                    </View>
                  </AppCard>
                </Pressable>
              ))
            )}
          </View>

          {trail.completed && (
            <AppButton title="Ver Certificado" onPress={() => navigation.navigate('Certificate', { trailId: trail.id })} />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  backButton: { width: 38, height: 38, borderRadius: 12, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  stateText: { marginTop: 10, color: colors.mutedForeground, fontSize: 14, textAlign: 'center' },
  errorText: { color: colors.danger, marginTop: 0 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  title: { color: colors.cardForeground, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  muted: { color: colors.mutedForeground, fontSize: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  percent: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: colors.cardForeground, fontWeight: '700', fontSize: 18, marginTop: 4 },
  lessonList: { gap: 10 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lessonIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconDone: { backgroundColor: '#DBEAFE' },
  iconLocked: { backgroundColor: '#E5E7EB' },
  iconOpen: { backgroundColor: colors.secondary },
  lessonTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginVertical: 2 },
});
