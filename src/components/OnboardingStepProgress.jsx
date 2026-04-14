import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from './ui.jsx';
import { colors, spacing, typography } from '../theme/tokens';

export default function OnboardingStepProgress({ step, totalSteps }) {
  const insets = useSafeAreaInsets();
  const value = Math.round((step / totalSteps) * 100);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.md }]}>
      <ProgressBar value={value} height={6} />
      <Text style={styles.text}>Passo {step} de {totalSteps}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  text: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
