import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';
import { getRouteForStep } from '../navigation/onboardingStepMap';
import { getOnboardingCoverage } from '../services/modules/onboarding.service';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { pickAndUploadImage } from '../utils/imagePickerUpload';

const MIN_BIO_LENGTH = 20;

const sanitizeCep = (value) => String(value || '').replace(/\D/g, '').slice(0, 8);

const formatCep = (value) => {
  const digits = sanitizeCep(value);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const getInitialServiceAreaLabel = (status) => {
  const profile = status?.profile;
  if (!profile || typeof profile !== 'object') {
    return '';
  }

  const serviceArea = profile.service_area;
  if (serviceArea && typeof serviceArea === 'object') {
    return serviceArea.display_label || serviceArea.label || serviceArea.region || '';
  }

  if (typeof serviceArea === 'string' && serviceArea.trim()) {
    return serviceArea;
  }

  return profile.region || '';
};

export default function OnboardingProfileScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const { questionsData, resetQuestionsData } = useQuestionsFlow();
  const insets = useSafeAreaInsets();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bio, setBio] = useState('');
  const [cep, setCep] = useState('');
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageResult, setCoverageResult] = useState(null);
  const [coverageError, setCoverageError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  const services = [
    { id: 'limpeza-completa', label: 'Limpeza\nCompleta', emoji: 'LC' },
    { id: 'limpeza-rapida', label: 'Limpeza\nRapida', emoji: 'LR' },
    { id: 'limpeza-pesada', label: 'Limpeza\nPesada', emoji: 'LP' },
    { id: 'passar-roupa', label: 'Passar\nRoupa', emoji: 'PR' },
    { id: 'organizar-armarios', label: 'Organizar\nArmarios', emoji: 'OA' },
    { id: 'cozinha', label: 'Cozinha\nEspecial', emoji: 'CE' },
  ];

  useEffect(() => {
    if (!status) {
      setIsInitialLoading(true);
      return;
    }

    setIsInitialLoading(false);

    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }

    if (status.current_step !== 'profile') {
      navigation.navigate(getRouteForStep(status.current_step));
      return;
    }

    const profile = status.profile;
    if (profile && typeof profile === 'object') {
      if (!profilePhotoUrl && profile.profile_photo) {
        setProfilePhotoUrl(profile.profile_photo);
      }
      if (!bio && profile.bio) {
        setBio(profile.bio);
      }
      if (!cep && profile.cep) {
        setCep(formatCep(profile.cep));
      }
      if (!coverageResult) {
        const initialLabel = getInitialServiceAreaLabel(status);
        if (initialLabel) {
          setCoverageResult({
            covered: true,
            display_label: initialLabel,
          });
        }
      }
    }
  }, [bio, cep, coverageResult, navigation, profilePhotoUrl, status]);

  useEffect(() => {
    const digits = sanitizeCep(cep);
    if (!digits) {
      setCoverageLoading(false);
      setCoverageResult(null);
      setCoverageError('');
      return undefined;
    }

    if (digits.length < 8) {
      setCoverageLoading(false);
      setCoverageResult(null);
      setCoverageError('Informe um CEP valido para consultar a cobertura.');
      return undefined;
    }

    let isActive = true;
    setCoverageLoading(true);
    setCoverageError('');

    const timer = setTimeout(async () => {
      try {
        const response = await getOnboardingCoverage(formatCep(digits));
        if (!isActive) {
          return;
        }

        if (response?.covered) {
          setCoverageResult(response);
          setCoverageError('');
          return;
        }

        setCoverageResult(response || null);
        setCoverageError(response?.message || 'Ainda nao atendemos esse CEP no Clin Pro.');
      } catch (err) {
        if (!isActive) {
          return;
        }
        setCoverageResult(null);
        setCoverageError(err?.response?.data?.message || 'Nao foi possivel consultar a cobertura agora.');
      } finally {
        if (isActive) {
          setCoverageLoading(false);
        }
      }
    }, 450);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [cep]);

  const toggleService = useCallback((serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((item) => item !== serviceId) : [...prev, serviceId]
    );
  }, []);

  const progress = useMemo(() => {
    let completed = 0;
    if (profilePhotoUrl.trim()) completed += 25;
    if (coverageResult?.covered) completed += 25;
    if (selectedServices.length > 0) completed += 25;
    if (bio.trim().length >= MIN_BIO_LENGTH) completed += 25;
    return completed;
  }, [bio, coverageResult?.covered, profilePhotoUrl, selectedServices.length]);

  const canContinue = progress >= 75 && coverageResult?.covered;

  const handleProfilePhotoUpload = useCallback(async (source) => {
    try {
      setUploadingPhoto(true);
      const upload = await pickAndUploadImage({
        source,
        folder: 'clinpro/profile-photos',
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (upload?.url) {
        setProfilePhotoUrl(upload.url);
      }
    } catch (err) {
      Alert.alert('Erro', err?.message || 'Nao foi possivel enviar a foto de perfil.');
    } finally {
      setUploadingPhoto(false);
    }
  }, []);

  const experienceYearsFromQuestions = useMemo(() => {
    switch (questionsData?.experience) {
      case 'iniciante':
        return 0;
      case 'menos-1-ano':
        return 1;
      case '1-3-anos':
        return 2;
      case 'mais-3-anos':
        return 4;
      default:
        return 0;
    }
  }, [questionsData?.experience]);

  const handleContinue = useCallback(async () => {
    if (!canContinue) {
      return;
    }

    try {
      await completeStep('profile', {
        bio: bio.trim(),
        cep: formatCep(cep),
        experience_years: experienceYearsFromQuestions,
        profile_photo: profilePhotoUrl.trim(),
        specialties: selectedServices,
      });
      resetQuestionsData();
      navigation.navigate('OnboardingFirstAction');
    } catch (err) {
      console.error('Error completing profile step:', err);
    }
  }, [
    bio,
    canContinue,
    cep,
    completeStep,
    experienceYearsFromQuestions,
    navigation,
    profilePhotoUrl,
    resetQuestionsData,
    selectedServices,
  ]);

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color={colors.primaryForeground} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Complete seu perfil</Text>
            <Text style={styles.headerSubtitle}>Seu CEP define a area atendida no Clin Pro</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Seu perfil esta {progress}% completo</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Foto de perfil</Text>
          <View style={styles.photoSection}>
            <View
              style={[
                styles.photoPicker,
                {
                  borderColor: profilePhotoUrl.trim() ? colors.primary : colors.border,
                  backgroundColor: profilePhotoUrl.trim() ? 'rgba(31, 128, 234, 0.05)' : colors.accent,
                },
              ]}
            >
              {profilePhotoUrl.trim() ? (
                <Text style={styles.photoEmoji}>OK</Text>
              ) : (
                <Feather name="camera" size={32} color={colors.mutedForeground} />
              )}
            </View>
            <View style={[styles.photoButton, { flexGrow: 1 }]}>
              <View style={styles.photoButtonHeader}>
                <Feather name="camera" size={20} color={colors.primary} />
                <View style={styles.photoButtonText}>
                  <Text style={styles.photoButtonTitle}>
                    {profilePhotoUrl.trim() ? 'Foto vinculada' : 'Adicionar foto'}
                  </Text>
                  <Text style={styles.photoButtonSubtitle}>Camera ou galeria com upload automatico</Text>
                </View>
              </View>
              <View style={styles.uploadActions}>
                <AppButton
                  title={uploadingPhoto ? 'Enviando...' : 'Camera'}
                  onPress={() => handleProfilePhotoUpload('camera')}
                  variant="secondary"
                  disabled={uploadingPhoto}
                  style={styles.inlineButton}
                />
                <AppButton
                  title={uploadingPhoto ? 'Enviando...' : 'Galeria'}
                  onPress={() => handleProfilePhotoUpload('library')}
                  variant="ghost"
                  disabled={uploadingPhoto}
                  style={styles.inlineButton}
                />
              </View>
            </View>
          </View>
          <TextInput
            value={profilePhotoUrl}
            onChangeText={setProfilePhotoUrl}
            placeholder="URL da foto de perfil"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            style={[styles.bioInput, styles.photoUrlInput]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CEP de atendimento</Text>
          <TextInput
            value={cep}
            onChangeText={(value) => setCep(formatCep(value))}
            placeholder="00000-000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={9}
            style={styles.selectButton}
          />

          <View style={styles.coverageCard}>
            <View style={styles.coverageHeader}>
              <Feather
                name={coverageResult?.covered ? 'check-circle' : coverageError ? 'alert-circle' : 'map-pin'}
                size={18}
                color={coverageResult?.covered ? '#16a34a' : coverageError ? '#dc2626' : colors.primary}
              />
              <Text style={styles.coverageTitle}>Cobertura via backend</Text>
              {coverageLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </View>

            {coverageResult?.covered ? (
              <>
                <Text style={styles.coverageLabel}>{coverageResult.display_label}</Text>
                <Text style={styles.coverageHelper}>
                  Esta sera a sua area principal de atendimento no Clin Pro.
                </Text>
              </>
            ) : (
              <Text style={styles.coverageHelper}>
                {coverageError || 'Digite um CEP valido para consultar a cobertura da sua regiao.'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Servicos que voce oferece</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <Pressable
                  key={service.id}
                  onPress={() => toggleService(service.id)}
                  style={[
                    styles.serviceCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? 'rgba(31, 128, 234, 0.05)' : colors.card,
                    },
                  ]}
                >
                  <Text style={styles.serviceEmoji}>{service.emoji}</Text>
                  <Text
                    style={[
                      styles.serviceLabel,
                      { color: isSelected ? colors.primary : colors.cardForeground },
                    ]}
                  >
                    {service.label}
                  </Text>
                  {isSelected ? (
                    <View style={styles.checkmark}>
                      <Feather name="check" size={12} color={colors.primaryForeground} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pequena descricao sobre voce</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Ex: Sou profissional ha 5 anos, amo o que faco..."
            placeholderTextColor={colors.mutedForeground}
            maxLength={200}
            multiline
            style={styles.bioInput}
          />
          <View style={styles.bioFooter}>
            <Text style={styles.bioHelper}>Minimo 20 caracteres</Text>
            <Text
              style={[
                styles.bioCounter,
                { color: bio.trim().length < MIN_BIO_LENGTH ? colors.mutedForeground : colors.primary },
              ]}
            >
              {bio.length}/200
            </Text>
          </View>
        </View>

        {progress >= 75 ? (
          <View style={styles.completionCard}>
            <View style={styles.completionDot} />
            <View style={styles.completionContent}>
              <Text style={styles.completionTitle}>Perfil quase completo!</Text>
              <Text style={styles.completionText}>
                {coverageResult?.covered
                  ? 'Sua area de atendimento foi validada. Voce ja pode seguir para a proxima etapa.'
                  : 'Finalize com um CEP atendido para continuar no onboarding.'}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md }]}>
        <AppButton
          title={loading ? 'Salvando...' : 'Continuar'}
          onPress={handleContinue}
          disabled={!canContinue || loading}
          left={
            loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
            )
          }
        />
        {!canContinue ? (
          <Text style={styles.footerHelper}>
            Adicione foto, bio e um CEP atendido para continuar
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  progressLabel: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryForeground,
    borderRadius: radius.full,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoPicker: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  photoButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  photoButtonText: {
    flex: 1,
  },
  photoButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoButtonTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  photoButtonSubtitle: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  inlineButton: {
    flex: 1,
    minHeight: 42,
  },
  photoUrlInput: {
    minHeight: 52,
    maxHeight: 52,
    marginTop: spacing.md,
  },
  selectButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
  },
  coverageCard: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coverageTitle: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  coverageLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  coverageHelper: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  serviceEmoji: {
    fontSize: 18,
    marginBottom: spacing.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  serviceLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  bioInput: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    minHeight: 120,
    maxHeight: 160,
    textAlignVertical: 'top',
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  bioHelper: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
  },
  bioCounter: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  completionCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  completionDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#22c55e',
    marginTop: spacing.xs,
  },
  completionContent: {
    flex: 1,
  },
  completionTitle: {
    color: '#166534',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  completionText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 62, 112, 0.08)',
  },
  footerHelper: {
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
  },
});
