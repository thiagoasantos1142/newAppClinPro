import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { services } from '../data/mockData';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';

export default function ServiceDetailImprovedScreen({ route, navigation }) {
  const { serviceId } = route.params || {};
  const service = services.find((item) => item.id === String(serviceId)) || services[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Detalhes do Serviço</Text>
            <Text style={styles.headerSubtitle}>2.3 km de você</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.priceHero}>
          <View style={styles.heroLabelRow}>
            <Feather name="dollar-sign" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroLabel}>Valor do Serviço</Text>
          </View>
          <Text style={styles.heroPrice}>{service.price}</Text>
          <View style={styles.heroSubRow}>
            <Feather name="credit-card" size={13} color="rgba(255,255,255,0.75)" />
            <Text style={styles.heroSub}>Dinheiro após conclusão</Text>
          </View>
        </View>

        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{service.type}</Text>
        </View>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.infoStrong}>{service.clientName}</Text>
              <Text style={styles.infoMuted}>(11) 98765-4321</Text>
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
              <Text style={styles.infoStrong}>{service.address}</Text>
              <Text style={styles.infoMuted}>{service.neighborhood}</Text>
              <Text style={styles.infoMuted}>{service.city}</Text>
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
                <Text style={styles.infoStrong}>{service.date}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Feather name="clock" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Horário</Text>
                <Text style={styles.infoStrong}>{service.time}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Feather name="watch" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Duração Estimada</Text>
                <Text style={styles.infoStrong}>{service.duration}</Text>
              </View>
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <View style={styles.descriptionTitleRow}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={styles.cardTitle}>Descrição do Serviço</Text>
          </View>
          <Text style={styles.description}>{service.description}</Text>
        </AppCard>

        {!!service.observations && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Observações Importantes</Text>
            <Text style={styles.warningText}>{service.observations}</Text>
          </View>
        )}

        <AppButton
          title="Aceitar Serviço"
          onPress={() => navigation.goBack()}
          left={<Feather name="check-circle" size={16} color="#FFFFFF" />}
        />
        <AppButton
          title="Recusar"
          variant="ghost"
          textStyle={{ color: '#DC2626' }}
          style={{ borderColor: '#FECACA', backgroundColor: '#FFFFFF' }}
          onPress={() => navigation.goBack()}
          left={<Feather name="x-circle" size={16} color="#DC2626" />}
        />
      </ScrollView>
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
  },
  typeBadgeText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  card: { borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoStack: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { color: colors.mutedForeground, fontSize: 11 },
  infoStrong: { color: colors.cardForeground, fontSize: 14, fontWeight: '700' },
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
