import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppCard } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function PixAreaScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Area Pix"
        subtitle="Gerencie suas chaves e recebimentos"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Feather name="zap" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Tudo sobre seu Pix</Text>
          <Text style={styles.heroSubtitle}>Acesse suas chaves, acompanhe recebimentos e compartilhe seus dados.</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.actionCardWrap, pressed && styles.actionCardPressed]} onPress={() => navigation.navigate('TransferMoney')}>
          <AppCard style={styles.actionCard}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="bank-transfer-out" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Transferir usando Pix</Text>
              <Text style={styles.actionSubtitle}>Envie valores rapidamente usando uma chave Pix.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </AppCard>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.actionCardWrap, pressed && styles.actionCardPressed]} onPress={() => navigation.navigate('PixKeys')}>
          <AppCard style={styles.actionCard}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="key-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Minhas chaves Pix</Text>
              <Text style={styles.actionSubtitle}>Veja, compartilhe e gerencie as chaves vinculadas a sua conta.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </AppCard>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#0F9D7A',
    borderRadius: 28,
    padding: 22,
    marginBottom: spacing.lg,
    shadowColor: '#0B5D49',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 20,
  },
  actionCardWrap: {
    borderRadius: radius.lg,
    marginBottom: 14,
  },
  actionCardPressed: {
    opacity: 0.92,
  },
  actionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
  },
  actionSubtitle: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
});
