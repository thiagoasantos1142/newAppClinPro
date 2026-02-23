import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard, ProgressBar } from '../components/ui.jsx';
import { trails } from '../data/mockData';
import { colors } from '../theme/tokens';

export default function VideoLessonScreen({ route, navigation }) {
  const { trailId, lessonId } = route.params || {};
  const trail = trails.find((item) => item.id === String(trailId)) || trails[0];
  const lesson = trail.lessons.find((item) => item.id === String(lessonId)) || trail.lessons[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(45);

  const nextLesson = useMemo(() => {
    const currentIndex = trail.lessons.findIndex((item) => item.id === lesson.id);
    if (currentIndex < 0) return null;
    return trail.lessons[currentIndex + 1] || null;
  }, [trail, lesson]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.trailText}>{trail.title}</Text>
            <Text style={styles.headerTitle}>Aula</Text>
          </View>
        </View>
      </View>

      <View style={styles.videoBox}>
        <Pressable style={styles.videoTouch} onPress={() => setIsPlaying((v) => !v)}>
          <View style={styles.videoCenter}>
            <View style={styles.playBtn}>
              <Feather name={isPlaying ? 'pause' : 'play'} size={28} color="#FFF" />
            </View>
            <Text style={styles.videoLabel}>Vídeo da Aula</Text>
          </View>
        </Pressable>
        <View style={styles.videoProgressWrap}><ProgressBar value={progress} color="#FFFFFF" /></View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.subtitle}>Aprenda as melhores técnicas para uma execução eficiente e profissional.</Text>
        </View>

        <AppCard>
          <Text style={styles.cardTitle}>Pontos Principais</Text>
          {[
            'Escolha a ferramenta adequada para cada superfície',
            'Mantenha sequência lógica para ganhar velocidade',
            'Revise detalhes finais antes de encerrar',
          ].map((item, idx) => (
            <View key={item} style={styles.pointRow}>
              <View style={styles.pointIndex}><Text style={styles.pointIndexText}>{idx + 1}</Text></View>
              <Text style={styles.pointText}>{item}</Text>
            </View>
          ))}
        </AppCard>

        <AppButton
          title="Marcar como Concluída"
          onPress={() => setProgress(100)}
          left={<Feather name="check-circle" size={16} color="#FFF" />}
        />

        {nextLesson && !nextLesson.isQuiz && (
          <AppButton
            title={`Próxima Aula: ${nextLesson.title}`}
            variant="secondary"
            onPress={() => navigation.replace('VideoLesson', { trailId: trail.id, lessonId: nextLesson.id })}
            left={<Feather name="skip-forward" size={16} color={colors.cardForeground} />}
          />
        )}

        {nextLesson && nextLesson.isQuiz && (
          <AppButton
            title="Ir para Avaliação"
            variant="secondary"
            onPress={() => navigation.navigate('Quiz', { trailId: trail.id })}
            left={<Feather name="award" size={16} color={colors.cardForeground} />}
          />
        )}
      </ScrollView>
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
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  title: { color: colors.cardForeground, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.mutedForeground, marginTop: 4, fontSize: 14 },
  cardTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  pointRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  pointIndex: { width: 24, height: 24, borderRadius: 999, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  pointIndexText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  pointText: { color: colors.cardForeground, fontSize: 14, flex: 1 },
});

