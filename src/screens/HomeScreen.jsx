import React, { useCallback, useState } from 'react';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import HeaderActionButton from '../components/HeaderActionButton.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { getHomeDashboard } from '../services/modules/home.service';

export default function HomeScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getHomeDashboard();
          if (isActive) setDashboard(data);
        } catch (err) {
          if (!isActive) return;
          const message = err?.response?.data?.message || err?.message || 'Erro ao carregar dashboard';
          setError(message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadDashboard();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const greetingName = dashboard?.greeting_name || 'Maria';
  const earningsLabel = dashboard?.earnings?.month_amount_label || 'R$ 0,00';
  const variationLabel = dashboard?.earnings?.variation_label || '0% vs mes anterior';
  const variationPercent = Number(dashboard?.earnings?.variation_percent || 0);
  const statsToday = dashboard?.stats?.services_today ?? 0;
  const statsWeek = dashboard?.stats?.services_week ?? 0;
  const nextService = dashboard?.next_service;
  const trainingEnabled = dashboard?.quick_access?.training_enabled ?? true;
  const digitalAccountEnabled = dashboard?.quick_access?.digital_account_enabled ?? true;
  const variationPositive = variationPercent >= 0;

  return (
    <RequireClinPro>
      <View style={styles.container}>
        <AppScreenHeader
          title={`Olá, ${greetingName}`}
          subtitle="Vamos organizar sua semana?"
          showBack={false}
          leftContent={<HeaderActionButton onPress={() => navigation.dispatch(DrawerActions.openDrawer())} icon="menu" />}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <AppCard style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.muted}>Carregando dashboard...</Text>
            </AppCard>
          ) : null}

          {!loading && error ? (
            <AppCard style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </AppCard>
          ) : null}

          <Pressable onPress={() => navigation.navigate('FinancialDashboard')}>
            <AppCard style={styles.earningsCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.muted}>Ganhos deste mês</Text>
                <Feather
                  name={variationPositive ? 'trending-up' : 'trending-down'}
                  size={18}
                  color={variationPositive ? colors.success : colors.danger}
                />
              </View>
              <Text style={styles.money}>{earningsLabel}</Text>
              <View style={styles.rowBetween}>
                <Text style={[styles.successText, !variationPositive && styles.dangerText]}>{variationLabel}</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </View>
            </AppCard>
          </Pressable>

          <AppCard style={styles.nextServiceCard}>
            <View style={styles.nextServiceHeader}>
              <Text style={styles.sectionLabel}>Próximo Serviço</Text>
            </View>
            {nextService ? (
              <>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceIconBox}>
                    <Feather name="calendar" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceDate}>{nextService.date_label || '-'}</Text>
                    <Text style={styles.serviceTitle}>{nextService.client_name || 'Cliente'}</Text>
                    <View style={styles.addressRow}>
                      <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                      <Text style={styles.muted}>{nextService.address || '-'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.serviceBottomRow}>
                  <View style={styles.timeRow}>
                    <Feather name="clock" size={14} color={colors.mutedForeground} />
                    <Text style={styles.muted}>{nextService.time_label || '-'}</Text>
                  </View>
                  <View style={styles.servicePriceWrap}>
                    <Text style={styles.price}>{nextService.price_label || 'R$ 0,00'}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyServiceState}>
                <Feather name="calendar" size={18} color={colors.mutedForeground} />
                <Text style={styles.muted}>Nenhum próximo serviço agendado.</Text>
              </View>
            )}
          </AppCard>

          <View style={styles.gridRow}>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('DailySchedule')}>
              <AppCard style={styles.gridCard}>
                <Text style={styles.muted}>Serviços Hoje</Text>
                <Text style={styles.bigNumber}>{statsToday}</Text>
              </AppCard>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('WeeklySchedule')}>
              <AppCard style={styles.gridCard}>
                <Text style={styles.muted}>Esta Semana</Text>
                <Text style={styles.bigNumber}>{statsWeek}</Text>
              </AppCard>
            </Pressable>
          </View>

          <View>
            <Text style={styles.quickAccessTitle}>Acesso Rápido</Text>
            <View style={styles.quickAccessGrid}>
              <Pressable
                style={[styles.quickAccessCard, styles.quickAccessBlue, !trainingEnabled && styles.quickAccessDisabled]}
                onPress={() => navigation.navigate('TrainingTab')}
                disabled={!trainingEnabled}
              >
                <View style={[styles.quickAccessIconWrap, styles.quickAccessBlueIcon]}>
                  <MaterialCommunityIcons name="school-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.quickAccessCardTitle}>Treinamentos</Text>
                <Text style={styles.quickAccessCardSubtitle}>
                  {trainingEnabled ? 'Continue aprendendo' : 'Indisponível no momento'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.quickAccessCard, styles.quickAccessGreen, !digitalAccountEnabled && styles.quickAccessDisabled]}
                onPress={() => navigation.navigate('DigitalAccountOverview')}
                disabled={!digitalAccountEnabled}
              >
                <View style={[styles.quickAccessIconWrap, styles.quickAccessGreenIcon]}>
                  <Feather name="dollar-sign" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.quickAccessCardTitle}>Conta Digital</Text>
                <Text style={styles.quickAccessCardSubtitle}>
                  {digitalAccountEnabled ? 'Gerencie seu saldo' : 'Indisponível no momento'}
                </Text>
              </Pressable>
            </View>
          </View>

          <AppButton
            title="Ver Serviços Disponíveis"
            onPress={() => navigation.navigate('ServicesTab')}
            left={<Feather name="chevron-right" size={16} color={colors.primaryForeground} />}
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
  loadingCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  errorCard: { borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF7F7' },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { color: colors.mutedForeground, fontSize: 13 },
  money: { fontSize: 36, fontWeight: '800', color: colors.primary, marginTop: 6, marginBottom: 4 },
  successText: { color: colors.success, fontWeight: '600', marginTop: 4 },
  dangerText: { color: colors.danger },
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
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
  servicePriceWrap: { alignItems: 'flex-end', minWidth: 88 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 20 },
  emptyServiceState: { paddingHorizontal: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  quickAccessDisabled: { opacity: 0.5 },
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
