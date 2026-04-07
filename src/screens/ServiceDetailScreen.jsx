import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { services } from '../data/mockData';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';

export default function ServiceDetailScreen({ route, navigation }) {
  const { serviceId } = route.params || {};
  const service = services.find((s) => s.id === String(serviceId)) || services[0];

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Detalhes do Serviço" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.priceHero}>
          <Text style={styles.heroLabel}>Valor do Serviço</Text>
          <Text style={styles.heroPrice}>{service.price}</Text>
          <Text style={styles.heroSub}>Pagamento após conclusão</Text>
        </View>

        <AppCard>
          <Text style={styles.cardTitle}>Informações do Cliente</Text>
          <Text style={styles.value}>{service.clientName}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Endereço</Text>
          <Text style={styles.value}>{service.address}</Text>
          <Text style={styles.muted}>{service.neighborhood}</Text>
          <Text style={styles.muted}>{service.city}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Data e Horário</Text>
          <Text style={styles.value}>{service.date}</Text>
          <Text style={styles.value}>{service.time}</Text>
          <Text style={styles.muted}>Duração: {service.duration}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Descrição do Serviço</Text>
          <Text style={styles.muted}>Tipo</Text>
          <Text style={[styles.value, { marginTop: 2 }]}>{service.type}</Text>
          <Text style={[styles.body, { marginTop: 10 }]}>{service.description}</Text>
        </AppCard>

        {!!service.observations && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Observações</Text>
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
          variant="danger"
          onPress={() => navigation.goBack()}
          left={<Feather name="x-circle" size={16} color="#FFFFFF" />}
        />
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
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  priceHero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroPrice: { color: '#FFF', fontSize: 44, fontWeight: '900', marginVertical: 5 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  cardTitle: { color: colors.cardForeground, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  value: { color: colors.cardForeground, fontSize: 15, fontWeight: '600' },
  muted: { color: colors.mutedForeground, fontSize: 13, marginTop: 3 },
  body: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
  warningBox: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    borderRadius: 16,
    padding: 14,
  },
  warningTitle: { color: '#854D0E', fontWeight: '700', marginBottom: 4 },
  warningText: { color: '#854D0E', fontSize: 13 },
});

