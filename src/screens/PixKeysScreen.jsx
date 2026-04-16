import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import CustomErrorModal from '../components/CustomErrorModal.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { createAccountProviderPixKey, getAccountProviderPixKeys } from '../services/modules/finance.service';
import { colors, radius, spacing, typography } from '../theme/tokens';

const MAX_PIX_KEYS = 5;

const initialPixKeys = [
  { id: 'pix-1', type: 'Chave aleatoria', value: '2f11c990-4f8d-4a47-8f8c-ef21a10c39ab', status: 'Principal' },
  { id: 'pix-2', type: 'Chave aleatoria', value: '7b32e8bf-2f7d-41cb-bf66-1c90a6ad2f10', status: 'Ativa' },
  { id: 'pix-3', type: 'Chave aleatoria', value: '0b4d3b65-9ed5-4e9f-8f35-54a67d118021', status: 'Ativa' },
];

const mockKeySuggestions = [
  { type: 'Chave aleatoria', value: '91d5777f-0e7b-47ce-9ed3-93ddc8091f21' },
  { type: 'Chave aleatoria', value: '3f50990a-95ff-470e-baa3-b1d6e8d4c882' },
  { type: 'Chave aleatoria', value: 'a8731d09-2f0e-4bc4-9776-1b1db5345a67' },
];

function KeyBadge({ text }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function normalizePixKeyType(value) {
  const normalized = String(value || '').trim().toUpperCase();

  if (normalized === 'EVP' || normalized === 'RANDOM' || normalized === 'RANDOM_KEY') {
    return 'Chave aleatoria';
  }

  if (!normalized) {
    return 'Chave aleatoria';
  }

  return 'Chave aleatoria';
}

function mapPixKeysResponse(response) {
  const source =
    response?.data?.addressKeys ||
    response?.data?.address_keys ||
    response?.addressKeys ||
    response?.address_keys ||
    response?.data ||
    response;

  if (!Array.isArray(source)) {
    return initialPixKeys;
  }

  const mapped = source
    .map((item, index) => ({
      id: String(item?.id || item?.addressKey || item?.address_key || item?.value || `pix-api-${index}`),
      type: normalizePixKeyType(item?.type || item?.keyType || item?.key_type),
      value: String(item?.value || item?.addressKey || item?.address_key || '').trim(),
      status: item?.status || item?.label || (index === 0 ? 'Principal' : 'Ativa'),
    }))
    .filter((item) => item.value);

  return mapped.length > 0 ? mapped : initialPixKeys;
}

export default function PixKeysScreen({ navigation }) {
  const [pixKeys, setPixKeys] = useState(initialPixKeys);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    title: '',
    message: '',
    tone: 'info',
    buttonLabel: 'Entendi',
  });
  const [removeModal, setRemoveModal] = useState({
    visible: false,
    key: null,
  });

  const nextSuggestion = useMemo(() => {
    return mockKeySuggestions[pixKeys.length - initialPixKeys.length] || mockKeySuggestions[mockKeySuggestions.length - 1];
  }, [pixKeys.length]);

  const loadPixKeys = useCallback(async (options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setLoadingKeys(true);
    }

    try {
      const response = await getAccountProviderPixKeys();
      setPixKeys(mapPixKeysResponse(response));
    } catch {
      setPixKeys(initialPixKeys);
    } finally {
      if (!silent) {
        setLoadingKeys(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        if (!isActive) return;
        await loadPixKeys();
      };

      void run();

      return () => {
        isActive = false;
      };
    }, [loadPixKeys])
  );

  const handleAddKey = async () => {
    if (pixKeys.length >= MAX_PIX_KEYS) {
      setFeedbackModal({
        visible: true,
        title: 'Limite atingido',
        message: 'Voce pode ter no maximo 5 chaves Pix cadastradas.',
        tone: 'warning',
        buttonLabel: 'Entendi',
      });
      return;
    }

    try {
      setCreatingKey(true);
      const response = await createAccountProviderPixKey();
      await loadPixKeys({ silent: true });

      const createdKey =
        response?.data?.addressKey ||
        response?.data?.address_key ||
        response?.addressKey ||
        response?.address_key ||
        response?.data?.value ||
        response?.value ||
        nextSuggestion.value;

      setFeedbackModal({
        visible: true,
        title: 'Chave adicionada',
        message: `Chave aleatoria criada com sucesso.\n\n${createdKey}`,
        tone: 'info',
        buttonLabel: 'Entendi',
      });
    } catch (err) {
      setFeedbackModal({
        visible: true,
        title: 'Erro',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Nao foi possivel criar a chave Pix no momento.',
        tone: 'danger',
        buttonLabel: 'Entendi',
      });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRemoveKey = (key) => {
    setRemoveModal({
      visible: true,
      key,
    });
  };

  return (
    <View style={styles.container}>
      <CustomErrorModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        tone={feedbackModal.tone}
        buttonLabel={feedbackModal.buttonLabel}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />

      <CustomErrorModal
        visible={removeModal.visible}
        title="Remover chave"
        message={removeModal.key ? `Deseja remover a chave ${removeModal.key.value}?` : ''}
        tone="warning"
        buttonLabel="Remover"
        secondaryButtonLabel="Cancelar"
        onSecondaryPress={() => setRemoveModal({ visible: false, key: null })}
        onButtonPress={() => {
          if (removeModal.key) {
            setPixKeys((current) => current.filter((item) => item.id !== removeModal.key.id));
          }
          setRemoveModal({ visible: false, key: null });
        }}
        onClose={() => setRemoveModal({ visible: false, key: null })}
      />

      <AppScreenHeader
        title="Minhas chaves Pix"
        subtitle="Adicione, acompanhe e remova suas chaves"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="key-chain" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Suas chaves em um lugar só</Text>
          <Text style={styles.heroSubtitle}>
            Use suas chaves Pix para receber com praticidade e mantenha tudo organizado por aqui.
          </Text>
        </View>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo</Text>
          <Text style={styles.summaryValue}>{loadingKeys ? '--' : pixKeys.length} chave(s) cadastrada(s)</Text>
          <Text style={styles.summaryDescription}>Você pode adicionar novas chaves ou remover as que não usa mais.</Text>
        </AppCard>

        <AppButton
          title={
            creatingKey
              ? 'Criando chave...'
              : pixKeys.length >= MAX_PIX_KEYS
                ? 'Limite de chaves atingido'
                : 'Adicionar nova chave'
          }
          onPress={handleAddKey}
          disabled={pixKeys.length >= MAX_PIX_KEYS || creatingKey}
          left={<Feather name="plus" size={16} color="#FFFFFF" />}
          style={styles.addButton}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lista de chaves</Text>
        </View>

        {loadingKeys ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando suas chaves Pix...</Text>
          </View>
        ) : null}

        {!loadingKeys ? pixKeys.map((key) => (
          <AppCard key={key.id} style={styles.keyCard}>
            <View style={styles.keyTopRow}>
              <View style={styles.keyTypeWrap}>
                <View style={styles.keyIconWrap}>
                  <Feather name="zap" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.keyType}>{key.type}</Text>
                  <Text style={styles.keyValue}>{key.value}</Text>
                </View>
              </View>
              <KeyBadge text={key.status} />
            </View>

            <View style={styles.keyActionsRow}>
              <Pressable style={({ pressed }) => [styles.keyActionButton, pressed && styles.keyActionPressed]}>
                <Feather name="copy" size={16} color={colors.primary} />
                <Text style={styles.keyActionText}>Copiar</Text>
              </Pressable>
              <Pressable
                onPress={() => handleRemoveKey(key)}
                style={({ pressed }) => [styles.keyActionButton, styles.keyActionDanger, pressed && styles.keyActionPressed]}
              >
                <Feather name="trash-2" size={16} color={colors.danger} />
                <Text style={[styles.keyActionText, styles.keyActionDangerText]}>Remover</Text>
              </Pressable>
            </View>
          </AppCard>
        )) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#0F9D7A',
    borderRadius: 28,
    padding: 22,
    marginBottom: spacing.lg,
    shadowColor: '#0B5D49',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  summaryTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.cardForeground,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryDescription: {
    marginTop: 6,
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  keyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  keyTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyTypeWrap: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  keyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyType: {
    color: colors.cardForeground,
    fontSize: 15,
    fontWeight: '800',
  },
  keyValue: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(15,157,122,0.14)',
  },
  badgeText: {
    color: '#0F9D7A',
    fontSize: 12,
    fontWeight: '700',
  },
  keyActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  keyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(31,128,234,0.1)',
  },
  keyActionDanger: {
    backgroundColor: 'rgba(229,72,77,0.1)',
  },
  keyActionPressed: {
    opacity: 0.9,
  },
  keyActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  keyActionDangerText: {
    color: colors.danger,
  },
});
