import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

export function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppButton({ title, onPress, variant = 'primary', disabled = false, style, textStyle, left }) {
  const variantStyle = buttonVariants[variant] || buttonVariants.primary;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {left}
      <Text style={[styles.buttonText, variantStyle.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

export function Badge({ text, tone = 'default' }) {
  const badgeStyle = tone === 'success' ? styles.badgeSuccess : styles.badgeDefault;
  const textStyle = tone === 'success' ? styles.badgeTextSuccess : styles.badgeTextDefault;
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{text}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary, height = 8, style }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.progressTrack, { height }, style]}>
      <View style={[styles.progressFill, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
}

const buttonVariants = {
  primary: {
    button: { backgroundColor: colors.primary },
    text: { color: colors.primaryForeground },
  },
  secondary: {
    button: { backgroundColor: colors.accent },
    text: { color: colors.cardForeground },
  },
  danger: {
    button: { backgroundColor: colors.danger },
    text: { color: '#FFFFFF' },
  },
  ghost: {
    button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    text: { color: colors.cardForeground },
  },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCFEFF',
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.035,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  badgeDefault: {
    backgroundColor: colors.secondary,
  },
  badgeSuccess: {
    backgroundColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextDefault: {
    color: colors.primary,
  },
  badgeTextSuccess: {
    color: '#1A3E70',
  },
  progressTrack: {
    backgroundColor: colors.muted,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
