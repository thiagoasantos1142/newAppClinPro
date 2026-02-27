import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppButton, AppCard } from '../components/ui.jsx';
import { getTrainingLessonById, saveTrainingLessonProgress } from '../services/modules/training.service';
import { colors } from '../theme/tokens';

export default function VideoLessonScreen({ route, navigation }) {
  const { trailId, lessonId } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

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
  const video = lesson?.video || null;
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
  const videoUri = useMemo(() => {
    const rawVideoUrl = String(video?.video_url || lesson?.video_url || '').trim();
    if (!rawVideoUrl) return null;
    return rawVideoUrl;
  }, [lesson?.video_url, video?.video_url]);
  const thumbnailUri = useMemo(() => {
    const rawThumbnailUrl = String(video?.thumbnail_url || lesson?.thumbnail_url || '').trim();
    if (!rawThumbnailUrl) return null;
    return rawThumbnailUrl;
  }, [lesson?.thumbnail_url, video?.thumbnail_url]);

  const player = useVideoPlayer(
    videoUri
      ? {
          uri: videoUri,
          contentType: 'hls',
        }
      : null,
    (instance) => {
      instance.loop = false;
    }
  );

  useEffect(() => {
    if (!videoUri) return;
    console.log('[VideoLessonScreen] Video URL:', videoUri);
  }, [videoUri]);

  useEffect(() => {
    if (!thumbnailUri) return;
    console.log('[VideoLessonScreen] Thumbnail URL:', thumbnailUri);
  }, [thumbnailUri]);

  useEffect(() => {
    setHasStartedPlayback(false);
  }, [videoUri]);

  useEffect(() => {
    if (!videoUri || hasStartedPlayback) return;

    const interval = setInterval(() => {
      const currentTime = Number(player.currentTime || 0);
      if (player.playing || currentTime > 0) {
        setHasStartedPlayback(true);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [hasStartedPlayback, player, videoUri]);

  const subtitle = useMemo(() => {
    const description = video?.description || lesson?.description;
    if (!description) return 'Sem descrição informada.';
    return description;
  }, [lesson?.description, video?.description]);

  const lessonTitle = video?.title || lesson?.title || 'Aula';
  const durationLabel = video?.duration_label || lesson?.duration_label || null;

  const handleMarkComplete = useCallback(async () => {
    if (!lesson?.id || savingProgress) return;
    setSavingProgress(true);
    try {
      await saveTrainingLessonProgress(lesson.id, { progress_percent: 100, completed: true });
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
        {videoUri && !loading && !error ? (
          <>
            <VideoView
              style={styles.video}
              player={player}
              nativeControls
              contentFit="contain"
            />
            {!!thumbnailUri && !hasStartedPlayback && (
              <View pointerEvents="none" style={styles.thumbnailOverlay}>
                <Image source={{ uri: thumbnailUri }} style={styles.thumbnailImage} resizeMode="contain" />
                <View style={styles.thumbnailPlayBadge}>
                  <Feather name="play" size={28} color="#FFFFFF" />
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.videoTouch}>
            <View style={styles.videoCenter}>
              <View style={styles.playBtn}>
                <Feather name="play" size={28} color="#FFF" />
              </View>
              <Text style={styles.videoLabel}>
                {loading ? 'Carregando aula...' : error ? 'Falha ao carregar vídeo' : 'Vídeo indisponível'}
              </Text>
            </View>
          </View>
        )}
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
            <Text style={styles.title}>{lessonTitle}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {!!durationLabel && <Text style={styles.meta}>{durationLabel}</Text>}
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
  videoBox: { backgroundColor: '#111827', height: 220, justifyContent: 'center', overflow: 'hidden' },
  video: { width: '100%', height: '100%', backgroundColor: '#000' },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlayBadge: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTouch: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoCenter: { alignItems: 'center' },
  playBtn: { width: 72, height: 72, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  videoLabel: { color: 'rgba(255,255,255,0.8)', marginTop: 10 },
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
