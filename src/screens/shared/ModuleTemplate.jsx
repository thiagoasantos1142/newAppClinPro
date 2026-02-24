import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard, Badge, ProgressBar } from '../../components/ui.jsx';
import { colors } from '../../theme/tokens';

export default function ModuleTemplate({
  title,
  subtitle,
  sections = [],
  actions = [],
  hero,
  showBack = true,
  backRoute,
  backParams,
  navigation,
}) {
  const canGoBack = !!navigation?.canGoBack?.();
  const canNavigateBackRoute = !!(backRoute && navigation?.navigate);
  const shouldShowBack = showBack && (canGoBack || canNavigateBackRoute);

  const onBack = () => {
    if (canGoBack) {
      navigation.goBack();
      return;
    }
    if (canNavigateBackRoute) {
      navigation.navigate(backRoute, backParams || {});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          {shouldShowBack ? (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Feather name="chevron-left" size={22} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.menuSlot} />
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {hero ? (
          <AppCard>
            <Text style={styles.heroTitle}>{hero.title}</Text>
            {!!hero.value && <Text style={styles.heroValue}>{hero.value}</Text>}
            {!!hero.progress && <ProgressBar value={hero.progress} style={{ marginTop: 10 }} />}
            {!!hero.note && <Text style={styles.muted}>{hero.note}</Text>}
          </AppCard>
        ) : null}

        {sections.map((section) => (
          <AppCard key={section.title}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.badge ? <Badge text={section.badge} tone="success" /> : null}
            </View>
            {(section.items || []).map((item) => (
              <View key={`${section.title}-${item.label}`} style={styles.itemRow}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
            ))}
            {!!section.body && <Text style={styles.body}>{section.body}</Text>}
          </AppCard>
        ))}

        {actions.map((action) => (
          <AppButton
            key={action.label}
            title={action.label}
            variant={action.variant || 'primary'}
            disabled={action.disabled}
            onPress={() => {
              if (action.route && navigation) {
                navigation.navigate(action.route, action.params || {});
              } else if (action.onPress) {
                action.onPress();
              }
            }}
            left={<Feather name={action.icon || 'arrow-right'} size={16} color={action.variant === 'secondary' ? colors.cardForeground : '#FFFFFF'} />}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  backButton: { width: 38, height: 38, borderRadius: 12, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13, marginLeft: 46 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  heroTitle: { color: colors.mutedForeground, fontSize: 12 },
  heroValue: { color: colors.primary, fontSize: 32, fontWeight: '800', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 10 },
  itemLabel: { color: colors.mutedForeground, fontSize: 13, flex: 1 },
  itemValue: { color: colors.cardForeground, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  body: { color: colors.mutedForeground, fontSize: 13, lineHeight: 20 },
  muted: { color: colors.mutedForeground, fontSize: 12, marginTop: 8 },
});

