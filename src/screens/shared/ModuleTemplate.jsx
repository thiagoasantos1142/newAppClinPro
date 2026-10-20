import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard, Badge, ProgressBar } from '../../components/ui.jsx';
import { colors, textStyles } from '../../theme/tokens';
import AppHeader from '../../components/AppHeader.jsx';
import AsaasBaasSeal from '../../components/AsaasBaasSeal.jsx';

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
  children,
  showAsaasSeal = false,
}) {
  return (
    <View style={styles.container}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        navigation={navigation}
        showBack={showBack}
      />
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

        {children}

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

        {showAsaasSeal ? <AsaasBaasSeal /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  heroTitle: { color: colors.mutedForeground, fontSize: 12 },
  heroValue: { color: colors.primary, fontSize: 32, fontWeight: '800', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 },
  sectionTitle: { ...textStyles.cardTitle, color: colors.cardForeground, flexShrink: 1 },
  itemRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8, gap: 6 },
  itemLabel: { ...textStyles.secondary, color: colors.mutedForeground, flexGrow: 1, flexShrink: 1, minWidth: 100 },
  itemValue: { ...textStyles.secondary, color: colors.cardForeground, fontFamily: 'Inter_600SemiBold', fontWeight: '600', flexGrow: 1, flexShrink: 1, minWidth: 100, textAlign: 'right' },
  body: { ...textStyles.secondary, color: colors.mutedForeground },
  muted: { ...textStyles.caption, color: colors.mutedForeground, marginTop: 8 },
});

