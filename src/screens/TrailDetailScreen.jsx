import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, AppButton, ProgressBar } from '../components/ui.jsx';
import { trails } from '../data/mockData';
import { colors } from '../theme/tokens';

export default function TrailDetailScreen({ route, navigation }) {
  const { trailId } = route.params || {};
  const trail = trails.find((item) => item.id === String(trailId)) || trails[0];

  const onOpenLesson = (lesson) => {
    if (lesson.locked) return;
    if (lesson.isQuiz) {
      navigation.navigate('Quiz', { trailId: trail.id });
      return;
    }
    navigation.navigate('VideoLesson', { trailId: trail.id, lessonId: lesson.id });
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

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={styles.title}>{trail.title}</Text>
          <Text style={styles.muted}>{trail.description}</Text>
          <Text style={[styles.muted, { marginTop: 10 }]}>{trail.lessonsCount} aulas • {trail.duration}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>{trail.completed}/{trail.lessonsCount} concluídas</Text>
            <Text style={styles.percent}>{trail.progress}%</Text>
          </View>
          <ProgressBar value={trail.progress} style={{ marginTop: 8 }} />
        </AppCard>

        <Text style={styles.sectionTitle}>Aulas</Text>
        <View style={styles.lessonList}>
          {trail.lessons.map((lesson, index) => (
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
          ))}
        </View>

        {trail.progress === 100 && (
          <AppButton title="Ver Certificado" onPress={() => navigation.navigate('Certificate', { trailId: trail.id })} />
        )}
      </ScrollView>
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

