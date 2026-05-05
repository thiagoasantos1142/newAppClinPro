import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderActionButton from '../components/HeaderActionButton.jsx';
import { AppButton } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { colors, radius, spacing, typography } from '../theme/tokens';

const weekDays = [
  { id: 'monday', label: 'Segunda', shortLabel: 'SEG' },
  { id: 'tuesday', label: 'Terça', shortLabel: 'TER' },
  { id: 'wednesday', label: 'Quarta', shortLabel: 'QUA' },
  { id: 'thursday', label: 'Quinta', shortLabel: 'QUI' },
  { id: 'friday', label: 'Sexta', shortLabel: 'SEX' },
  { id: 'saturday', label: 'Sábado', shortLabel: 'SAB' },
  { id: 'sunday', label: 'Domingo', shortLabel: 'DOM' },
];

export default function OnboardingSelectDayOfWeekScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [selectedDays, setSelectedDays] = useState([]);

  const progress = selectedDays.length > 0 ? 100 : 0;
  const canContinue = selectedDays.length > 0 && !saving;

  const selectedLabel = useMemo(() => {
    if (selectedDays.length === 0) return 'Selecione pelo menos um dia';
    if (selectedDays.length === 7) return 'Todos os dias da semana';
    return `${selectedDays.length} dia${selectedDays.length > 1 ? 's' : ''} por semana`;
  }, [selectedDays.length]);

  const toggleDay = useCallback((dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((item) => item !== dayId) : [...prev, dayId]
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (!canContinue) return;

    try {
      await completeStep('select_day_of_week', {
        availability_days: selectedDays,
        selected_days: selectedDays,
        availability_label: selectedLabel,
      });
      navigation.navigate('OnboardingKYC');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Não foi possível salvar os dias de trabalho.';
      Alert.alert('Erro', message);
    }
  }, [canContinue, completeStep, navigation, selectedDays, selectedLabel]);

  if (!status) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <HeaderActionButton onPress={() => navigation.goBack()} icon="chevron-left" size={24} style={styles.backButton} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Dias de trabalho</Text>
            <Text style={styles.headerSubtitle}>Escolha quando você quer receber oportunidades</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>{selectedLabel}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quais dias da semana você quer trabalhar?</Text>
          <View style={styles.daysGrid}>
            {weekDays.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <Pressable
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  style={[
                    styles.dayCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? 'rgba(31, 128, 234, 0.07)' : colors.card,
                    },
                  ]}
                >
                  <View style={[styles.dayIcon, isSelected && styles.dayIconSelected]}>
                    <Text style={[styles.dayShortLabel, isSelected && styles.dayShortLabelSelected]}>
                      {day.shortLabel}
                    </Text>
                  </View>
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{day.label}</Text>
                  {isSelected ? (
                    <View style={styles.checkmark}>
                      <Feather name="check" size={12} color={colors.primaryForeground} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Feather name="calendar" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Você pode ajustar depois</Text>
            <Text style={styles.infoText}>
              Esses dias ajudam o app a priorizar oportunidades compatíveis com sua rotina.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md }]}>
        <AppButton
          title={saving ? 'Salvando...' : 'Continuar'}
          onPress={handleContinue}
          disabled={!canContinue}
          left={
            saving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
            )
          }
        />
        {!canContinue ? (
          <Text style={styles.footerHelper}>Selecione pelo menos um dia para continuar</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {},
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  progressLabel: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryForeground,
    borderRadius: radius.full,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  daysGrid: {
    gap: spacing.md,
  },
  dayCard: {
    minHeight: 76,
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dayIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 62, 112, 0.06)',
  },
  dayIconSelected: {
    backgroundColor: colors.primary,
  },
  dayShortLabel: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  dayShortLabelSelected: {
    color: colors.primaryForeground,
  },
  dayLabel: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  dayLabelSelected: {
    color: colors.primary,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(31, 128, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  infoText: {
    marginTop: spacing.xs,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 62, 112, 0.08)',
  },
  footerHelper: {
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
  },
});
