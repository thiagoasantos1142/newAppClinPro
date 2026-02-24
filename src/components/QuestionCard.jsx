import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, ProgressBar } from './ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function QuestionCard({
  currentStepNumber,
  totalSteps,
  headerEmoji,
  headerText,
  headerTitle,
  headerImageUrl,
  questionText,
  options,
  selectedOption,
  onSelectOption,
  microText,
  buttonText = 'Continuar',
  onContinue,
  isButtonLoading,
  error,
  isInitialLoading = false,
}) {
  const insets = useSafeAreaInsets();

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

  const isButtonDisabled = !selectedOption || isButtonLoading;

  return (
    <View style={styles.container}>
      <View style={[styles.progressWrap, { paddingTop: insets.top + spacing.md }]}>
        <ProgressBar value={(currentStepNumber / totalSteps) * 100} height={6} />
        <Text style={styles.progressText}>
          Passo {currentStepNumber} de {totalSteps}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {headerImageUrl ? (
          <View style={styles.headerWrap}>
            <ImageBackground
              source={{ uri: headerImageUrl }}
              style={styles.headerImage}
              imageStyle={styles.headerImageStyle}
            >
              <View style={styles.headerOverlay} />
              <View style={styles.headerContent}>
                {headerText ? (
                  <Text style={styles.headerEyebrow}>
                    {headerText} {headerEmoji || ''}
                  </Text>
                ) : null}
                <Text style={styles.headerTitle}>{headerTitle}</Text>
              </View>
            </ImageBackground>
          </View>
        ) : (
          <View style={styles.headerWrapNoImage}>
            <View style={styles.heroBubble}>
              <Text style={styles.heroEmoji}>{headerEmoji || '🎯'}</Text>
            </View>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{headerText}</Text>
          </View>
        )}

        <View style={styles.panel}>
          <Text style={styles.questionTitle}>{questionText}</Text>

          <View style={styles.optionList}>
            {options.map((option) => {
              const isSelected = selectedOption === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onSelectOption(option.value)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <View style={styles.optionCheck}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {microText ? <Text style={styles.helperText}>{microText}</Text> : null}

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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
        <AppButton
          title={isButtonLoading ? 'Salvando...' : buttonText}
          onPress={onContinue}
          disabled={isButtonDisabled}
          style={styles.primaryButton}
          left={
            isButtonLoading ? (
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
  },
  headerImageStyle: {
    borderRadius: radius.lg,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,128,234,0.55)',
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  headerWrapNoImage: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  heroBubble: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: 'rgba(31,128,234,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: {
    fontSize: 48,
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  questionTitle: {
    color: colors.cardForeground,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  optionList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionCard: {
    height: 60,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(26,62,112,0.12)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(31,128,234,0.08)',
  },
  optionLabel: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  optionCheck: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
  },
  errorCard: {
    marginTop: spacing.md,
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
