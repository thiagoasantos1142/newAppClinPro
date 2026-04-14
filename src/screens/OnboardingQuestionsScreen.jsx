import React, { useCallback, useEffect, useState } from 'react';
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
import { AppButton } from '../components/ui.jsx';
import OnboardingStepProgress from '../components/OnboardingStepProgress.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';

export default function OnboardingQuestionsScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const options = [
    { value: '1-2', label: '1 a 2 dias' },
    { value: '3-4', label: '3 a 4 dias' },
    { value: '5-mais', label: '5 dias ou mais' },
    { value: 'variavel', label: 'Varia muito' },
  ];

  const availabilityPayloadMap = {
    '1-2': {
      availability_label: '1 a 2 dias por semana',
      availability_days: ['monday', 'tuesday'],
    },
    '3-4': {
      availability_label: '3 a 4 dias por semana',
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday'],
    },
    '5-mais': {
      availability_label: '5 dias ou mais por semana',
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    variavel: {
      availability_label: 'Disponibilidade variável',
      availability_days: [],
    },
  };

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (!canAccessStep(status, 'questions')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const handleContinue = useCallback(async () => {
    try {
      setError(null);
      if (loading || !status) {
        return;
      }
      if (status.current_step !== 'questions') {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      if (status?.steps?.questions) {
        navigation.navigate('OnboardingTransition');
        return;
      }
      if (!selectedOption) {
        return;
      }
      await completeStep('questions', {
        work_areas: ['Residencial'],
        ...(availabilityPayloadMap[selectedOption] || availabilityPayloadMap.variavel),
      });
      navigation.navigate('OnboardingTransition');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      setError(message);
    }
  }, [completeStep, navigation, status, loading, selectedOption]);

  const handleSelectOption = useCallback((value) => {
    setSelectedOption(value);
  }, []);

  return (
    <View style={styles.container}>
      <OnboardingStepProgress step={2} totalSteps={6} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <ImageBackground
            source={{
              uri:
                'https://images.unsplash.com/photo-1657040298726-7189d3090d5e?auto=format&fit=crop&w=1080&q=80',
            }}
            style={styles.headerImage}
            imageStyle={styles.headerImageStyle}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
              <Text style={styles.headerEyebrow}>Estamos quase la</Text>
              <Text style={styles.headerTitle}>Vamos entender sua rotina</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.panel}>
          <Text style={styles.questionTitle}>
            Hoje, quantos dias por semana voce consegue trabalhar?
          </Text>

          <View style={styles.optionList}>
            {options.map((option) => {
              const isSelected = selectedOption === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelectOption(option.value)}
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

          <Text style={styles.helperText}>Voce pode ajustar isso depois.</Text>

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
          title={loading ? 'Salvando...' : 'Continuar'}
          onPress={handleContinue}
          disabled={loading || !status || !selectedOption}
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
