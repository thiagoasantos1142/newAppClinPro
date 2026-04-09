import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, ProgressBar } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingWelcomeScreen({ navigation }) {
  const { status, completeStep, loading, refresh } = useOnboarding();
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  const totalSteps = 7;
  const completedSteps = useMemo(() => {
    if (!status?.steps) return 0;
    return Object.values(status.steps).filter(Boolean).length;
  }, [status]);
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);
  const progressPercent = status?.progress_percent ?? 0;

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }

    // If welcome has already been completed, the user should not stay on this screen.
    if (status?.steps?.welcome) {
      // Prefer navigating to the current step (e.g. questions) so we follow backend status.
      navigation.reset({
        index: 0,
        routes: [{ name: getRouteForStep(status.current_step) }],
      });
      return;
    }

    if (!canAccessStep(status, 'welcome')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleStart = useCallback(async () => {
    try {
      setError(null);
      if (loading) {
        return;
      }
      const currentStatus = status || (await refresh());
      if (!currentStatus) {
        return;
      }
      if (currentStatus?.steps?.welcome) {
        if (currentStatus.current_step === 'welcome') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'QuestionsClients' }],
          });
          return;
        }
        navigation.navigate(getRouteForStep(currentStatus.current_step));
        return;
      }
      if (currentStatus.current_step !== 'welcome') {
        navigation.navigate(getRouteForStep(currentStatus.current_step));
        return;
      }
      const result = await completeStep('welcome');
      navigation.navigate(getRouteForStep(result.current_step));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      setError(message);
    }
  }, [completeStep, navigation, status, loading, refresh]);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundOrbOne} />
      <View style={styles.backgroundOrbTwo} />

      <View style={[styles.progressWrap, { paddingTop: insets.top + spacing.md }]}>
        <ProgressBar value={progressPercent} height={6} />
        <Text style={styles.progressText}>Passo {currentStepNumber} de {totalSteps}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBubble}>
          <Text style={styles.heroEmoji}>👋</Text>
        </View>

        <View style={styles.heroTextWrap}>
          <Text style={styles.title}>Bem-vinda ao Clin Pro</Text>
          <Text style={styles.subtitle}>
            Aqui voce organiza seu trabalho, cresce como profissional e recebe com seguranca.
          </Text>
        </View>

        <View style={styles.pillList}>
          <View style={styles.pill}>
            <View style={[styles.pillIcon, styles.pillIconBlue]}>
              <Text style={styles.pillEmoji}>📅</Text>
            </View>
            <Text style={styles.pillText}>Organize sua agenda</Text>
          </View>
          <View style={styles.pill}>
            <View style={[styles.pillIcon, styles.pillIconGreen]}>
              <Text style={styles.pillEmoji}>💰</Text>
            </View>
            <Text style={styles.pillText}>Receba com seguranca</Text>
          </View>
          <View style={styles.pill}>
            <View style={[styles.pillIcon, styles.pillIconPurple]}>
              <Text style={styles.pillEmoji}>🎓</Text>
            </View>
            <Text style={styles.pillText}>Aprenda e cresca</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={18} color={colors.danger} />
            </View>
            <View style={styles.errorTextWrap}>
              <Text style={styles.errorTitle}>Erro</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
        <AppButton
          title={loading ? 'Carregando...' : 'Comecar'}
          onPress={handleStart}
          disabled={loading}
          style={styles.primaryButton}
          left={
            loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
            )
          }
        />
        <Text style={styles.footerNote}>Leva apenas 3 minutos para comecar</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundOrbOne: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(31,128,234,0.08)',
  },
  backgroundOrbTwo: {
    position: 'absolute',
    bottom: -140,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(31,128,234,0.06)',
  },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressText: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  heroBubble: {
    width: 128,
    height: 128,
    borderRadius: radius.full,
    backgroundColor: 'rgba(31,128,234,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroTextWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  pillList: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(26,62,112,0.08)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillEmoji: {
    fontSize: 20,
  },
  pillText: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  pillIconBlue: { backgroundColor: '#E7F2FF' },
  pillIconGreen: { backgroundColor: '#E9F8F0' },
  pillIconPurple: { backgroundColor: '#F2EDFF' },
  errorCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(229,72,77,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229,72,77,0.2)',
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(229,72,77,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTextWrap: {
    flex: 1,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  primaryButton: {
    borderRadius: radius.xl,
    paddingVertical: 18,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  footerNote: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
  },
});