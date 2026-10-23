import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { createAccountTransfer, getAccountOverview } from '../services/modules/finance.service';
import { colors } from '../theme/tokens';
import AppHeader from '../components/AppHeader.jsx';
import AsaasBaasSeal from '../components/AsaasBaasSeal.jsx';
import { formatCurrencyInputBRL, parseCurrencyInputBRL } from '../utils/currency';

export default function TransferMoneyScreen({ navigation }) {
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState(() => formatCurrencyInputBRL(''));
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadBalance = async () => {
        setBalanceLoading(true);
        setBalanceError(null);
        try {
          const response = await getAccountOverview();
          if (!isActive) return;
          setBalance(response?.available_balance || null);
        } catch (err) {
          if (!isActive) return;
          setBalanceError(err?.response?.data?.message || err?.message || 'Não foi possível consultar o saldo.');
        } finally {
          if (isActive) setBalanceLoading(false);
        }
      };

      void loadBalance();
      return () => { isActive = false; };
    }, [])
  );

  const normalizedAmount = useMemo(() => parseCurrencyInputBRL(amount), [amount]);
  const availableAmount = Number(balance?.amount || 0);
  const amountIsValid = Number.isFinite(normalizedAmount) && normalizedAmount > 0;
  const pixKeyIsValid = pixKey.trim().length > 0;
  const exceedsAvailableBalance = !balanceLoading && !balanceError && amountIsValid && normalizedAmount > availableAmount;

  const onSubmit = async () => {
    if (!pixKeyIsValid) {
      Alert.alert('Chave PIX obrigatória', 'Informe a chave PIX de destino.');
      return;
    }
    if (!amountIsValid) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (exceedsAvailableBalance) {
      Alert.alert('Saldo insuficiente', 'O valor informado é maior que o saldo disponível.');
      return;
    }

    setSubmitting(true);
    try {
      await createAccountTransfer({ pix_key: pixKey.trim(), amount: normalizedAmount, description: description || undefined });
      Alert.alert('Sucesso', 'Transferência enviada.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível transferir.');
    } finally { setSubmitting(false); }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Transferir Dinheiro" subtitle="Envie valores para outra conta" navigation={navigation} showBack icon="send" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.balanceCard}>
          <View style={styles.balanceIcon}>
            <Feather name="dollar-sign" size={20} color={colors.primary} />
          </View>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Saldo disponível na conta Asaas</Text>
            {balanceLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.balanceLoading} />
            ) : balanceError ? (
              <Text style={styles.balanceError}>{balanceError}</Text>
            ) : (
              <Text style={styles.balanceValue}>{balance?.amount_label || 'R$ 0,00'}</Text>
            )}
          </View>
        </AppCard>
        <AppCard>
          <Text style={styles.label}>Chave PIX</Text>
          <TextInput
            value={pixKey}
            onChangeText={setPixKey}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
            placeholderTextColor={colors.mutedForeground}
          />
          <Text style={[styles.label, { marginTop: 10 }]}>Valor</Text>
          <TextInput
            value={amount}
            onChangeText={(value) => setAmount(formatCurrencyInputBRL(value))}
            style={[styles.input, exceedsAvailableBalance && styles.inputError]}
            keyboardType="number-pad"
          />
          {exceedsAvailableBalance && (
            <View style={styles.balanceWarning}>
              <Feather name="alert-circle" size={15} color={colors.danger} />
              <Text style={styles.balanceWarningText}>Saldo insuficiente para realizar esta transferência.</Text>
            </View>
          )}
          <Text style={[styles.label, { marginTop: 10 }]}>Descrição (opcional)</Text>
          <TextInput value={description} onChangeText={setDescription} style={styles.input} />
        </AppCard>
        <AppButton
          title={submitting ? 'Confirmando...' : 'Confirmar Transferência'}
          onPress={onSubmit}
          disabled={submitting || balanceLoading || Boolean(balanceError) || !amountIsValid || !pixKeyIsValid || exceedsAvailableBalance}
          left={<Feather name="check" size={16} color="#FFF" />}
        />
        <AsaasBaasSeal />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  balanceCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  balanceContent: { flex: 1 },
  balanceLabel: { color: colors.mutedForeground, fontSize: 12 },
  balanceValue: { color: colors.primary, fontSize: 24, fontWeight: '800', marginTop: 3 },
  balanceLoading: { alignSelf: 'flex-start', marginTop: 7 },
  balanceError: { color: colors.danger, fontSize: 12, marginTop: 4 },
  balanceWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  balanceWarningText: { flex: 1, color: colors.danger, fontSize: 12, fontWeight: '600' },
  label: { color: colors.mutedForeground, fontSize: 12, marginBottom: 6 },
  input: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 12, color: colors.cardForeground },
  inputError: { borderColor: colors.danger },
});
