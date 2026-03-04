import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth';
import { getProfile } from '../services/modules/profile.service';
import { getTrainingTrailById } from '../services/modules/training.service';
import {
  createCertificate,
  downloadCertificateById,
  getCertificateById,
  getMyCertificates,
  shareCertificateFile,
} from '../services/modules/certificates.service';
import { colors } from '../theme/tokens';

export default function CertificateScreen({ route, navigation }) {
  const { trailId, certificateId } = route.params || {};
  const { user } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        if (!certificateId && !trailId) {
          setError('Certificado não informado.');
          setLoading(false);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const [profile, trailResponse] = await Promise.all([
            getProfile().catch(() => null),
            trailId ? getTrainingTrailById(trailId).catch(() => null) : Promise.resolve(null),
          ]);

          const profileUserId =
            Number(user?.id) ||
            Number(profile?.user?.id) ||
            Number(profile?.id) ||
            Number(profile?.user_id) ||
            null;

          const trailTitle =
            trailResponse?.trail?.title ||
            trailResponse?.title ||
            (trailId ? `Trilha ${trailId}` : 'Treinamento');

          let resolvedCertificate = null;
          if (certificateId != null) {
            const certificateResponse = await getCertificateById(certificateId).catch(() => null);
            resolvedCertificate =
              certificateResponse?.data ||
              certificateResponse?.certificate ||
              null;
          }

          if (!resolvedCertificate) {
            const myCertificatesResponse = await getMyCertificates().catch(() => null);
            const myCertificates = Array.isArray(myCertificatesResponse?.data)
              ? myCertificatesResponse.data
              : Array.isArray(myCertificatesResponse)
                ? myCertificatesResponse
                : [];

            resolvedCertificate =
              myCertificates.find((item) => {
                if (!item) return false;
                if (!trailTitle || !item.course_name) return false;
                return item.course_name.trim().toLowerCase() === trailTitle.trim().toLowerCase();
              }) || null;
          }

          if (!resolvedCertificate) {
            if (!profileUserId) {
              throw new Error('Usuário não identificado para gerar certificado.');
            }

            const createResponse = await createCertificate({
              user_id: profileUserId,
              course_name: trailTitle,
            });

            resolvedCertificate =
              createResponse?.data || createResponse?.certificate || null;
          }

          if (resolvedCertificate?.id) {
            const certificateDetailsResponse = await getCertificateById(resolvedCertificate.id).catch(() => null);
            resolvedCertificate =
              certificateDetailsResponse?.data ||
              certificateDetailsResponse?.certificate ||
              resolvedCertificate;
          }

          if (!isActive) return;
          setCertificate(resolvedCertificate || null);
          setStudentName(profile?.name || resolvedCertificate?.student_name || 'Profissional');
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
    }, [certificateId, trailId, user?.id])
  );

  const cert = certificate;
  const canDownload = !!cert?.id || !!certificateId;
  const canShare = !!cert?.share_url;

  const onDownload = useCallback(async () => {
    const targetId = cert?.id || certificateId;
    if (!targetId || downloading) return;

    setDownloading(true);
    try {
      const { uri } = await downloadCertificateById(targetId);
      const shared = await shareCertificateFile(uri);

      if (!shared) {
        Alert.alert('Download concluído', `Arquivo salvo em: ${uri}`);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Não foi possível baixar o certificado.';
      Alert.alert('Erro ao baixar certificado', message);
    } finally {
      setDownloading(false);
    }
  }, [cert?.id, certificateId, downloading]);

  const certIdLabel = useMemo(
    () => cert?.certificate_code || cert?.verification_code || certificateId || '-',
    [cert?.certificate_code, cert?.verification_code, certificateId]
  );

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
            <Text style={styles.certCourse}>{cert.trail_title || cert.course_name || (trailId ? `Trilha ${trailId}` : 'Treinamento')}</Text>
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

        <AppButton
          title={downloading ? 'Baixando...' : 'Baixar Certificado'}
          disabled={!canDownload || downloading}
          left={<Feather name="download" size={16} color="#FFF" />}
          onPress={() => canDownload && onDownload()}
        />
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
