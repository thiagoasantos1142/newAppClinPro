import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { services } from '../data/mockData';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';

export default function AvailableServicesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.menuSlot} />
          <Text style={styles.headerTitle}>Serviços Disponíveis</Text>
        </View>
        <Text style={styles.headerSubtitle}>{services.length} serviços disponíveis</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {services.map((service) => (
          <AppCard key={service.id}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.muted}>Data</Text>
                <Text style={styles.bold}>{service.date}</Text>
              </View>
              <View style={styles.timePill}>
                <Feather name="clock" size={14} color={colors.primary} />
                <Text style={styles.timeText}>{service.time}</Text>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.muted}>Cliente</Text>
              <Text style={styles.serviceTitle}>{service.clientName}</Text>
              <Text style={styles.muted}>{service.neighborhood}</Text>
              <Text style={styles.muted}>{service.address}</Text>
            </View>

            <View style={[styles.rowBetween, styles.separator]}>
              <View>
                <Text style={styles.muted}>Tipo de Serviço</Text>
                <Text style={styles.bold}>{service.type}</Text>
              </View>
              <View>
                <Text style={[styles.muted, { textAlign: 'right' }]}>Valor</Text>
                <Text style={styles.price}>{service.price}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                title="Ver Detalhes"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ServiceDetail', { serviceId: service.id })}
              />
              <AppButton title="Aceitar" style={{ flex: 1 }} onPress={() => {}} />
            </View>
          </AppCard>
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
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13, marginLeft: 46 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: colors.mutedForeground, fontSize: 12 },
  bold: { color: colors.cardForeground, fontWeight: '700', marginTop: 2, fontSize: 14 },
  timePill: { backgroundColor: colors.secondary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', gap: 6, alignItems: 'center' },
  timeText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  serviceTitle: { color: colors.cardForeground, fontWeight: '700', fontSize: 16, marginVertical: 3 },
  separator: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 22, textAlign: 'right' },
  actions: { marginTop: 12, flexDirection: 'row', gap: 10 },
});

