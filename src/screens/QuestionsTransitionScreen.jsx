import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, ProgressBar } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { useQuestionsFlow } from '../context/QuestionsFlowContext';
import { getRouteForStep } from '../navigation/onboardingStepMap';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function QuestionsTransitionScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const { questionsData, resetQuestionsData } = useQuestionsFlow();
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const totalSteps = 7;
  const completedSteps = status?.steps ? Object.values(status.steps).filter(Boolean).length : 0;
  const currentStepNumber = Math.min(completedSteps + 1, totalSteps);

  useEffect(() => {
    if (!status) {
      setIsInitialLoading(true);
      return;
    }
    setIsInitialLoading(false);
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    // Se não estamos no step "questions", redireciona
    if (status.current_step !== 'questions') {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    try {
      setError(null);
      // Aqui é a ÚNICA vez que completeStep("questions") é chamado
      await completeStep('questions', questionsData);
      // Reseta o contexto para o próximo fluxo
      resetQuestionsData();
      // Backend agora retorna current_step = "profile"
      // A lógica do OnboardingGate vai navegar automaticamente
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erro ao continuar.';
      setError(message);
    }
  }, [questionsData, completeStep, resetQuestionsData]);

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.progressWrap, { paddingTop: insets.top + spacing.md }]}>
        <ProgressBar value={(currentStepNumber / totalSteps) * 100} height={6} />
        <Text style={styles.progressText}>
          Passo {currentStepNumber} de {totalSteps}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=1080&q=80',
            }}
            style={styles.headerImage}
            imageStyle={styles.headerImageStyle}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeEmoji}>✨</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.panel}>
          <Text style={styles.headline}>Perfeito! 💜</Text>
          <Text style={styles.subtitle}>
            Agora vamos montar seu perfil profissional.
          </Text>

          <View style={styles.infoCardsWrap}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcons}>
                <Text style={styles.infoEmoji}>✨</Text>
              </View>
              <Text style={styles.infoTitle}>Seu perfil será sua vitrine</Text>
              <Text style={styles.infoText}>
                Mostre sua experiência, serviços e ganhe mais visibilidade
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcons}>
                <Text style={styles.infoEmoji}>⚡</Text>
              </View>
              <Text style={styles.infoTitle}>Leva menos de 2 minutos</Text>
              <Text style={styles.infoText}>
                Vamos fazer isso rapidinho pra você começar a receber jobs
              </Text>
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
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm },
        ]}
      >
        <AppButton
          title={loading ? 'Salvando...' : 'Continuar'}
          onPress={handleContinue}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.md,
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
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  headerImage: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageStyle: {
    borderRadius: radius.lg,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,128,234,0.55)',
  },
  badgeWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  badgeEmoji: {
    fontSize: 42,
  },
  panel: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  headline: {
    textAlign: 'center',
    color: colors.cardForeground,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  infoCardsWrap: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(31,128,234,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(31,128,234,0.15)',
  },
  infoIcons: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(31,128,234,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  infoText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  errorCard: {
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,62,112,0.08)',
  },
  primaryButton: {
    borderRadius: radius.xl,
    paddingVertical: 16,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
