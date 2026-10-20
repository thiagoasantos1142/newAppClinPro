import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { colors, textStyles, typography } from '../theme/tokens';

export default function AppHeader({
  title,
  subtitle,
  icon = 'grid',
  navigation,
  showBack = false,
  actionIcon,
  actionLabel,
  onAction,
}) {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const compact = width <= 360 || fontScale >= 1.3;
  const canGoBack = showBack && navigation?.canGoBack?.();
  const canOpenDrawer = !showBack && !!navigation;
  const onLeftPress = canGoBack
    ? () => navigation.goBack()
    : canOpenDrawer
      ? () => navigation.dispatch(DrawerActions.openDrawer())
      : undefined;

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, compact && styles.headerCompact, { paddingTop: Math.max(insets.top, 12) + (compact ? 14 : 20) }]}>
        <View style={styles.decorationLarge} />
        <View style={styles.decorationSmall} />

        <Pressable
          accessibilityRole={onLeftPress ? 'button' : undefined}
          accessibilityLabel={canGoBack ? 'Voltar' : canOpenDrawer ? 'Abrir menu' : undefined}
          disabled={!onLeftPress}
          onPress={onLeftPress}
          style={[styles.iconBox, compact && styles.iconBoxCompact]}
        >
          <Feather name={canGoBack ? 'chevron-left' : canOpenDrawer ? 'menu' : icon} size={compact ? 25 : 30} color="#FFFFFF" />
        </Pressable>

        <View style={styles.textBlock}>
          <Text numberOfLines={2} style={styles.title}>{title}</Text>
          {!!subtitle && <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {!!onAction && (
          <Pressable accessibilityRole="button" onPress={onAction} style={[styles.actionButton, compact && styles.actionButtonCompact]}>
            {!!actionIcon && <Feather name={actionIcon} size={21} color="#FFFFFF" />}
            {!!actionLabel && !compact && <Text style={styles.actionLabel}>{actionLabel}</Text>}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    backgroundColor: colors.background,
  },
  header: {
    width: '100%',
    minHeight: 112,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 16,
  },
  headerCompact: { minHeight: 100, paddingHorizontal: 12, paddingBottom: 14, gap: 10 },
  decorationLarge: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    right: -65,
    bottom: -155,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorationSmall: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: 12,
    top: -115,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  iconBoxCompact: { width: 48, height: 48, borderRadius: 14 },
  textBlock: { flex: 1, minWidth: 0 },
  title: { ...textStyles.sectionTitle, color: '#FFFFFF', flexShrink: 1 },
  subtitle: { ...textStyles.caption, color: 'rgba(255,255,255,0.82)', marginTop: 4, flexShrink: 1 },
  actionButton: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  actionButtonCompact: { width: 44, minHeight: 44, paddingHorizontal: 0 },
  actionLabel: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
});
