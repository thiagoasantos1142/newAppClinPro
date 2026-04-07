import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, AppState, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppButton, AppCard } from '../components/ui.jsx';
import { getTrainingLessonById, saveTrainingLessonProgress } from '../services/modules/training.service';
import { colors } from '../theme/tokens';

export default function VideoLessonScreen({ route, navigation }) {
  const AUTO_SAVE_INTERVAL_SECONDS = 15;
  const { trailId, lessonId } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [isThumbnailReady, setIsThumbnailReady] = useState(false);
  const [videoCompletionPercent, setVideoCompletionPercent] = useState(0);
  const lastPersistedSecondRef = useRef(0);
  const highestReachedSecondRef = useRef(0);
  const latestPlaybackSecondRef = useRef(0);
  const previousPlaybackSecondRef = useRef(0);
  const maxSeekAllowedRef = useRef(0);
  const hasAppliedAutoResumeRef = useRef(false);
  const lastSeekWarningAtRef = useRef(0);
  const isSeekWarningOpenRef = useRef(false);
  const lastPlayingRef = useRef(false);
  const isPersistingRef = useRef(false);
  const hasPersistedEndedRef = useRef(false);
  const hasPersistedNinetyEightRef = useRef(false);
  const isSeekRollbackRunningRef = useRef(false);
  const seekRollbackCooldownUntilRef = useRef(0);
  const seekRollbackTimeoutRef = useRef(null);

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
    if (!thumbnailUri) {
      setIsThumbnailReady(false);
      return;
    }

    setIsThumbnailReady(false);
    Image.prefetch(thumbnailUri)
      .catch(() => null)
      .finally(() => {});
  }, [thumbnailUri]);

  useEffect(() => {
    setHasStartedPlayback(false);
  }, [videoUri]);

  useEffect(() => {
    if (!videoUri || hasStartedPlayback) return;

    const interval = setInterval(() => {
      let currentTime = 0;
      let isPlaying = false;
      try {
        currentTime = Number(player.currentTime || 0);
        isPlaying = Boolean(player.playing);
      } catch {
        return;
      }

      if (isPlaying || currentTime > 0) {
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
  const hasQuizRequirement = Boolean(lesson?.is_quiz && questionsCount > 0);
  const canGoToNextLesson = Boolean(nextLesson) && videoCompletionPercent >= 98 && (!hasQuizRequirement || quizCompleted);
  const maxSeekFromApi = useMemo(() => {
    const candidates = [
      lesson?.max_seek_seconds,
      lesson?.max_allowed_seek_seconds,
      lesson?.max_allowed_position_seconds,
      lesson?.max_position_seconds,
      lesson?.progress?.max_seek_seconds,
      lesson?.progress?.max_allowed_position_seconds,
      lesson?.progress?.max_position_seconds,
    ];
    const value = candidates.find((item) => Number.isFinite(Number(item)));
    return Math.max(0, Math.floor(Number(value || 0)));
  }, [
    lesson?.max_allowed_position_seconds,
    lesson?.max_allowed_seek_seconds,
    lesson?.max_position_seconds,
    lesson?.max_seek_seconds,
    lesson?.progress?.max_allowed_position_seconds,
    lesson?.progress?.max_position_seconds,
    lesson?.progress?.max_seek_seconds,
  ]);

  useEffect(() => {
    if (!lesson?.id) return;
    console.log('[VideoLessonScreen] Max seek allowed (s):', maxSeekFromApi);
  }, [lesson?.id, maxSeekFromApi]);
  const readSafePlayerState = useCallback(() => {
    try {
      return {
        currentTime: Math.max(0, Number(player?.currentTime || 0)),
        duration: Math.max(0, Number(player?.duration || lesson?.duration_seconds || 0)),
        isPlaying: Boolean(player?.playing),
      };
    } catch {
      return {
        currentTime: latestPlaybackSecondRef.current,
        duration: Math.max(0, Number(lesson?.duration_seconds || 0)),
        isPlaying: false,
      };
    }
  }, [lesson?.duration_seconds, player]);

  const applyProgressFromResponse = useCallback((response) => {
    const apiProgress = response?.progress || {};
    setData((prev) => ({
      ...prev,
      lesson: prev?.lesson
        ? {
            ...prev.lesson,
            progress_percent: Number(apiProgress?.progress_percent ?? prev.lesson.progress_percent ?? 0),
            last_position_seconds: Number(apiProgress?.last_position_seconds ?? prev.lesson.last_position_seconds ?? 0),
            duration_seconds: Number(apiProgress?.duration_seconds ?? prev.lesson.duration_seconds ?? 0),
            completed: typeof apiProgress?.completed === 'boolean' ? apiProgress.completed : prev.lesson.completed,
          }
        : prev?.lesson,
    }));

    const normalizedPosition = Number(apiProgress?.last_position_seconds || 0);
    if (Number.isFinite(normalizedPosition) && normalizedPosition >= 0) {
      lastPersistedSecondRef.current = Math.floor(normalizedPosition);
      highestReachedSecondRef.current = Math.max(highestReachedSecondRef.current, lastPersistedSecondRef.current);
    }

    const maxUnlockedCandidates = [
      apiProgress?.max_position_seconds,
      apiProgress?.max_allowed_position_seconds,
      apiProgress?.max_seek_seconds,
      apiProgress?.max_allowed_seek_seconds,
    ];
    const maxUnlockedValue = maxUnlockedCandidates.find((item) => Number.isFinite(Number(item)));
    if (Number.isFinite(Number(maxUnlockedValue))) {
      maxSeekAllowedRef.current = Math.max(maxSeekAllowedRef.current, Math.floor(Number(maxUnlockedValue)));
    }
  }, []);

  const persistVideoProgress = useCallback(async (positionSeconds, options = {}) => {
    const { force = false } = options;
    if (!lesson?.id) return null;

    const normalizedPosition = Math.max(0, Math.floor(Number(positionSeconds || 0)));
    const safePosition = Math.max(
      normalizedPosition,
      lastPersistedSecondRef.current,
      Math.floor(highestReachedSecondRef.current)
    );
    if (!force && safePosition <= 0) return null;
    if (!force && Math.abs(safePosition - lastPersistedSecondRef.current) < AUTO_SAVE_INTERVAL_SECONDS) return null;
    if (isPersistingRef.current) return null;

    isPersistingRef.current = true;
    try {
      const response = await saveTrainingLessonProgress(lesson.id, safePosition);
      applyProgressFromResponse(response);
      return response;
    } catch (err) {
      console.log('[VideoLessonScreen] Falha ao persistir progresso:', err?.message || err);
      return null;
    } finally {
      isPersistingRef.current = false;
    }
  }, [AUTO_SAVE_INTERVAL_SECONDS, applyProgressFromResponse, lesson?.id]);

  useEffect(() => {
    lastPersistedSecondRef.current = Math.max(0, Math.floor(Number(lesson?.last_position_seconds || 0)));
    highestReachedSecondRef.current = lastPersistedSecondRef.current;
    latestPlaybackSecondRef.current = lastPersistedSecondRef.current;
    previousPlaybackSecondRef.current = lastPersistedSecondRef.current;
    maxSeekAllowedRef.current = maxSeekFromApi;
    lastPlayingRef.current = false;
    hasPersistedEndedRef.current = false;
    hasPersistedNinetyEightRef.current = false;
    isSeekRollbackRunningRef.current = false;
    seekRollbackCooldownUntilRef.current = 0;
    if (seekRollbackTimeoutRef.current) {
      clearTimeout(seekRollbackTimeoutRef.current);
      seekRollbackTimeoutRef.current = null;
    }
  }, [lesson?.id, lesson?.last_position_seconds, maxSeekFromApi]);

  useEffect(() => {
    hasAppliedAutoResumeRef.current = false;
  }, [lesson?.id, videoUri]);

  useEffect(() => {
    const initialPercent = Math.max(0, Math.min(100, Number(lesson?.progress_percent || 0)));
    setVideoCompletionPercent(initialPercent);
  }, [lesson?.id, lesson?.progress_percent]);

  useEffect(() => {
    if (!videoUri || loading || error || !lesson?.id || hasAppliedAutoResumeRef.current) return;

    const lastPosition = Math.max(0, Math.floor(Number(lesson?.last_position_seconds || 0)));
    if (!lastPosition) {
      hasAppliedAutoResumeRef.current = true;
      return;
    }

    const interval = setInterval(() => {
      try {
        const duration = Math.max(0, Number(player?.duration || lesson?.duration_seconds || 0));
        if (duration <= 0) return;

        const target = Math.min(lastPosition, duration);
        if (target <= 0) {
          hasAppliedAutoResumeRef.current = true;
          clearInterval(interval);
          return;
        }

        const currentTime = Math.max(0, Number(player?.currentTime || 0));
        const isPlaying = Boolean(player?.playing);

        if (!isPlaying && currentTime < 1) {
          player.currentTime = 0;
          latestPlaybackSecondRef.current = 0;
          previousPlaybackSecondRef.current = 0;
          player.play();
          return;
        }

        if (currentTime >= 1) {
          player.currentTime = target;
          maxSeekAllowedRef.current = Math.max(maxSeekAllowedRef.current, target);
          highestReachedSecondRef.current = Math.max(highestReachedSecondRef.current, target);
          latestPlaybackSecondRef.current = target;
          previousPlaybackSecondRef.current = target;
          player.pause();
          hasAppliedAutoResumeRef.current = true;
          clearInterval(interval);
        }
      } catch {
        // Aguarda o player ficar pronto.
      }
    }, 200);

    return () => clearInterval(interval);
  }, [error, lesson?.duration_seconds, lesson?.id, lesson?.last_position_seconds, loading, player, videoUri]);

  useEffect(() => {
    if (!videoUri || loading || error || !lesson?.id) return;

    const interval = setInterval(() => {
      const { currentTime, duration, isPlaying } = readSafePlayerState();
      const previousTime = previousPlaybackSecondRef.current;
      const delta = currentTime - previousTime;
      const effectiveMaxSeek = maxSeekAllowedRef.current;
      const progressFromPlayback = duration > 0 ? (currentTime / duration) * 100 : 0;
      const progressFromApi = Number(lesson?.progress_percent || 0);
      const bestProgress = Math.max(progressFromPlayback, progressFromApi);
      setVideoCompletionPercent((prev) => (bestProgress > prev ? Math.min(100, bestProgress) : prev));

      // Bloqueia apenas pulos grandes para frente (seek manual).
      // Tolerancias maiores evitam travar reproducao normal por variacao de buffering/HLS.
      const jumpedFarAhead = delta > 8;
      if (currentTime > effectiveMaxSeek + 2 && jumpedFarAhead) {
        const now = Date.now();
        const shouldRollbackNow =
          !isSeekRollbackRunningRef.current && now >= seekRollbackCooldownUntilRef.current;
        if (shouldRollbackNow) {
          isSeekRollbackRunningRef.current = true;
          if (seekRollbackTimeoutRef.current) clearTimeout(seekRollbackTimeoutRef.current);

          const shouldResumePlayback = isPlaying;
          seekRollbackTimeoutRef.current = setTimeout(() => {
            try {
              player.currentTime = effectiveMaxSeek;
              if (shouldResumePlayback) {
                player.play();
              }
            } catch {
              // Ignora erro se o player estiver em desmontagem.
            } finally {
              isSeekRollbackRunningRef.current = false;
              seekRollbackCooldownUntilRef.current = Date.now() + 1000;
              seekRollbackTimeoutRef.current = null;
            }
          }, 120);
        }

        const canWarn = now - lastSeekWarningAtRef.current > 3000;
        if (canWarn && !isSeekWarningOpenRef.current) {
          lastSeekWarningAtRef.current = now;
          isSeekWarningOpenRef.current = true;
          Alert.alert(
            'Aviso',
            'Você ainda não pode adiantar o vídeo. Continue assistindo para liberar os próximos minutos.',
            [
              {
                text: 'OK',
                onPress: () => {
                  isSeekWarningOpenRef.current = false;
                },
              },
            ],
            {
              cancelable: true,
              onDismiss: () => {
                isSeekWarningOpenRef.current = false;
              },
            }
          );
        }

        latestPlaybackSecondRef.current = effectiveMaxSeek;
        previousPlaybackSecondRef.current = effectiveMaxSeek;
        return;
      }

      latestPlaybackSecondRef.current = currentTime;
      previousPlaybackSecondRef.current = currentTime;
      if (isPlaying && delta > 0 && delta <= 8) {
        highestReachedSecondRef.current = Math.max(highestReachedSecondRef.current, currentTime);
      }

      // Enquanto reproduz naturalmente, o teto local avanca junto.
      if (isPlaying && currentTime > maxSeekAllowedRef.current && delta > 0 && delta <= 8) {
        maxSeekAllowedRef.current = currentTime;
      }

      if (isPlaying && currentTime - lastPersistedSecondRef.current >= AUTO_SAVE_INTERVAL_SECONDS) {
        void persistVideoProgress(currentTime);
      }

      if (!hasPersistedNinetyEightRef.current && duration > 0 && currentTime / duration >= 0.98) {
        hasPersistedNinetyEightRef.current = true;
        void persistVideoProgress(currentTime, { force: true });
      }

      if (lastPlayingRef.current && !isPlaying) {
        void persistVideoProgress(currentTime, { force: true });
      }

      if (!hasPersistedEndedRef.current && duration > 0 && currentTime >= duration - 1) {
        hasPersistedEndedRef.current = true;
        void persistVideoProgress(duration, { force: true });
      }

      if (currentTime < duration - 3) {
        hasPersistedEndedRef.current = false;
      }
      if (duration > 0 && currentTime / duration < 0.97) {
        hasPersistedNinetyEightRef.current = false;
      }

      lastPlayingRef.current = isPlaying;
    }, 1000);

    return () => clearInterval(interval);
  }, [AUTO_SAVE_INTERVAL_SECONDS, error, lesson?.duration_seconds, lesson?.id, lesson?.progress_percent, loading, persistVideoProgress, player, readSafePlayerState, videoUri]);

  useEffect(() => {
    return () => {
      if (seekRollbackTimeoutRef.current) {
        clearTimeout(seekRollbackTimeoutRef.current);
        seekRollbackTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') return;
      const currentTime = latestPlaybackSecondRef.current;
      void persistVideoProgress(currentTime, { force: true });
    });

    return () => {
      subscription.remove();
    };
  }, [persistVideoProgress]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        const currentTime = latestPlaybackSecondRef.current;
        void persistVideoProgress(currentTime, { force: true });
      };
    }, [persistVideoProgress])
  );

  return (
    <View style={styles.container}>
      <AppScreenHeader
        onBack={() => navigation.goBack()}
        titleContent={
          <View>
            <Text style={styles.trailText}>{resolvedTrailId ? `Trilha ${resolvedTrailId}` : 'Treinamento'}</Text>
            <Text style={styles.headerTitle}>Aula</Text>
          </View>
        }
      />

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
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.thumbnailImage}
                  resizeMode="contain"
                  onLoad={() => setIsThumbnailReady(true)}
                  onError={() => setIsThumbnailReady(true)}
                />
                {!isThumbnailReady && (
                  <View style={styles.thumbnailLoadingOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
                {isThumbnailReady && (
                  <View style={styles.thumbnailPlayBadge}>
                    <Feather name="play" size={28} color="#FFFFFF" />
                  </View>
                )}
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

          {nextLesson && (
            <>
              <AppButton
              title={`Próxima Aula: ${nextLesson.title}${nextLesson.is_quiz ? ' (com perguntas)' : ''}`}
              disabled={!canGoToNextLesson}
              onPress={() => {
                navigation.goBack();
                setTimeout(() => {
                  navigation.navigate('VideoLesson', { trailId: resolvedTrailId, lessonId: nextLesson.id });
                }, 0);
              }}
              left={<Feather name="skip-forward" size={16} color="#FFFFFF" />}
              />
              {!canGoToNextLesson && (
                <Text style={styles.requirementsHint}>
                  {!hasQuizRequirement || quizCompleted
                    ? `Assista pelo menos 98% do vídeo para liberar a próxima aula. (${Math.floor(videoCompletionPercent)}%)`
                    : `Assista 98% do vídeo e passe no quiz para liberar a próxima aula. (${Math.floor(videoCompletionPercent)}%)`}
                </Text>
              )}
            </>
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
  thumbnailLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
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
  requirementsHint: { color: colors.mutedForeground, fontSize: 12, marginTop: -4 },
});
