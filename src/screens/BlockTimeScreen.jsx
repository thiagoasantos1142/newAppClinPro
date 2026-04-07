import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { createScheduleBlock, deleteScheduleBlock, getScheduleBlocks } from '../services/modules/schedule.service';

moment.locale('pt-br');

function defaultDateTime(offsetHours) {
  return moment().add(offsetHours, 'hours').seconds(0).milliseconds(0).toISOString();
}

export default function BlockTimeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [startAt, setStartAt] = useState(defaultDateTime(2));
  const [endAt, setEndAt] = useState(defaultDateTime(4));
  const [reason, setReason] = useState('Compromisso pessoal');

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getScheduleBlocks();
      setItems(Array.isArray(response?.items) ? response.items : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar bloqueios');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBlocks();
    }, [loadBlocks])
  );

  const sectionsItems = useMemo(() => {
    if (loading) return [{ label: 'Carregando...', value: '...' }];
    if (error) return [{ label: 'Erro ao carregar bloqueios', value: '' }];
    if (items.length === 0) return [{ label: 'Nenhum bloqueio ativo', value: '' }];
    return items.map((item) => ({ label: item.label || '-', value: item.reason || '' }));
  }, [error, items, loading]);

  const handleSave = async () => {
    if (!startAt || !endAt) {
      Alert.alert('Atenção', 'Preencha início e fim.');
      return;
    }
    setSaving(true);
    try {
      await createScheduleBlock({ start_at: startAt, end_at: endAt, reason: reason || undefined });
      Alert.alert('Sucesso', 'Bloqueio salvo.');
      await loadBlocks();
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível salvar o bloqueio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteScheduleBlock(id);
      setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível remover o bloqueio.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Bloquear Horário"
        subtitle="Defina períodos indisponíveis"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={styles.cardTitle}>Novo bloqueio</Text>
          <Text style={styles.label}>Início (ISO)</Text>
          <TextInput value={startAt} onChangeText={setStartAt} style={styles.input} autoCapitalize="none" />
          <Text style={[styles.label, { marginTop: 10 }]}>Fim (ISO)</Text>
          <TextInput value={endAt} onChangeText={setEndAt} style={styles.input} autoCapitalize="none" />
          <Text style={[styles.label, { marginTop: 10 }]}>Motivo</Text>
          <TextInput value={reason} onChangeText={setReason} style={styles.input} />
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Bloqueios ativos</Text>
          <View style={{ gap: 8 }}>
            {sectionsItems.map((item, idx) => {
              const source = items[idx];
              return (
                <View key={source?.id || `${item.label}-${idx}`} style={styles.blockRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.blockLabel}>{item.label}</Text>
                    {!!item.value && <Text style={styles.blockReason}>{item.value}</Text>}
                  </View>
                  {source?.id ? (
                    <Pressable onPress={() => handleDelete(source.id)} style={styles.deleteBtn} disabled={deletingId === source.id}>
                      <Feather name="trash-2" size={16} color="#DC2626" />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </AppCard>

        <AppButton title={saving ? 'Salvando...' : 'Salvar Bloqueio'} onPress={handleSave} disabled={saving} left={<Feather name="check" size={16} color="#FFF" />} />
        <AppButton title="Voltar para Agenda Semanal" variant="secondary" onPress={() => navigation.navigate('WeeklySchedule')} left={<Feather name="calendar" size={16} color={colors.cardForeground} />} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 38, height: 38, borderRadius: 12, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13, marginLeft: 46 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  cardTitle: { color: colors.cardForeground, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  label: { color: colors.mutedForeground, fontSize: 12, marginBottom: 6 },
  input: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 12, color: colors.cardForeground },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, backgroundColor: '#FFF' },
  blockLabel: { color: colors.cardForeground, fontSize: 13, fontWeight: '700' },
  blockReason: { color: colors.mutedForeground, fontSize: 12, marginTop: 2 },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },
});
