import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton } from '../components/ui.jsx';
import { sendAccountProviderPixTransfer } from '../services/modules/finance.service';
import { AUTH_UUID_KEY } from '../constants/secureStorage';
import { colors, radius, shadow } from '../theme/tokens';

const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');

const getPixPayload = (recipient) => (
  recipient?.data?.pix ||
  recipient?.pix ||
  recipient?.data ||
  recipient ||
  {}
);

const getRecipientData = (recipient) => {
  const payload = getPixPayload(recipient);

  return {
    name: pickValue(payload.ownerName, payload.name, payload.owner_name),
    bank: pickValue(payload.bank?.name, payload.bank_name, payload.bank),
    pixAddressKey: pickValue(payload.pixAddressKey, payload.pix_key, payload.key),
  };
};

const getSummaryPayload = (response) => response?.data?.summary || response?.summary || {};

const getTransferResult = (response) => (
  response?.data?.transfer ||
  response?.data?.transaction ||
  response?.data?.pix ||
  response?.data ||
  response?.transfer ||
  response?.transaction ||
  response ||
  {}
);

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return String(value);
};

const getApiErrors = (data) => {
  if (Array.isArray(data?.errors)) {
    return data.errors;
  }

  if (Array.isArray(data?.error?.errors)) {
    return data.error.errors;
  }

  return [];
};

const getPixTransferErrorMessage = (err) => {
  const data = err?.response?.data;
  const status = err?.response?.status;
  const apiErrors = getApiErrors(data);
  const alreadyRequestedError = apiErrors.find((item) => item?.code === 'checkout.already.requested');

  if (status === 409 && alreadyRequestedError) {
    return 'Este Pix não pôde ser enviado porque já existe uma solicitação para o mesmo valor e destinatário.';
  }

  const firstApiError = apiErrors.find((item) => item?.description);

  return data?.message || firstApiError?.description || err?.message || 'Não foi possível enviar o Pix.';
};

function ResultRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

export default function TransferPixResultScreen({ navigation, route }) {
  const { pixKey, pixKeyType, recipient, amount, amountLabel, description, password } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transferResponse, setTransferResponse] = useState(null);
  const recipientData = useMemo(() => getRecipientData(recipient), [recipient]);
  const summary = useMemo(() => getSummaryPayload(transferResponse), [transferResponse]);
  const result = useMemo(() => getTransferResult(transferResponse), [transferResponse]);
  const fromData = summary.from || {};
  const toData = summary.to || {};
  const transferPixKey = recipientData.pixAddressKey || pixKey;
  const senderName = pickValue(fromData.name, result.from?.name, result.senderName);
  const senderProvider = pickValue(fromData.provider, result.from?.provider);
  const recipientName = pickValue(toData.ownerName, recipientData.name, result.ownerName, result.recipientName);
  const recipientBank = pickValue(toData.bank?.name, recipientData.bank, result.bank?.name, result.bankName);
  const sentValue = pickValue(summary.value, result.value, result.amount, amount);

  const sendTransfer = async () => {
    if (!password || !transferPixKey || !amount) {
      setError('Dados incompletos para enviar o Pix.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uuid = await SecureStore.getItemAsync(AUTH_UUID_KEY);

      if (!uuid) {
        throw new Error('Não encontramos o identificador da sessão. Faça login novamente.');
      }

      const response = await sendAccountProviderPixTransfer({
        password,
        uuid,
        pix_key: transferPixKey,
        pix_key_type: pixKeyType,
        value: Number(amount),
        description: description || undefined,
      });

      setTransferResponse(response);
    } catch (err) {
      setError(getPixTransferErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void sendTransfer();
  }, []);

  const handleBackToAccount = () => {
    navigation.navigate('DigitalAccountOverview');
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Resultado do Pix" subtitle="Envio da transferência" onBack={handleBackToAccount} />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>Enviando Pix...</Text>
          <Text style={styles.loadingSubtitle}>Aguarde enquanto confirmamos a operação.</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <View style={[styles.iconWrap, styles.errorIconWrap]}>
            <Feather name="alert-circle" size={34} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Não foi possível enviar</Text>
          <Text style={styles.subtitle}>{error}</Text>
          <AppButton title="Voltar para conta" onPress={handleBackToAccount} style={styles.actionButton} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconWrap}>
            <Feather name="check" size={34} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Pix enviado</Text>
          <Text style={styles.subtitle}>Confira os dados retornados da operação.</Text>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Valor</Text>
            <Text style={styles.amountValue}>
              {sentValue ? `R$ ${formatValue(Number(sentValue))}` : amountLabel || `R$ ${formatValue(amount)}`}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados do envio</Text>
            <ResultRow label="De" value={senderProvider ? `${senderName} - ${senderProvider}` : senderName} />
            <ResultRow label="Para" value={recipientBank ? `${recipientName} - ${recipientBank}` : recipientName} />
            <ResultRow label="Chave Pix" value={toData.pixAddressKey || result.pixAddressKey || result.pix_key || transferPixKey} />
            <ResultRow label="Descrição" value={result.description || description} />
          </View>

          <AppButton
            title="Voltar para conta"
            onPress={handleBackToAccount}
            style={styles.actionButton}
            left={<Feather name="arrow-left" size={16} color="#FFF" />}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginBottom: 18,
  },
  errorIconWrap: {
    backgroundColor: colors.danger,
  },
  loadingTitle: {
    color: colors.cardForeground,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
  },
  loadingSubtitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  amountCard: {
    alignItems: 'center',
    backgroundColor: '#E8F2FD',
    borderRadius: radius.lg,
    padding: 22,
    marginBottom: 16,
  },
  amountLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  amountValue: {
    color: colors.cardForeground,
    fontSize: 34,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  cardTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  resultLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    color: colors.cardForeground,
    fontSize: 15,
    fontWeight: '700',
  },
  actionButton: {
    marginTop: 16,
  },
  secondaryButton: {
    marginTop: 8,
  },
});
