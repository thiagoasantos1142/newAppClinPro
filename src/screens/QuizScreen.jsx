import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard, ProgressBar } from '../components/ui.jsx';
import { quizQuestions } from '../data/mockData';
import { colors } from '../theme/tokens';

export default function QuizScreen({ route, navigation }) {
  const { trailId } = route.params || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = quizQuestions[currentQuestion];
  const total = quizQuestions.length;
  const answered = answers[currentQuestion] !== undefined;

  const progress = useMemo(() => ((currentQuestion + 1) / total) * 100, [currentQuestion, total]);

  const onNext = () => {
    if (currentQuestion === total - 1) {
      const score = quizQuestions.reduce((acc, q, idx) => (answers[idx] === q.correctAnswer ? acc + 1 : acc), 0);
      navigation.replace('QuizResult', { trailId, score, total, answers });
      return;
    }
    setCurrentQuestion((v) => v + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Avaliação</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.headerMeta}>Questão {currentQuestion + 1} de {total}</Text>
          <Text style={styles.headerMeta}>{Math.round(progress)}%</Text>
        </View>
        <ProgressBar value={progress} color="#FFFFFF" style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.3)' }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={styles.questionNumber}>Questão {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </AppCard>

        <View style={{ gap: 8 }}>
          {question.options.map((option, idx) => {
            const selected = answers[currentQuestion] === idx;
            return (
              <Pressable key={option} onPress={() => setAnswers((prev) => ({ ...prev, [currentQuestion]: idx }))}>
                <View style={[styles.option, selected && styles.optionSelected]}>
                  <View style={[styles.optionCircle, selected && styles.optionCircleSelected]} />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <AppButton title={currentQuestion === total - 1 ? 'Finalizar Avaliação' : 'Próxima Questão'} onPress={onNext} disabled={!answered} />

        {currentQuestion > 0 && (
          <AppButton title="Questão Anterior" variant="secondary" onPress={() => setCurrentQuestion((v) => v - 1)} />
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  headerMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  questionNumber: { color: colors.primary, fontWeight: '700', marginBottom: 8 },
  questionText: { color: colors.cardForeground, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  option: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  optionCircle: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  optionCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: { color: colors.cardForeground, fontSize: 14, flex: 1 },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
});

