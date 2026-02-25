import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { getProfile } from '../services/modules/profile.service';
import { getTrainingCertificateById } from '../services/modules/training.service';
import { colors } from '../theme/tokens';

export default function CertificateScreen({ route, navigation }) {
  const { trailId, certificateId } = route.params || {};
  const [certificate, setCertificate] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        if (!certificateId) {
          setError('Certificado não informado');
          setLoading(false);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const [certResponse, profile] = await Promise.all([
            getTrainingCertificateById(certificateId),
            getProfile().catch(() => null),
          ]);
          if (!isActive) return;
          setCertificate(certResponse?.certificate || null);
          setStudentName(profile?.name || certResponse?.certificate?.student_name || 'Profissional');
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar certificado');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      void load();
      return () => {
        isActive = false;
      };
    }, [certificateId])
  );

  const cert = certificate;
  const canDownload = !!cert?.download_url;
  const canShare = !!cert?.share_url;

  const certIdLabel = useMemo(() => cert?.certificate_code || certificateId || '-', [cert?.certificate_code, certificateId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Carregando certificado...</Text>
      </View>
    );
  }

  if (error || !cert) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[styles.centerText, { color: colors.danger }]}>{error || 'Certificado não encontrado'}</Text>
        <AppButton title="Voltar" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
      </View>
    );
  }

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
            <Text style={styles.certName}>{cert.student_name || studentName}</Text>
          </View>

          <View style={styles.certSection}>
            <Text style={styles.certMuted}>concluiu com sucesso o curso de</Text>
            <Text style={styles.certCourse}>{cert.trail_title || (trailId ? `Trilha ${trailId}` : 'Treinamento')}</Text>
          </View>

          <View style={styles.certGrid}>
            <View>
              <Text style={styles.certMuted}>Duração</Text>
              <Text style={styles.certStrong}>{cert.duration_label || '-'}</Text>
            </View>
            <View>
              <Text style={styles.certMuted}>Nota Final</Text>
              <Text style={styles.certStrong}>{cert.final_score_percent != null ? `${cert.final_score_percent}%` : '-'}</Text>
            </View>
          </View>

          <Text style={styles.certId}>{certIdLabel}</Text>
        </View>

        <AppCard>
          <Text style={styles.infoTitle}>Sobre seu Certificado</Text>
          <Text style={styles.infoBody}>Este certificado comprova que você concluiu todos os módulos e passou na avaliação final.</Text>
        </AppCard>

        <AppButton title="Baixar Certificado" disabled={!canDownload} left={<Feather name="download" size={16} color="#FFF" />} onPress={() => canDownload && Linking.openURL(cert.download_url)} />
        <AppButton title="Compartilhar" disabled={!canShare} style={{ backgroundColor: '#2563EB' }} left={<Feather name="share-2" size={16} color="#FFF" />} onPress={() => canShare && Linking.openURL(cert.share_url)} />
        <AppButton title="Voltar aos Treinamentos" variant="secondary" onPress={() => navigation.navigate('TrainingTab')} left={<Feather name="home" size={16} color={colors.cardForeground} />} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  centerText: { marginTop: 10, color: colors.mutedForeground, textAlign: 'center' },
  header: { backgroundColor: '#D97706', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  headerIcon: { width: 64, height: 64, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginTop: 8 },
  headerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  certificateCard: { backgroundColor: '#FFF', borderRadius: 22, borderWidth: 3, borderColor: '#FACC15', padding: 18 },
  certTitle: { color: '#111827', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  certMuted: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 4 },
  certSection: { marginTop: 16, alignItems: 'center' },
  certName: { color: '#111827', fontSize: 24, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  certCourse: { color: colors.primary, fontSize: 18, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  certGrid: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-around' },
  certStrong: { color: '#111827', fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  certId: { marginTop: 16, textAlign: 'center', color: '#374151', fontFamily: 'monospace', fontSize: 12 },
  infoTitle: { color: '#1E3A8A', fontWeight: '700', marginBottom: 6 },
  infoBody: { color: '#1D4ED8', fontSize: 13, lineHeight: 18 },
});
