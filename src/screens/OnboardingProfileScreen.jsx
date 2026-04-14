import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import HeaderActionButton from '../components/HeaderActionButton.jsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { useOnboarding } from '../hooks/useOnboarding';
import { useQuestionsFlow } from '../hooks/useQuestionsFlow';

export default function OnboardingProfileScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();
  const { questionsData, resetQuestionsData } = useQuestionsFlow();
  const insets = useSafeAreaInsets();

  const [hasPhoto, setHasPhoto] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [bio, setBio] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const regions = [
    'São Paulo - Zona Sul',
    'São Paulo - Zona Norte',
    'São Paulo - Zona Leste',
    'São Paulo - Zona Oeste',
    'São Paulo - Centro',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Brasília',
    'Outra região',
  ];

  const services = [
    { id: 'limpeza-completa', label: 'Limpeza\nCompleta', emoji: '🏠' },
    { id: 'limpeza-rapida', label: 'Limpeza\nRápida', emoji: '⚡' },
    { id: 'limpeza-pesada', label: 'Limpeza\nPesada', emoji: '💪' },
    { id: 'passar-roupa', label: 'Passar\nRoupa', emoji: '👔' },
    { id: 'organizar-armarios', label: 'Organizar\nArmários', emoji: '🗄️' },
    { id: 'cozinha', label: 'Cozinha\nEspecial', emoji: '🍳' },
  ];

  const toggleService = useCallback((serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]
    );
  }, []);

  const calculateProgress = useCallback(() => {
    let completed = 0;
    if (hasPhoto) completed += 25;
    if (selectedRegion) completed += 25;
    if (selectedServices.length > 0) completed += 25;
    if (bio.length >= 20) completed += 25;
    return completed;
  }, [hasPhoto, selectedRegion, selectedServices, bio]);

  const progress = calculateProgress();
  const canContinue = progress >= 75;

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
    if (!canContinue) return;
    try {
      const selectedSpecialties = services
        .filter((service) => selectedServices.includes(service.id))
        .map((service) => service.label.replace('\n', ' '));

      await completeStep('profile', {
        bio,
        service_region: selectedRegion,
        specialties: selectedSpecialties,
        experience_years: experienceYearsFromQuestions,
      });
      resetQuestionsData();
      navigation.navigate('OnboardingFirstAction');
    } catch (err) {
      console.error('Error completing profile step:', err);
    }
  }, [
    bio,
    canContinue,
    completeStep,
    experienceYearsFromQuestions,
    navigation,
    resetQuestionsData,
    selectedRegion,
    selectedServices,
    services,
  ]);

  if (!status) {
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
          <HeaderActionButton onPress={() => navigation.goBack()} icon="chevron-left" size={24} style={styles.backButton} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Complete seu perfil</Text>
            <Text style={styles.headerSubtitle}>Isso ajuda clientes a te conhecerem</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Seu perfil está {progress}% completo</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Foto de perfil</Text>
          <View style={styles.photoCard}>
            <View style={styles.photoSection}>
              <Pressable
                onPress={() => setHasPhoto(!hasPhoto)}
                style={styles.photoPickerWrap}
              >
                <View
                  style={[
                    styles.photoPicker,
                    {
                      borderColor: hasPhoto ? colors.primary : 'rgba(26, 62, 112, 0.08)',
                      backgroundColor: hasPhoto ? 'rgba(31, 128, 234, 0.08)' : '#F5F8FC',
                    },
                  ]}
                >
                  {hasPhoto ? (
                    <Text style={styles.photoEmoji}>👩</Text>
                  ) : (
                    <Feather name="user" size={42} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={styles.photoBadge}>
                  <Feather name="camera" size={16} color={colors.primaryForeground} />
                </View>
              </Pressable>
              <Text style={styles.photoTitle}>{hasPhoto ? 'Toque para trocar sua foto' : 'Adicione sua melhor foto'}</Text>
              <Text style={styles.photoSubtitle}>Um perfil com foto transmite mais confiança para clientes.</Text>
            </View>
          </View>
        </View>

        {/* Region Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Região de atuação</Text>
          <Pressable
            onPress={() => setShowRegionDropdown(!showRegionDropdown)}
            style={styles.selectButton}
          >
            <View style={styles.selectContent}>
              <Text
                style={[
                  styles.selectText,
                  !selectedRegion && { color: colors.mutedForeground },
                ]}
              >
                {selectedRegion || 'Selecione sua região'}
              </Text>
            </View>
            <Feather name="map-pin" size={20} color={colors.mutedForeground} />
          </Pressable>

          {showRegionDropdown && (
            <View style={styles.dropdown}>
              <FlatList
                data={regions}
                keyExtractor={(item) => item}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setSelectedRegion(item);
                      setShowRegionDropdown(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      selectedRegion === item && styles.dropdownItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedRegion === item && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {/* Services Offered */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Serviços que você oferece</Text>
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
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Feather name="check" size={12} color={colors.primaryForeground} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pequena descrição sobre você</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Ex: Sou profissional há 5 anos, amo o que faço..."
            placeholderTextColor={colors.mutedForeground}
            maxLength={200}
            multiline
            style={styles.bioInput}
          />
          <View style={styles.bioFooter}>
            <Text style={styles.bioHelper}>Mínimo 20 caracteres</Text>
            <Text
              style={[
                styles.bioCounter,
                { color: bio.length < 20 ? colors.mutedForeground : colors.primary },
              ]}
            >
              {bio.length}/200
            </Text>
          </View>
        </View>

        {/* Completion Card */}
        {progress >= 75 && (
          <View style={styles.completionCard}>
            <View style={styles.completionDot} />
            <View>
              <Text style={styles.completionTitle}>Perfil quase completo!</Text>
              <Text style={styles.completionText}>
                Você está pronta para continuar. Pode adicionar mais informações depois.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md }]}>
        <AppButton
          title={saving ? 'Salvando...' : 'Continuar'}
          onPress={handleContinue}
          disabled={!canContinue || saving}
          left={
            saving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
            )
          }
        />
        {!canContinue && (
          <Text style={styles.footerHelper}>Complete pelo menos 75% do perfil para continuar</Text>
        )}
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
  backButton: {},
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
    alignItems: 'center',
  },
  photoCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  photoPickerWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  photoPicker: {
    width: 116,
    height: 116,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 54,
  },
  photoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  photoTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  photoSubtitle: {
    marginTop: spacing.xs,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 260,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(26, 62, 112, 0.1)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectContent: {
    flex: 1,
  },
  selectText: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 62, 112, 0.08)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(31, 128, 234, 0.08)',
  },
  dropdownItemText: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  serviceEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
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
