import React, { useMemo, useState } from 'react';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { services } from '../data/mockData';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';

const distanceByService = {
  '1': '2.3 km',
  '2': '4.1 km',
  '3': '3.5 km',
};

export default function AvailableServicesImprovedScreen({ navigation }) {
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(
    () =>
      services.map((service) => ({
        ...service,
        distance: distanceByService[service.id] || '3.0 km',
      })),
    []
  );

  return (
    <RequireClinPro>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <View style={styles.menuSlot} />
              <Text style={styles.headerTitle}>Serviços Disponíveis</Text>
            </View>
            <Pressable onPress={() => setShowFilters(true)} style={styles.filterButton}>
              <Feather name="filter" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.headerSubtitle}>{list.length} serviços próximos a você</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {list.map((service) => (
            <AppCard key={service.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.fieldLabel}>Data e Horário</Text>
                  <Text style={styles.fieldValue}>{service.date}</Text>
                </View>
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>{service.type}</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <Feather name="clock" size={14} color={colors.mutedForeground} />
                <Text style={styles.fieldMuted}>{service.time}</Text>
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={styles.clientTitle}>{service.clientName}</Text>
                <View style={styles.addressRow}>
                  <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressNeighborhood}>{service.neighborhood}</Text>
                    <Text style={styles.fieldMuted}>{service.address}</Text>
                  </View>
                </View>
                <Text style={styles.distanceText}>{service.distance} de você</Text>
              </View>

              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.fieldLabel}>Valor do Serviço</Text>
                  <Text style={styles.price}>{service.price}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <AppButton
                  title="Ver Detalhes"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('ServiceDetailImproved', { serviceId: service.id })}
                />
                <AppButton title="Aceitar" style={{ flex: 1 }} onPress={() => {}} />
              </View>
            </AppCard>
          ))}
        </ScrollView>

        {showFilters && (
          <View style={styles.modalOverlay}>
            <Pressable style={styles.backdrop} onPress={() => setShowFilters(false)} />
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Filtros</Text>
                <Pressable onPress={() => setShowFilters(false)} style={styles.closeButton}>
                  <Feather name="x" size={18} color={colors.primary} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.sheetContent}>
                <View style={styles.filterBlock}>
                  <Text style={styles.filterLabel}>Distância Máxima</Text>
                  <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>Até 5 km</Text>
                  </View>
                </View>

                <View style={styles.filterBlock}>
                  <Text style={styles.filterLabel}>Tipo de Serviço</Text>
                  <View style={styles.checkItem}>
                    <Feather name="check-square" size={16} color={colors.primary} />
                    <Text style={styles.checkText}>Todos</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Feather name="square" size={16} color={colors.mutedForeground} />
                    <Text style={styles.checkText}>Limpeza Residencial</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Feather name="square" size={16} color={colors.mutedForeground} />
                    <Text style={styles.checkText}>Limpeza Profunda</Text>
                  </View>
                </View>

                <View style={styles.filterBlock}>
                  <Text style={styles.filterLabel}>Valor Mínimo</Text>
                  <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>Qualquer valor</Text>
                  </View>
                </View>

                <View style={styles.filterBlock}>
                  <Text style={styles.filterLabel}>Data</Text>
                  <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>Todas as datas</Text>
                  </View>
                </View>

                <AppButton title="Aplicar Filtros" onPress={() => setShowFilters(false)} />
                <AppButton title="Limpar Filtros" variant="secondary" onPress={() => {}} />
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </RequireClinPro>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  headerTitle: { color: '#FFF', fontSize: 25, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13, marginLeft: 46 },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  card: { borderWidth: 1, borderColor: colors.border },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { color: colors.mutedForeground, fontSize: 12 },
  fieldValue: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginTop: 2 },
  fieldMuted: { color: colors.mutedForeground, fontSize: 13 },
  typePill: { backgroundColor: 'rgba(31,128,234,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  typePillText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 10 },
  clientTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  addressNeighborhood: { color: colors.cardForeground, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  distanceText: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 6, marginLeft: 22 },
  footerRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginBottom: 12 },
  price: { color: colors.primary, fontSize: 28, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: {
    maxHeight: '72%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 16,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { color: colors.cardForeground, fontSize: 20, fontWeight: '700' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: { padding: 16, gap: 12, paddingBottom: 20 },
  filterBlock: { gap: 8 },
  filterLabel: { color: colors.cardForeground, fontSize: 14, fontWeight: '700' },
  fakeInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fakeInputText: { color: colors.cardForeground, fontSize: 14 },
  checkItem: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: { color: colors.cardForeground, fontSize: 13, fontWeight: '500' },
});
