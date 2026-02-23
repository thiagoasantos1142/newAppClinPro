import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { profile } from '../data/mockData';
import { colors } from '../theme/tokens';

const metrics = [
  { label: 'Serviços realizados', value: '342', icon: 'briefcase', bg: '#EFF6FF', color: '#2563EB' },
  { label: 'Avaliação média', value: '4.9', icon: 'star', bg: '#FEF9C3', color: '#CA8A04' },
  { label: 'Clientes recorrentes', value: '89', icon: 'users', bg: '#ECFDF3', color: '#16A34A' },
  { label: 'Tempo médio', value: '2.5h', icon: 'clock', bg: '#F3E8FF', color: '#9333EA' },
];

export default function ProfileImprovedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.menuSlot} />
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <Pressable style={styles.editHeaderButton}>
            <Feather name="edit-3" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.headerSubtitle}>Profissional de Limpeza</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.summaryCard}>
          <View style={styles.center}>
            <View style={styles.avatar}>
              <Feather name="user" size={56} color={colors.primary} />
            </View>
            <Text style={styles.name}>{profile.name}</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedText}>Profissional Certificada</Text>
            </View>
            <Text style={styles.region}>{profile.region}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.center}>
              <View style={styles.ratingRow}>
                <Feather name="star" size={18} color="#EAB308" />
                <Text style={styles.statsValue}>{profile.rating}</Text>
              </View>
              <Text style={styles.statsLabel}>{profile.reviews} avaliações</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.center}>
              <Text style={styles.statsValue}>{profile.jobs}</Text>
              <Text style={styles.statsLabel}>Serviços concluídos</Text>
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.levelCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.levelTitle}>Nível Profissional</Text>
              <Text style={styles.levelValue}>Nível 2 - Profissional</Text>
            </View>
            <View style={styles.levelIcon}>
              <Feather name="trending-up" size={18} color={colors.primary} />
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.progressLabel}>Progresso para Nível 3</Text>
              <Text style={styles.progressPercent}>68%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>
          <Text style={styles.progressHint}>
            Complete mais serviços e treinamentos para evoluir e desbloquear benefícios exclusivos.
          </Text>
        </AppCard>

        <View>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Certificados</Text>
            <Pressable>
              <Text style={styles.link}>Ver todos</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.certsRow}>
            {profile.certificates.map((cert) => (
              <AppCard key={cert.id} style={styles.certCard}>
                <View style={styles.certIcon}>
                  <Feather name="award" size={18} color={colors.primary} />
                </View>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certDate}>Emitido em {cert.year}</Text>
              </AppCard>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <AppCard key={metric.label} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: metric.bg }]}>
                  <Feather name={metric.icon} size={16} color={metric.color} />
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </AppCard>
            ))}
          </View>
        </View>

        <AppCard>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Pressable>
              <Text style={styles.link}>Editar</Text>
            </Pressable>
          </View>
          <Text style={styles.aboutText}>
            Profissional de limpeza com 3 anos de experiência. Especializada em limpeza residencial e comercial.
            Compromisso com qualidade, pontualidade e satisfação do cliente.
          </Text>
        </AppCard>

        <AppButton title="Editar Perfil" left={<Feather name="edit-3" size={16} color="#FFF" />} onPress={() => {}} />
        <AppButton
          title="Configurações"
          variant="secondary"
          left={<Feather name="settings" size={16} color={colors.cardForeground} />}
          onPress={() => {}}
        />
        <AppButton
          title="Sair da Conta"
          variant="ghost"
          textStyle={{ color: '#DC2626' }}
          style={{ borderColor: '#FECACA', backgroundColor: '#FFFFFF' }}
          left={<Feather name="log-out" size={16} color="#DC2626" />}
          onPress={() => navigation.navigate('HomeTab')}
        />

        <Text style={styles.memberSince}>Membro desde Janeiro de 2023</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 3, marginLeft: 46 },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  center: { alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryCard: { borderWidth: 1, borderColor: colors.border },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(31,128,234,0.2)',
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { color: colors.cardForeground, fontSize: 25, fontWeight: '700', marginBottom: 8 },
  verifiedPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31,128,234,0.2)',
    backgroundColor: 'rgba(31,128,234,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  verifiedText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  region: { color: colors.mutedForeground, fontSize: 13, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsValue: { color: colors.cardForeground, fontSize: 30, fontWeight: '800' },
  statsLabel: { color: colors.mutedForeground, fontSize: 12 },
  divider: { width: 1, height: 52, backgroundColor: colors.border },
  levelCard: { borderWidth: 1, borderColor: colors.border },
  levelTitle: { color: colors.cardForeground, fontSize: 15, fontWeight: '700' },
  levelValue: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: { color: colors.mutedForeground, fontSize: 12 },
  progressPercent: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  progressTrack: { marginTop: 6, height: 10, borderRadius: 999, backgroundColor: colors.accent, overflow: 'hidden' },
  progressFill: { width: '68%', height: '100%', backgroundColor: colors.primary },
  progressHint: { color: colors.mutedForeground, fontSize: 12, marginTop: 10, lineHeight: 18 },
  sectionTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '700' },
  link: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  certsRow: { gap: 10, paddingTop: 10, paddingBottom: 6, paddingRight: 6 },
  certCard: { width: 170, borderWidth: 1, borderColor: colors.border },
  certIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  certName: { color: colors.cardForeground, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  certDate: { color: colors.mutedForeground, fontSize: 12 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  metricCard: { width: '48%', borderWidth: 1, borderColor: colors.border },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: { color: colors.cardForeground, fontSize: 24, fontWeight: '800', marginBottom: 2 },
  metricLabel: { color: colors.mutedForeground, fontSize: 11 },
  aboutText: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 10 },
  memberSince: { textAlign: 'center', color: colors.mutedForeground, fontSize: 12, paddingVertical: 8 },
});
