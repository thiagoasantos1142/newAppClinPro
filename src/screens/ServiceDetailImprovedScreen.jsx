import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { acceptServiceById, getServiceById, updateServiceStatus } from '../services/modules/services.service';

function formatDurationFromDateRange(startAt, endAt) {
  if (!startAt || !endAt) return null;

  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMs = end.getTime() - start.getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) return null;

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${totalMinutes}min`;
}

export default function ServiceDetailImprovedScreen({ route, navigation }) {
  const { serviceId } = route.params || {};
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadService = async () => {
        if (!serviceId) {
          setError('Serviço não informado');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const data = await getServiceById(serviceId);
          if (!isActive) return;
          setService(data?.service || null);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar serviço');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadService();

      return () => {
        isActive = false;
      };
    }, [serviceId])
  );

  const view = useMemo(() => {
    if (!service) return null;
    return {
      priceLabel: service.price_label || 'R$ 0,00',
      paymentNote: service.payment?.payout_note || 'Pagamento conforme política da plataforma',
      serviceType: service.service_type || '-',
      clientName: service.client?.name || service.client_name || 'Cliente',
      clientPhone: service.client?.phone || 'Telefone não informado',
      address: service.address || '-',
      neighborhood: service.neighborhood || '-',
      city: service.city || '-',
      dateLabel: service.date_label || '-',
      timeLabel: service.time_label || '-',
      durationLabel:
        formatDurationFromDateRange(service.start_at, service.end_at) ||
        service.duration_label ||
        '-',
      description: service.description || 'Sem descrição informada.',
      observations: service.observations,
      distanceHeader: service.distance_label ? `${service.distance_label} de você` : 'Distância indisponível',
      status: service.status || 'available',
    };
  }, [service]);

  const handleAccept = useCallback(async () => {
    if (!serviceId || accepting) return;

    setAccepting(true);
    try {
      await acceptServiceById(serviceId, { accepted_from: 'detail' });
      Alert.alert('Sucesso', 'Serviço aceito com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível aceitar o serviço.');
    } finally {
      setAccepting(false);
    }
  }, [accepting, navigation, serviceId]);

  const handleDecline = useCallback(async () => {
    if (!serviceId || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const response = await updateServiceStatus(serviceId, { status: 'declined' });
      setService((prev) =>
        prev ? { ...prev, status: response?.status || 'declined' } : prev
      );
      Alert.alert('Sucesso', 'Serviço recusado.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível recusar o serviço.');
    } finally {
      setUpdatingStatus(false);
    }
  }, [navigation, serviceId, updatingStatus]);

  return (
    <View style={styles.container}>
      <AppScreenHeader
        onBack={() => navigation.goBack()}
        titleContent={
          <View>
            <Text style={styles.headerTitle}>Detalhes do Serviço</Text>
            <Text style={styles.headerSubtitle}>{view?.distanceHeader || 'Carregando...'}</Text>
          </View>
        }
      />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Carregando serviço...</Text>
        </View>
      ) : error || !view ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateText, styles.errorText]}>{error || 'Serviço não encontrado'}</Text>
          <AppButton
            title="Voltar"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.priceHero}>
            <View style={styles.heroLabelRow}>
              <Feather name="dollar-sign" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroLabel}>Valor do Serviço</Text>
            </View>
            <Text style={styles.heroPrice}>{view.priceLabel}</Text>
            <View style={styles.heroSubRow}>
              <Feather name="credit-card" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={styles.heroSub}>{view.paymentNote}</Text>
            </View>
          </View>

          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{view.serviceType}</Text>
            <Text style={styles.typeBadgeStatus}>{String(view.status).replace('_', ' ')}</Text>
          </View>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>Cliente</Text>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Feather name="user" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoStrong}>{view.clientName}</Text>
                <Text style={styles.infoMuted}>{view.clientPhone}</Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>Endereço</Text>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Feather name="map-pin" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoStrong}>{view.address}</Text>
                <Text style={styles.infoMuted}>{view.neighborhood}</Text>
                <Text style={styles.infoMuted}>{view.city}</Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>Quando</Text>
            <View style={styles.infoStack}>
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Feather name="calendar" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Data</Text>
                  <Text style={styles.infoStrong}>{view.dateLabel}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Feather name="clock" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Horário</Text>
                  <Text style={styles.infoStrong}>{view.timeLabel}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <Feather name="watch" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Duração Estimada</Text>
                  <Text style={styles.infoStrong}>{view.durationLabel}</Text>
                </View>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <View style={styles.descriptionTitleRow}>
              <Feather name="file-text" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>Descrição do Serviço</Text>
            </View>
            <Text style={styles.description}>{view.description}</Text>
          </AppCard>

          {!!view.observations && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Observações Importantes</Text>
              <Text style={styles.warningText}>{view.observations}</Text>
            </View>
          )}

          <AppButton
            title={accepting ? 'Aceitando...' : 'Aceitar Serviço'}
            disabled={accepting}
            onPress={handleAccept}
            left={<Feather name="check-circle" size={16} color="#FFFFFF" />}
          />
          <AppButton
            title="Recusar"
            variant="ghost"
            disabled={updatingStatus}
            textStyle={{ color: '#DC2626' }}
            style={{ borderColor: '#FECACA', backgroundColor: '#FFFFFF' }}
            onPress={handleDecline}
            left={<Feather name="x-circle" size={16} color="#DC2626" />}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  stateText: { marginTop: 10, color: colors.mutedForeground, fontSize: 14, textAlign: 'center' },
  errorText: { color: colors.danger, marginTop: 0 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  priceHero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  heroPrice: { color: '#FFF', fontSize: 44, fontWeight: '900' },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  typeBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(31,128,234,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(31,128,234,0.2)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadgeText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  typeBadgeStatus: {
    color: colors.mutedForeground,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  card: { borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoStack: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoContent: { flex: 1, minWidth: 0 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { color: colors.mutedForeground, fontSize: 11 },
  infoStrong: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  infoMuted: { color: colors.mutedForeground, fontSize: 13, marginTop: 2 },
  descriptionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
  warningBox: {
    borderWidth: 1,
    borderColor: '#FDE047',
    backgroundColor: '#FEF9C3',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  warningTitle: { color: '#854D0E', fontWeight: '700', fontSize: 14 },
  warningText: { color: '#854D0E', fontSize: 13, lineHeight: 18 },
});
