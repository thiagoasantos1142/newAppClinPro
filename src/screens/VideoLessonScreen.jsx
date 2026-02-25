import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard, ProgressBar } from '../components/ui.jsx';
import { getTrainingLessonById, saveTrainingLessonProgress } from '../services/modules/training.service';
import { colors } from '../theme/tokens';

export default function VideoLessonScreen({ route, navigation }) {
  const { trailId, lessonId } = route.params || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localProgress, setLocalProgress] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadLesson = async () => {
        if (!lessonId) {
          setError('Aula não informada');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const response = await getTrainingLessonById(lessonId);
          if (!isActive) return;
          setData(response);
          setLocalProgress(null);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar aula');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadLesson();

      return () => {
        isActive = false;
      };
    }, [lessonId])
  );

  const lesson = data?.lesson || null;
  const progress = localProgress ?? Number(lesson?.progress_percent || 0);
  const nextLesson = lesson?.next_lesson || null;
  const keyPoints = Array.isArray(lesson?.key_points) ? lesson.key_points : [];
  const quizSummary = lesson?.quiz_summary || null;
  const questionsCount = Number(quizSummary?.questions_count || 0);
  const quizCompleted = useMemo(() => {
    if (typeof quizSummary?.passed === 'boolean') return quizSummary.passed;
    if (typeof quizSummary?.completed === 'boolean') return quizSummary.completed;
    return Boolean(
      lesson?.quiz_completed || lesson?.quiz_done || lesson?.quiz_passed || lesson?.assessment_completed
    );
  }, [lesson, quizSummary]);

  const resolvedTrailId = lesson?.trail_id || trailId;

  const subtitle = useMemo(() => {
    if (!lesson?.description) return 'Sem descrição informada.';
    return lesson.description;
  }, [lesson?.description]);

  const handleMarkComplete = useCallback(async () => {
    if (!lesson?.id || savingProgress) return;
    setSavingProgress(true);
    try {
      await saveTrainingLessonProgress(lesson.id, { progress_percent: 100, completed: true });
      setLocalProgress(100);
      setData((prev) => ({
        ...prev,
        lesson: prev?.lesson ? { ...prev.lesson, progress_percent: 100 } : prev?.lesson,
      }));
      Alert.alert('Sucesso', 'Progresso da aula atualizado.');
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível salvar o progresso.');
    } finally {
      setSavingProgress(false);
    }
  }, [lesson?.id, savingProgress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.trailText}>{resolvedTrailId ? `Trilha ${resolvedTrailId}` : 'Treinamento'}</Text>
            <Text style={styles.headerTitle}>Aula</Text>
          </View>
        </View>
      </View>

      <View style={styles.videoBox}>
        <Pressable style={styles.videoTouch} onPress={() => setIsPlaying((v) => !v)} disabled={loading || !!error}>
          <View style={styles.videoCenter}>
            <View style={styles.playBtn}>
              <Feather name={isPlaying ? 'pause' : 'play'} size={28} color="#FFF" />
            </View>
            <Text style={styles.videoLabel}>
              {loading ? 'Carregando aula...' : error ? 'Falha ao carregar vídeo' : lesson?.video_url ? 'Vídeo da Aula' : 'Vídeo indisponível'}
            </Text>
          </View>
        </Pressable>
        <View style={styles.videoProgressWrap}><ProgressBar value={progress} color="#FFFFFF" /></View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Carregando aula...</Text>
        </View>
      ) : error || !lesson ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateText, styles.errorText]}>{error || 'Aula não encontrada'}</Text>
          <AppButton title="Voltar" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View>
            <Text style={styles.title}>{lesson.title || 'Aula'}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {!!lesson.duration_label && <Text style={styles.meta}>{lesson.duration_label}</Text>}
          </View>

          <AppCard>
            <Text style={styles.cardTitle}>Pontos Principais</Text>
            {keyPoints.length === 0 ? (
              <Text style={styles.pointText}>Nenhum ponto principal informado.</Text>
            ) : (
              keyPoints.map((item, idx) => (
                <View key={`${idx}-${item}`} style={styles.pointRow}>
                  <View style={styles.pointIndex}><Text style={styles.pointIndexText}>{idx + 1}</Text></View>
                  <Text style={styles.pointText}>{item}</Text>
                </View>
              ))
            )}
          </AppCard>

          {lesson.is_quiz && (
            <AppCard>
              <Text style={styles.cardTitle}>Perguntas da Aula</Text>
              {questionsCount <= 0 ? (
                <Text style={styles.pointText}>Nenhuma pergunta disponível para esta aula.</Text>
              ) : (
                <Pressable
                  disabled={quizCompleted}
                  onPress={() => navigation.navigate('Quiz', { trailId: resolvedTrailId, quizId: lesson.id })}
                >
                  <View style={[styles.quizCardRow, quizCompleted && styles.quizCardRowDisabled]}>
                    <View style={styles.quizCardIcon}>
                      <Feather name="award" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.quizHeaderRow}>
                        <Text style={styles.quizCardOverline}>Avaliação da aula</Text>
                        <View style={[styles.quizStatusBadge, quizCompleted ? styles.quizStatusDone : styles.quizStatusPending]}>
                          <Text style={[styles.quizStatusText, quizCompleted ? styles.quizStatusTextDone : styles.quizStatusTextPending]}>
                            {quizCompleted ? 'Concluída' : 'Pendente'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.quizCardTitle}>Responder perguntas</Text>
                      <Text style={styles.quizCardMeta}>
                        {questionsCount} {questionsCount === 1 ? 'pergunta' : 'perguntas'}
                      </Text>
                    </View>
                    <Feather
                      name={quizCompleted ? 'lock' : 'chevron-right'}
                      size={18}
                      color={colors.mutedForeground}
                    />
                  </View>
                </Pressable>
              )}
            </AppCard>
          )}

          <AppButton
            title={savingProgress ? 'Salvando...' : 'Marcar como Concluída'}
            onPress={handleMarkComplete}
            disabled={savingProgress}
            left={<Feather name="check-circle" size={16} color="#FFF" />}
          />

          {nextLesson && (
            <AppButton
              title={`Próxima Aula: ${nextLesson.title}${nextLesson.is_quiz ? ' (com perguntas)' : ''}`}
              variant="secondary"
              onPress={() => navigation.replace('VideoLesson', { trailId: resolvedTrailId, lessonId: nextLesson.id })}
              left={<Feather name="skip-forward" size={16} color={colors.cardForeground} />}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  backButton: { width: 38, height: 38, borderRadius: 12, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  trailText: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: 2 },
  videoBox: { backgroundColor: '#111827', height: 220, justifyContent: 'center' },
  videoTouch: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoCenter: { alignItems: 'center' },
  playBtn: { width: 72, height: 72, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  videoLabel: { color: 'rgba(255,255,255,0.8)', marginTop: 10 },
  videoProgressWrap: { paddingHorizontal: 12, paddingBottom: 10 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  stateText: { marginTop: 10, color: colors.mutedForeground, fontSize: 14, textAlign: 'center' },
  errorText: { color: colors.danger, marginTop: 0 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  title: { color: colors.cardForeground, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.mutedForeground, marginTop: 4, fontSize: 14 },
  meta: { color: colors.primary, marginTop: 8, fontSize: 12, fontWeight: '700' },
  cardTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  quizCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  quizCardRowDisabled: { opacity: 0.65 },
  quizCardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
  quizHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  quizCardOverline: { color: colors.mutedForeground, fontSize: 12 },
  quizCardTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginVertical: 2 },
  quizCardMeta: { color: colors.mutedForeground, fontSize: 12 },
  quizStatusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  quizStatusDone: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  quizStatusPending: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  quizStatusText: { fontSize: 10, fontWeight: '700' },
  quizStatusTextDone: { color: '#047857' },
  quizStatusTextPending: { color: '#92400E' },
  pointRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  pointIndex: { width: 24, height: 24, borderRadius: 999, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  pointIndexText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  pointText: { color: colors.cardForeground, fontSize: 14, flex: 1 },
});
