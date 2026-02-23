import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard, Badge } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { getProfile } from '../services/modules/profile.service';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        let msg = 'Erro ao carregar perfil';
        if (err?.response?.data?.error === 'Usuário não é um profissional ClinPro') {
          msg = 'Acesso restrito: apenas profissionais ClinPro podem acessar esta área.';
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    );
  }
  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Feather name="user" size={42} color="#FFF" /></View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{profile.bio || ''}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <Text style={styles.statValue}>{profile.average_rating?.toFixed(1) ?? '--'}</Text>
            <Text style={styles.muted}>Avaliação</Text>
          </AppCard>
          <AppCard style={styles.statCard}>
            <Text style={styles.statValue}>{profile.completed_services ?? '--'}</Text>
            <Text style={styles.muted}>Serviços concluídos</Text>
          </AppCard>
        </View>

        <AppCard>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          <Text style={styles.value}>{profile.region}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Certificações / Badges</Text>
          <View style={{ gap: 8 }}>
            {profile.badges?.length ? profile.badges.map((badge) => (
              <View key={badge.code} style={styles.certItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.value}>{badge.name}</Text>
                  {badge.awarded_at && <Text style={styles.muted}>Emitido em {badge.awarded_at.slice(0, 4)}</Text>}
                </View>
                <Badge text="Verificado" tone="success" />
              </View>
            )) : <Text style={styles.muted}>Nenhuma certificação</Text>}
          </View>
        </AppCard>

        <AppButton title="Editar Perfil" left={<Feather name="edit-3" size={16} color="#FFF" />} onPress={() => {}} />
        <AppButton title="Conta Digital" variant="secondary" left={<Feather name="credit-card" size={16} color={colors.cardForeground} />} onPress={() => navigation.navigate('DigitalAccountOverview')} />
        <AppButton title="Reputação" variant="secondary" left={<Feather name="award" size={16} color={colors.cardForeground} />} onPress={() => navigation.navigate('ReputationOverview')} />
        <AppButton title="Financeiro" variant="secondary" left={<Feather name="bar-chart-2" size={16} color={colors.cardForeground} />} onPress={() => navigation.navigate('FinancialDashboard')} />
        <AppButton title="Sair da Conta" variant="ghost" textStyle={{ color: colors.danger }} style={{ borderColor: '#FCA5A5' }} left={<Feather name="log-out" size={16} color={colors.danger} />} onPress={() => {}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  avatar: { width: 92, height: 92, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#FFF', fontSize: 26, fontWeight: '700', marginTop: 10 },
  role: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.primary, fontSize: 30, fontWeight: '800' },
  muted: { color: colors.mutedForeground, fontSize: 12 },
  sectionTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  value: { color: colors.cardForeground, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  certItem: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
});
