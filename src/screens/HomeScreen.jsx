import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';

export default function HomeScreen({ navigation }) {
  return (
    <RequireClinPro>
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.menuSlot} />
          <Text style={styles.headerTitle}>Olá, Maria</Text>
        </View>
        <Text style={styles.headerSubtitle}>Vamos organizar sua semana?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.navigate('FinancialDashboard')}>
          <AppCard style={styles.earningsCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Ganhos deste mês</Text>
              <Feather name="trending-up" size={18} color={colors.success} />
            </View>
            <Text style={styles.money}>R$ 3.450,00</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.successText}>+12% vs mês anterior</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </AppCard>
        </Pressable>

        <AppCard style={styles.nextServiceCard}>
          <View style={styles.nextServiceHeader}>
            <Text style={styles.sectionLabel}>Próximo Serviço</Text>
          </View>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconBox}>
              <Feather name="calendar" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceDate}>Quarta-feira, 19 Fev</Text>
              <Text style={styles.serviceTitle}>Maria Fernandes</Text>
              <View style={styles.addressRow}>
                <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                <Text style={styles.muted}>Rua das Acácias, 456</Text>
              </View>
            </View>
          </View>
          <View style={styles.serviceBottomRow}>
            <View style={styles.timeRow}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={styles.muted}>09:00 - 11:30</Text>
            </View>
            <Text style={styles.price}>R$ 130,00</Text>
          </View>
        </AppCard>

        <View style={styles.gridRow}>
          <AppCard style={styles.gridCard}>
            <Text style={styles.muted}>Serviços Hoje</Text>
            <Text style={styles.bigNumber}>3</Text>
          </AppCard>
          <AppCard style={styles.gridCard}>
            <Text style={styles.muted}>Esta Semana</Text>
            <Text style={styles.bigNumber}>12</Text>
          </AppCard>
        </View>

        <View>
          <Text style={styles.quickAccessTitle}>Acesso Rápido</Text>
          <View style={styles.quickAccessGrid}>
            <Pressable style={[styles.quickAccessCard, styles.quickAccessBlue]} onPress={() => navigation.navigate('TrainingTab')}>
              <View style={[styles.quickAccessIconWrap, styles.quickAccessBlueIcon]}>
                <MaterialCommunityIcons name="school-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.quickAccessCardTitle}>Treinamentos</Text>
              <Text style={styles.quickAccessCardSubtitle}>Continue aprendendo</Text>
            </Pressable>

            <Pressable style={[styles.quickAccessCard, styles.quickAccessGreen]} onPress={() => navigation.navigate('DigitalAccountOverview')}>
              <View style={[styles.quickAccessIconWrap, styles.quickAccessGreenIcon]}>
                <Feather name="dollar-sign" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.quickAccessCardTitle}>Conta Digital</Text>
              <Text style={styles.quickAccessCardSubtitle}>Gerencie seu saldo</Text>
            </Pressable>
          </View>
        </View>

        <AppButton
          title="Ver Serviços Disponíveis"
          onPress={() => navigation.navigate('ServicesTab')}
          left={<Feather name="chevron-right" size={16} color={colors.primaryForeground} />}
        />

        <AppButton
          title="Teste Backend"
          onPress={() => navigation.navigate('BackendConnectionTest')}
          variant="ghost"
          left={<Feather name="activity" size={16} color={colors.cardForeground} />}
        />
      </ScrollView>
      </View>
    </RequireClinPro>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 14, marginLeft: 46 },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { color: colors.mutedForeground, fontSize: 13 },
  money: { fontSize: 36, fontWeight: '800', color: colors.primary, marginTop: 6, marginBottom: 4 },
  successText: { color: colors.success, fontWeight: '600', marginTop: 4 },
  sectionLabel: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  earningsCard: { borderWidth: 1, borderColor: colors.border },
  nextServiceCard: { borderWidth: 1, borderColor: colors.border, padding: 0, overflow: 'hidden' },
  nextServiceHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#F3F8FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  serviceDate: { color: colors.mutedForeground, fontSize: 12, marginBottom: 4 },
  serviceRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 14 },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: { color: colors.cardForeground, fontWeight: '700', marginBottom: 6, fontSize: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  serviceBottomRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 20 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridCard: { flex: 1 },
  bigNumber: { fontSize: 32, fontWeight: '800', color: colors.primary, marginTop: 6 },
  quickAccessTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  quickAccessGrid: { flexDirection: 'row', gap: 12 },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 120,
  },
  quickAccessBlue: { backgroundColor: '#EEF5FF', borderColor: '#CFE3FF' },
  quickAccessGreen: { backgroundColor: '#ECFBF1', borderColor: '#CFEFD9' },
  quickAccessIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickAccessBlueIcon: { backgroundColor: '#3B82F6' },
  quickAccessGreenIcon: { backgroundColor: '#22C55E' },
  quickAccessCardTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  quickAccessCardSubtitle: { color: colors.mutedForeground, fontSize: 12 },
});
