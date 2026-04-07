import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton, AppCard, ProgressBar } from '../components/ui.jsx';
import { getTrainingQuizById, submitTrainingQuizById } from '../services/modules/training.service';
import { colors } from '../theme/tokens';

export default function QuizScreen({ route, navigation }) {
  const { trailId, quizId: routeQuizId } = route.params || {};
  const quizId = routeQuizId || trailId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadQuiz = async () => {
        if (!quizId) {
          setError('Quiz não informado');
          setLoading(false);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const response = await getTrainingQuizById(quizId);
          if (!isActive) return;
          setQuiz(response?.quiz || null);
          setCurrentQuestion(0);
          setAnswers({});
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar avaliação');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      void loadQuiz();
      return () => {
        isActive = false;
      };
    }, [quizId])
  );

  const questions = quiz?.questions || [];
  const question = questions[currentQuestion];
  const total = questions.length || 1;
  const answered = question ? answers[question.id] !== undefined : false;
  const progress = useMemo(() => ((currentQuestion + 1) / total) * 100, [currentQuestion, total]);

  const onNext = async () => {
    if (!question) return;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((v) => v + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          selected_option_index: answers[q.id],
        })),
      };
      const result = await submitTrainingQuizById(quizId, payload);
      navigation.replace('QuizResult', {
        trailId: result?.trail_id || trailId,
        quizId,
        result,
        questions,
        selectedAnswers: answers,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Carregando avaliação...</Text>
      </View>
    );
  }

  if (error || !quiz || !question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[styles.centerText, { color: colors.danger }]}>{error || 'Avaliação indisponível'}</Text>
        <AppButton title="Voltar" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Avaliação"
        onBack={() => navigation.goBack()}
        extraContent={
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.headerMeta}>Questão {currentQuestion + 1} de {questions.length}</Text>
              <Text style={styles.headerMeta}>{Math.round(progress)}%</Text>
            </View>
            <ProgressBar value={progress} color="#FFFFFF" style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={styles.questionNumber}>Questão {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </AppCard>

        <View style={{ gap: 8 }}>
          {(question.options || []).map((option, idx) => {
            const selected = answers[question.id] === idx;
            return (
              <Pressable key={`${question.id}-${idx}`} onPress={() => setAnswers((prev) => ({ ...prev, [question.id]: idx }))}>
                <View style={[styles.option, selected && styles.optionSelected]}>
                  <View style={[styles.optionCircle, selected && styles.optionCircleSelected]} />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <AppButton
          title={submitting ? 'Enviando...' : currentQuestion === questions.length - 1 ? 'Finalizar Avaliação' : 'Próxima Questão'}
          onPress={onNext}
          disabled={!answered || submitting}
        />

        {currentQuestion > 0 && (
          <AppButton title="Questão Anterior" variant="secondary" onPress={() => setCurrentQuestion((v) => v - 1)} disabled={submitting} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  centerText: { marginTop: 10, color: colors.mutedForeground, textAlign: 'center' },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 38, height: 38, borderRadius: 12, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  headerMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  questionNumber: { color: colors.primary, fontWeight: '700', marginBottom: 8 },
  questionText: { color: colors.cardForeground, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  option: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  optionCircle: { width: 18, height: 18, borderRadius: 999, borderWidth: 2, borderColor: '#9CA3AF' },
  optionCircleSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { color: colors.cardForeground, fontSize: 14, flex: 1 },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
});
