import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton } from '../components/ui.jsx';
import { getAccountProviderBalance } from '../services/modules/finance.service';
import {
  selectDigitalAccountProviderBalance,
  setDigitalAccountProviderBalance,
} from '../store/digitalAccountSlice';
import { colors, radius, shadow } from '../theme/tokens';

const formatCurrencyInput = (value) => {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const amount = Number(digits) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrencyInput = (value) => {
  if (!value) {
    return 0;
  }

  return Number(String(value).replace(/\./g, '').replace(',', '.')) || 0;
};

const formatCurrency = (value) => `R$ ${Number(value || 0).toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const normalizeProviderBalance = (balanceResponse) => ({
  availableBalance: Number(
    balanceResponse?.availableBalance ??
      balanceResponse?.available_balance ??
      balanceResponse?.balance ??
      balanceResponse?.data?.availableBalance ??
      balanceResponse?.data?.available_balance ??
      balanceResponse?.data?.balance ??
      0
  ),
  pendingBalance: Number(
    balanceResponse?.pendingBalance ??
      balanceResponse?.pending_balance ??
      balanceResponse?.blockedBalance ??
      balanceResponse?.blocked_balance ??
      balanceResponse?.data?.pendingBalance ??
      balanceResponse?.data?.pending_balance ??
      balanceResponse?.data?.blockedBalance ??
      balanceResponse?.data?.blocked_balance ??
      0
  ),
  lastUpdate:
    balanceResponse?.lastUpdate ||
    balanceResponse?.updated_at ||
    balanceResponse?.data?.lastUpdate ||
    balanceResponse?.data?.updated_at ||
    'Atualizado agora',
});

export default function TransferAmountScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { pixKey, pixKeyType, recipient } = route?.params || {};
  const providerBalance = useSelector(selectDigitalAccountProviderBalance);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(!providerBalance?.loadedAt);
  const [balanceError, setBalanceError] = useState(null);

  const numericAmount = useMemo(() => parseCurrencyInput(amount), [amount]);
  const availableBalance = Number(providerBalance?.availableBalance ?? 0);
  const hasLoadedBalance = Boolean(providerBalance?.loadedAt);
  const isInsufficientBalance = hasLoadedBalance && numericAmount > availableBalance;
  const canContinue = numericAmount > 0 && hasLoadedBalance && !loadingBalance && !balanceError && !isInsufficientBalance;

  useEffect(() => {
    let isActive = true;

    if (providerBalance?.loadedAt) {
      setLoadingBalance(false);
      setBalanceError(null);
      return () => {
        isActive = false;
      };
    }

    const loadBalance = async () => {
      setLoadingBalance(true);
      setBalanceError(null);

      try {
        const response = await getAccountProviderBalance();
        if (!isActive) return;
        dispatch(setDigitalAccountProviderBalance(normalizeProviderBalance(response)));
      } catch (err) {
        if (!isActive) return;
        setBalanceError(err?.response?.data?.message || err?.message || 'Não foi possível carregar seu saldo.');
      } finally {
        if (isActive) {
          setLoadingBalance(false);
        }
      }
    };

    void loadBalance();

    return () => {
      isActive = false;
    };
  }, [dispatch, providerBalance?.loadedAt]);

  const handleAmountChange = (value) => {
    setAmount(formatCurrencyInput(value));
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Transferir Pix" subtitle="Informe valor e descrição" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressDotDone]}>
              <Feather name="check" size={11} color="#FFFFFF" />
            </View>
            <View style={[styles.progressLine, styles.progressLineDone]} />
            <View style={[styles.progressDot, styles.progressDotDone]}>
              <Feather name="check" size={11} color="#FFFFFF" />
            </View>
            <View style={[styles.progressLine, styles.progressLineDone]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Qual valor você quer enviar?</Text>
            <Text style={styles.subtitle}>Adicione uma descrição se quiser identificar essa transferência depois.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>Saldo disponível</Text>
              <View style={styles.balanceValueRow}>
                <Text style={styles.balanceValue}>
                  {hasLoadedBalance ? formatCurrency(availableBalance) : 'Carregando...'}
                </Text>
                {loadingBalance ? <ActivityIndicator size="small" color={colors.primary} /> : null}
              </View>
            </View>

            <Text style={styles.label}>Valor</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                style={styles.amountInput}
                placeholder="0,00"
                placeholderTextColor="rgba(26,62,112,0.38)"
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            {isInsufficientBalance ? (
              <Text style={styles.fieldErrorText}>
                O valor não pode ser maior que seu saldo disponível.
              </Text>
            ) : null}
            {balanceError ? (
              <Text style={styles.fieldErrorText}>{balanceError}</Text>
            ) : null}

            <Text style={[styles.label, styles.descriptionLabel]}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={styles.descriptionInput}
              placeholder="Opcional"
              placeholderTextColor="rgba(26,62,112,0.38)"
              maxLength={80}
              returnKeyType="done"
            />

            <AppButton
              title="Continuar"
              onPress={() => navigation.navigate('TransferCheckout', {
                pixKey,
                pixKeyType,
                recipient,
                amount: numericAmount,
                amountLabel: `R$ ${amount}`,
                description: description.trim(),
              })}
              disabled={!canContinue}
              style={styles.continueButton}
              left={<Feather name="arrow-right" size={16} color="#FFF" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8E4F2',
  },
  progressDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  progressDotDone: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    width: 42,
    height: 2,
    backgroundColor: '#D8E4F2',
    marginHorizontal: 6,
  },
  progressLineDone: {
    backgroundColor: colors.primary,
  },
  hero: {
    marginBottom: 24,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  label: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  balanceBox: {
    backgroundColor: '#E8F2FD',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceValueRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  balanceValue: {
    color: colors.cardForeground,
    fontSize: 18,
    fontWeight: '800',
  },
  amountInputWrap: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  currencyPrefix: {
    color: colors.mutedForeground,
    fontSize: 20,
    fontWeight: '800',
  },
  amountInput: {
    flex: 1,
    minHeight: 66,
    color: colors.cardForeground,
    fontSize: 30,
    fontWeight: '800',
  },
  descriptionLabel: {
    marginTop: 16,
  },
  fieldErrorText: {
    marginTop: 8,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: colors.cardForeground,
    fontSize: 15,
  },
  continueButton: {
    marginTop: 16,
  },
});
