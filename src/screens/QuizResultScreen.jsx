import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';

export default function QuizResultScreen({ route, navigation }) {
  const { trailId, quizId, result, questions = [], selectedAnswers = {} } = route.params || {};

  const score = Number(result?.score || 0);
  const total = Number(result?.total || questions.length || 1);
  const percentage = Math.round(Number(result?.percentage ?? ((score / Math.max(total, 1)) * 100)));
  const passed = Boolean(result?.passed ?? percentage >= 70);
  const certificateId = result?.certificate_id;
  const answersReview = Array.isArray(result?.answers_review) ? result.answers_review : [];

  const reviewItems = useMemo(() => {
    if (answersReview.length > 0) {
      return answersReview.map((r, idx) => ({
        key: String(r.question_id ?? idx),
        label: `Questão ${idx + 1}`,
        correct: Boolean(r.correct),
      }));
    }
    return questions.map((q, idx) => {
      const selected = selectedAnswers[q.id];
      const correctIndex = q.correct_option_index ?? q.correctAnswer;
      return { key: String(q.id), label: `Questão ${idx + 1}`, correct: selected === correctIndex };
    });
  }, [answersReview, questions, selectedAnswers]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: passed ? colors.primary : '#F59E0B' }]}>
        <View style={styles.headerCircle}>
          <MaterialCommunityIcons name={passed ? 'trophy-outline' : 'trending-up'} size={34} color="#FFF" />
        </View>
        <Text style={styles.headerTitle}>{passed ? 'Parabéns!' : 'Quase lá!'}</Text>
        <Text style={styles.headerSub}>{passed ? 'Você passou na avaliação!' : 'Continue estudando e tente novamente'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={styles.centerMuted}>Sua Pontuação</Text>
          <Text style={styles.score}>{score}/{total}</Text>
          <View style={styles.percentBadge}><Text style={styles.percentText}>{percentage}%</Text></View>
          <Text style={[styles.centerMuted, { marginTop: 8 }]}>Nota mínima: {result?.passing_score_percent || 70}%</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.reviewTitle}>Revisão das Respostas</Text>
          <View style={{ gap: 8 }}>
            {reviewItems.map((item) => (
              <View key={item.key} style={[styles.reviewItem, item.correct ? styles.correct : styles.wrong]}>
                <Feather name={item.correct ? 'check-circle' : 'x-circle'} size={16} color={item.correct ? colors.primary : '#DC2626'} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.centerMuted}>{item.label}</Text>
                  <Text style={styles.reviewQuestion}>{item.correct ? 'Resposta correta' : 'Resposta incorreta'}</Text>
                </View>
              </View>
            ))}
          </View>
        </AppCard>

        {passed ? (
          <>
            <AppButton
              title="Ver Certificado"
              onPress={() => navigation.replace('Certificate', { trailId, certificateId })}
              left={<MaterialCommunityIcons name="certificate-outline" size={16} color="#FFF" />}
            />
            <AppButton title="Voltar para a Trilha" variant="secondary" onPress={() => navigation.navigate('TrailDetail', { trailId })} />
          </>
        ) : (
          <>
            <AppButton title="Tentar Novamente" onPress={() => navigation.replace('Quiz', { trailId, quizId })} left={<Feather name="rotate-ccw" size={16} color="#FFF" />} />
            <AppButton title="Revisar Conteúdo" variant="secondary" onPress={() => navigation.navigate('TrailDetail', { trailId })} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  headerCircle: { width: 72, height: 72, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginTop: 12 },
  headerSub: { color: 'rgba(255,255,255,0.92)', marginTop: 4, fontSize: 13 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  centerMuted: { color: colors.mutedForeground, textAlign: 'center', fontSize: 12 },
  score: { color: colors.primary, fontSize: 42, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  percentBadge: { alignSelf: 'center', backgroundColor: colors.secondary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 8 },
  percentText: { color: colors.primary, fontWeight: '800', fontSize: 22 },
  reviewTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  reviewItem: { borderRadius: 12, borderWidth: 1, padding: 10, flexDirection: 'row', gap: 8 },
  correct: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  wrong: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  reviewQuestion: { color: colors.cardForeground, fontSize: 13 },
});
