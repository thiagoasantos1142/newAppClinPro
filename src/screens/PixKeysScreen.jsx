import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import CustomErrorModal from '../components/CustomErrorModal.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import {
  createAccountProviderPixKey,
  deleteAccountProviderPixKey,
  getAccountProviderPixKeys,
} from '../services/modules/finance.service';
import {
  PIX_KEYS_MAX_COUNT,
  selectPixKeysRemainingCooldownMs,
  selectPixKeysTotal,
  registerPixKeyCreated,
  setPixKeysInventory,
} from '../store/pixKeysSlice';
import { colors, radius, spacing, typography } from '../theme/tokens';

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

  if (normalized === 'CPF') {
    return 'CPF';
  }

  if (normalized === 'CNPJ') {
    return 'CNPJ';
  }

  if (normalized === 'EMAIL') {
    return 'E-mail';
  }

  if (normalized === 'PHONE') {
    return 'Telefone';
  }

  if (!normalized) {
    return 'Chave aleatoria';
  }

  return String(value || 'Chave Pix');
}

function normalizePixKeyStatus(item, index) {
  if (item?.canBeDeleted === false || String(item?.status || '').toUpperCase() === 'PRIMARY') {
    return 'Principal';
  }

  if (String(item?.status || '').toUpperCase() === 'ACTIVE') {
    return 'Ativa';
  }

  return index === 0 ? 'Principal' : 'Ativa';
}

function mapPixKeysResponse(response) {
  const source =
    response?.data?.data ||
    response?.data?.addressKeys ||
    response?.data?.address_keys ||
    response?.addressKeys ||
    response?.address_keys ||
    response?.data ||
    response;

  if (!Array.isArray(source)) {
    return [];
  }

  const mapped = source
    .map((item, index) => ({
      id: String(item?.id || item?.key || item?.addressKey || item?.address_key || item?.value || `pix-api-${index}`),
      type: normalizePixKeyType(item?.type || item?.keyType || item?.key_type),
      value: String(item?.key || item?.value || item?.addressKey || item?.address_key || '').trim(),
      status: normalizePixKeyStatus(item, index),
      raw: item,
    }))
    .filter((item) => item.value);

  return mapped;
}

function formatCooldownMessage(remainingMs) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `Aguarde ${minutes}min${seconds > 0 ? ` ${seconds}s` : ''} para criar outra chave Pix.`;
  }

  return `Aguarde ${seconds}s para criar outra chave Pix.`;
}

export default function PixKeysScreen({ navigation }) {
  const dispatch = useDispatch();
  const [pixKeys, setPixKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [removingKey, setRemovingKey] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [pendingRemovalIds, setPendingRemovalIds] = useState([]);
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
  const totalKeys = useSelector(selectPixKeysTotal);
  const [cooldownTick, setCooldownTick] = useState(Date.now());
  const remainingCooldownMs = useSelector((state) => selectPixKeysRemainingCooldownMs(state, cooldownTick));
  const isCreationBlockedByCooldown = remainingCooldownMs > 0;
  const isCreationBlockedByLimit = totalKeys >= PIX_KEYS_MAX_COUNT;

  React.useEffect(() => {
    if (!isCreationBlockedByCooldown) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCooldownTick(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [isCreationBlockedByCooldown]);

  const loadPixKeys = useCallback(async (options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setLoadingKeys(true);
    }

    try {
      setLoadingError('');
      const response = await getAccountProviderPixKeys();
      const mappedKeys = mapPixKeysResponse(response).filter((item) => !pendingRemovalIds.includes(item.id));
      setPixKeys(mappedKeys);
      dispatch(setPixKeysInventory(mappedKeys.length));
    } catch (err) {
      setPixKeys([]);
      dispatch(setPixKeysInventory(0));
      setLoadingError(
        err?.response?.data?.message ||
        err?.message ||
        'Nao foi possivel carregar suas chaves Pix.'
      );
    } finally {
      if (!silent) {
        setLoadingKeys(false);
      }
    }
  }, [dispatch, pendingRemovalIds]);

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
    if (isCreationBlockedByLimit) {
      setFeedbackModal({
        visible: true,
        title: 'Limite atingido',
        message: 'Voce pode ter no maximo 5 chaves Pix cadastradas.',
        tone: 'warning',
        buttonLabel: 'Entendi',
      });
      return;
    }

    if (isCreationBlockedByCooldown) {
      setFeedbackModal({
        visible: true,
        title: 'Aguarde um momento',
        message: formatCooldownMessage(remainingCooldownMs),
        tone: 'warning',
        buttonLabel: 'Entendi',
      });
      return;
    }

    try {
      setCreatingKey(true);
      const response = await createAccountProviderPixKey();
      await loadPixKeys({ silent: true });
      dispatch(registerPixKeyCreated(Date.now()));
      setCooldownTick(Date.now());

      const createdKey =
        response?.data?.addressKey ||
        response?.data?.address_key ||
        response?.addressKey ||
        response?.address_key ||
        response?.data?.value ||
        response?.value;

      setFeedbackModal({
        visible: true,
        title: 'Chave adicionada',
        message: createdKey
          ? `Chave aleatoria criada com sucesso.\n\n${createdKey}`
          : 'Chave aleatoria criada com sucesso.',
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
    if (key?.raw?.canBeDeleted === false) {
      setFeedbackModal({
        visible: true,
        title: 'Remocao indisponivel',
        message: key?.raw?.cannotBeDeletedReason || 'Esta chave Pix nao pode ser removida no momento.',
        tone: 'warning',
        buttonLabel: 'Entendi',
      });
      return;
    }

    setRemoveModal({
      visible: true,
      key,
    });
  };

  const handleCopyKey = useCallback(async (key) => {
    try {
      await Clipboard.setStringAsync(key.value);
      setFeedbackModal({
        visible: true,
        title: 'Chave copiada',
        message: 'A chave Pix foi copiada com sucesso.',
        tone: 'info',
        buttonLabel: 'Entendi',
      });
    } catch {
      setFeedbackModal({
        visible: true,
        title: 'Erro',
        message: 'Nao foi possivel copiar a chave Pix no momento.',
        tone: 'danger',
        buttonLabel: 'Entendi',
      });
    }
  }, []);

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
        buttonLabel={removingKey ? 'Removendo...' : 'Remover'}
        buttonDisabled={removingKey}
        secondaryButtonLabel="Cancelar"
        onSecondaryPress={() => {
          if (!removingKey) {
            setRemoveModal({ visible: false, key: null });
          }
        }}
        onButtonPress={async () => {
          if (!removeModal.key || removingKey) {
            return;
          }

          try {
            setRemovingKey(true);
            const removedKeyId = removeModal.key.id;
            await deleteAccountProviderPixKey(removedKeyId);
            setPendingRemovalIds((current) => (
              current.includes(removedKeyId) ? current : [...current, removedKeyId]
            ));
            const nextKeys = pixKeys.filter((item) => item.id !== removedKeyId);
            setPixKeys(nextKeys);
            dispatch(setPixKeysInventory(nextKeys.length));
            setRemoveModal({ visible: false, key: null });
            setFeedbackModal({
              visible: true,
              title: 'Chave removida',
              message: 'A chave Pix foi removida com sucesso.',
              tone: 'info',
              buttonLabel: 'Entendi',
            });
            setTimeout(() => {
              setPendingRemovalIds((current) => current.filter((id) => id !== removedKeyId));
            }, 15000);
          } catch (err) {
            setFeedbackModal({
              visible: true,
              title: 'Erro',
              message:
                err?.response?.data?.message ||
                err?.message ||
                'Nao foi possivel remover a chave Pix no momento.',
              tone: 'danger',
              buttonLabel: 'Entendi',
            });
          } finally {
            setRemovingKey(false);
          }
        }}
        onClose={() => {
          if (!removingKey) {
            setRemoveModal({ visible: false, key: null });
          }
        }}
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
          <Text style={styles.summaryValue}>{loadingKeys ? '--' : totalKeys} chave(s) cadastrada(s)</Text>
          <Text style={styles.summaryDescription}>Você pode adicionar novas chaves ou remover as que não usa mais.</Text>
        </AppCard>

        <AppButton
          title={
            creatingKey
              ? 'Criando chave...'
              : isCreationBlockedByLimit
                ? 'Limite de chaves atingido'
                : isCreationBlockedByCooldown
                  ? 'Aguarde para criar outra chave'
                : 'Adicionar nova chave'
          }
          onPress={handleAddKey}
          disabled={isCreationBlockedByLimit || isCreationBlockedByCooldown || creatingKey}
          left={<Feather name="plus" size={16} color="#FFFFFF" />}
          style={styles.addButton}
        />

        {isCreationBlockedByCooldown ? (
          <Text style={styles.cooldownText}>{formatCooldownMessage(remainingCooldownMs)}</Text>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lista de chaves</Text>
        </View>

        {loadingKeys ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando suas chaves Pix...</Text>
          </View>
        ) : null}

        {!loadingKeys && loadingError ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nao foi possivel carregar</Text>
            <Text style={styles.emptyDescription}>{loadingError}</Text>
            <AppButton title="Tentar novamente" onPress={() => loadPixKeys()} style={styles.retryButton} />
          </AppCard>
        ) : null}

        {!loadingKeys && !loadingError && pixKeys.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma chave Pix cadastrada</Text>
            <Text style={styles.emptyDescription}>
              Quando voce criar sua primeira chave, ela aparecera aqui.
            </Text>
          </AppCard>
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
              <Pressable
                onPress={() => handleCopyKey(key)}
                style={({ pressed }) => [styles.keyActionButton, pressed && styles.keyActionPressed]}
              >
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
  cooldownText: {
    marginTop: -6,
    marginBottom: spacing.lg,
    color: colors.warning,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
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
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  emptyTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
  },
  emptyDescription: {
    marginTop: spacing.sm,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.lg,
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
