import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { trails, profile } from '../data/mockData';
import { colors } from '../theme/tokens';

export default function CertificateScreen({ route, navigation }) {
  const { trailId } = route.params || {};
  const trail = trails.find((item) => item.id === String(trailId)) || trails[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}><MaterialCommunityIcons name="certificate" size={30} color="#FFF" /></View>
        <Text style={styles.headerTitle}>Certificado</Text>
        <Text style={styles.headerSub}>Parabéns pela conclusão!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.certificateCard}>
          <Text style={styles.certTitle}>Certificado de Conclusão</Text>
          <Text style={styles.certMuted}>Clin Pro - Treinamento Profissional</Text>

          <View style={styles.certSection}>
            <Text style={styles.certMuted}>Certificamos que</Text>
            <Text style={styles.certName}>{profile.name}</Text>
          </View>

          <View style={styles.certSection}>
            <Text style={styles.certMuted}>concluiu com sucesso o curso de</Text>
            <Text style={styles.certCourse}>{trail.title}</Text>
          </View>

          <View style={styles.certGrid}>
            <View>
              <Text style={styles.certMuted}>Duração</Text>
              <Text style={styles.certStrong}>{trail.duration}</Text>
            </View>
            <View>
              <Text style={styles.certMuted}>Nota Final</Text>
              <Text style={styles.certStrong}>80%</Text>
            </View>
          </View>

          <Text style={styles.certId}>CLN-2026-FLP-001234</Text>
        </View>

        <AppCard>
          <Text style={styles.infoTitle}>Sobre seu Certificado</Text>
          <Text style={styles.infoBody}>Este certificado comprova que você concluiu todos os módulos e passou na avaliação final.</Text>
        </AppCard>

        <AppButton title="Baixar Certificado" left={<Feather name="download" size={16} color="#FFF" />} onPress={() => {}} />
        <AppButton title="Compartilhar" style={{ backgroundColor: '#2563EB' }} left={<Feather name="share-2" size={16} color="#FFF" />} onPress={() => {}} />
        <AppButton title="Voltar aos Treinamentos" variant="secondary" onPress={() => navigation.navigate('TrainingTab')} left={<Feather name="home" size={16} color={colors.cardForeground} />} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: '#D97706', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  headerIcon: { width: 64, height: 64, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginTop: 8 },
  headerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  certificateCard: { backgroundColor: '#FFF', borderRadius: 22, borderWidth: 3, borderColor: '#FACC15', padding: 18 },
  certTitle: { color: '#111827', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  certMuted: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 4 },
  certSection: { marginTop: 16, alignItems: 'center' },
  certName: { color: '#111827', fontSize: 24, fontWeight: '800', marginTop: 4 },
  certCourse: { color: colors.primary, fontSize: 18, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  certGrid: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-around' },
  certStrong: { color: '#111827', fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  certId: { marginTop: 16, textAlign: 'center', color: '#374151', fontFamily: 'monospace', fontSize: 12 },
  infoTitle: { color: '#1E3A8A', fontWeight: '700', marginBottom: 6 },
  infoBody: { color: '#1D4ED8', fontSize: 13, lineHeight: 18 },
});
