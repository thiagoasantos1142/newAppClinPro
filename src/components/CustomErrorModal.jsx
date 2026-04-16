import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton } from './ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function CustomErrorModal({
  visible,
  title = 'Erro',
  message,
  buttonLabel = 'Entendi',
  tone = 'danger',
  buttonDisabled = false,
  secondaryButtonLabel,
  onSecondaryPress,
  onButtonPress,
  onClose,
}) {
  const toneStyle = toneStyles[tone] || toneStyles.danger;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: toneStyle.iconBackgroundColor }]}>
              <Feather name={toneStyle.iconName} size={18} color="#FFFFFF" />
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[styles.actionsRow, secondaryButtonLabel && styles.actionsRowSplit]}>
            {secondaryButtonLabel ? (
              <AppButton title={secondaryButtonLabel} variant="ghost" onPress={onSecondaryPress || onClose} style={styles.secondaryButton} />
            ) : null}
            <AppButton
              title={buttonLabel}
              onPress={onButtonPress || onClose}
              disabled={buttonDisabled}
              style={[styles.button, secondaryButtonLabel && styles.primaryButton]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const toneStyles = {
  danger: {
    iconName: 'alert-triangle',
    iconBackgroundColor: colors.danger,
  },
  warning: {
    iconName: 'info',
    iconBackgroundColor: colors.warning,
  },
  info: {
    iconName: 'clock',
    iconBackgroundColor: colors.primary,
  },
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 45, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 26,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.md,
    color: colors.cardForeground,
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
  },
  message: {
    marginTop: spacing.sm,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.lg,
  },
  actionsRow: {
    marginTop: spacing.lg,
  },
  actionsRowSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    marginTop: 0,
  },
  primaryButton: {
    flex: 1,
    marginTop: 0,
  },
});
