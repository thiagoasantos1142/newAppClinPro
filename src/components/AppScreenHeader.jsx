import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import HeaderActionButton from './HeaderActionButton.jsx';

export default function AppScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  leftContent = null,
  rightContent = null,
  titleContent = null,
  extraContent = null,
  titleStyle,
  subtitleStyle,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {leftContent ? (
          <View style={styles.leftContent}>{leftContent}</View>
        ) : showBack ? (
          <HeaderActionButton onPress={onBack} icon="chevron-left" size={22} style={styles.backButton} />
        ) : (
          <View style={styles.menuSlot} />
        )}
        {titleContent || <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>}
        {!!rightContent && <View style={styles.rightContent}>{rightContent}</View>}
      </View>
      {!!subtitle && <Text style={[styles.headerSubtitle, subtitleStyle]}>{subtitle}</Text>}
      {extraContent}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: { marginRight: 8 },
  backButton: { marginRight: 8 },
  menuSlot: {
    width: 46,
  },
  rightContent: {
    marginLeft: 'auto',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
    fontSize: 13,
    marginLeft: 46,
  },
});
