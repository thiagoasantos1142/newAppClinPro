import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useGlobalLoading } from '../hooks/useGlobalLoading';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function GlobalLoadingModal() {
  const { visible, message } = useGlobalLoading();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.title}>Aguarde um instante</Text>
          <Text style={styles.message}>{message || 'Carregando...'}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 45, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(26,62,112,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(31,128,234,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.xs,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
