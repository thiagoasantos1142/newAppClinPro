import React, { useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton } from '../components/ui.jsx';
import { validatePagClinPassword } from '../services/modules/finance.service';
import { colors, radius, shadow } from '../theme/tokens';

const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
const PIN_LENGTH = 6;

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
    document: pickValue(payload.cpfCnpj, payload.document, payload.cpf_cnpj),
    bank: pickValue(payload.bank?.name, payload.bank_name, payload.bank),
    pixAddressKey: pickValue(payload.pixAddressKey, payload.pix_key, payload.key),
  };
};

function SummaryRow({ label, value, strong = false }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryValueStrong]}>{value}</Text>
    </View>
  );
}

export default function TransferCheckoutScreen({ navigation, route }) {
  const { pixKey, pixKeyType, recipient, amount, amountLabel, description } = route?.params || {};
  const [submitting, setSubmitting] = useState(false);
  const [passwordDigits, setPasswordDigits] = useState(Array(PIN_LENGTH).fill(''));
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const passwordInputRefs = useRef({});
  const recipientData = useMemo(() => getRecipientData(recipient), [recipient]);
  const transferPixKey = recipientData.pixAddressKey || pixKey;
  const password = passwordDigits.join('');
  const canSubmit = password.length === 6 && !submitting;

  const focusPasswordInput = (index) => {
    passwordInputRefs.current[`password-${index}`]?.focus();
  };

  const handlePasswordChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length === PIN_LENGTH) {
      const digits = value.slice(0, PIN_LENGTH).split('');
      setPasswordDigits(digits);
      focusPasswordInput(PIN_LENGTH - 1);
      return;
    }

    const nextDigits = [...passwordDigits];
    nextDigits[index] = value.slice(-1);
    setPasswordDigits(nextDigits);

    if (value && index < PIN_LENGTH - 1) {
      focusPasswordInput(index + 1);
    }
  };

  const handlePasswordKeyPress = (index, event) => {
    if (event.nativeEvent.key === 'Backspace' && !passwordDigits[index] && index > 0) {
      focusPasswordInput(index - 1);
    }
  };

  const clearPassword = () => {
    setPasswordDigits(Array(PIN_LENGTH).fill(''));
  };

  const handleSubmit = async () => {
    if (!transferPixKey || !amount) {
      Alert.alert('Dados incompletos', 'Volte e confira os dados da transferência.');
      return;
    }

    if (password.length !== 6) {
      setPasswordModalVisible(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await validatePagClinPassword({
        password,
      });

      if (response?.success !== true) {
        Alert.alert('Senha incorreta', response?.message || 'Confira a senha e tente novamente.');
        return;
      }

      setPasswordModalVisible(false);
      clearPassword();
      navigation.navigate('TransferPixResult', {
        pixKey: transferPixKey,
        pixKeyType,
        recipient,
        amount,
        amountLabel,
        description,
        password,
      });
    } catch (err) {
      Alert.alert(
        'Não foi possível validar',
        err?.response?.data?.message || err?.message || 'Confira a senha e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent
        visible={passwordModalVisible}
        animationType="fade"
        onRequestClose={() => {
          if (!submitting) {
            setPasswordModalVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView
          style={styles.passwordOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.passwordBackdrop} />
          <View style={styles.passwordModalCard}>
            <View style={styles.passwordIconWrap}>
              <Feather name="shield" size={22} color={colors.primary} />
            </View>
            <Text style={styles.passwordTitle}>Confirmar envio</Text>
            <Text style={styles.passwordSubtitle}>Digite sua senha de 6 dígitos para finalizar o Pix.</Text>

            <View style={styles.pinRow}>
              {passwordDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    passwordInputRefs.current[`password-${index}`] = el;
                  }}
                  value={digit}
                  onChangeText={(value) => handlePasswordChange(index, value)}
                  onKeyPress={(event) => handlePasswordKeyPress(index, event)}
                  style={[styles.pinInput, digit && styles.pinInputFilled]}
                  keyboardType="number-pad"
                  maxLength={1}
                  secureTextEntry
                  returnKeyType={index === PIN_LENGTH - 1 ? 'done' : 'next'}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <AppButton
              title={submitting ? 'Enviando...' : 'Confirmar'}
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={styles.passwordPrimaryButton}
              left={<Feather name="check" size={16} color="#FFF" />}
            />
            <AppButton
              title="Cancelar"
              variant="ghost"
              onPress={() => {
                setPasswordModalVisible(false);
                clearPassword();
              }}
              disabled={submitting}
              style={styles.passwordSecondaryButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppScreenHeader title="Transferir Pix" subtitle="Confira antes de finalizar" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotDone]}>
            <Feather name="check" size={11} color="#FFFFFF" />
          </View>
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDotDone]}>
            <Feather name="check" size={11} color="#FFFFFF" />
          </View>
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDotDone]}>
            <Feather name="check" size={11} color="#FFFFFF" />
          </View>
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Valor</Text>
          <Text style={styles.amountValue}>{amountLabel || `R$ ${Number(amount || 0).toFixed(2)}`}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo</Text>
          <SummaryRow label="Para" value={recipientData.name || 'Destinatário Pix'} strong />
          <SummaryRow label="Documento" value={recipientData.document} />
          <SummaryRow label="Banco" value={recipientData.bank} />
          <SummaryRow label="Chave Pix" value={transferPixKey} />
          <SummaryRow label="Tipo da chave" value={pixKeyType} />
          <SummaryRow label="Descrição" value={description} />
        </View>

        <AppButton
          title={submitting ? 'Enviando...' : 'Finalizar envio'}
          onPress={() => setPasswordModalVisible(true)}
          disabled={submitting}
          style={styles.submitButton}
          left={<Feather name="check" size={16} color="#FFF" />}
        />
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
  summaryRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: colors.cardForeground,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryValueStrong: {
    fontSize: 17,
    fontWeight: '900',
  },
  submitButton: {
    marginTop: 16,
  },
  passwordOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  passwordBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 30, 66, 0.55)',
  },
  passwordModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    elevation: 10,
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
  },
  passwordIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31,128,234,0.12)',
    marginBottom: 12,
  },
  passwordTitle: {
    color: colors.cardForeground,
    fontSize: 20,
    fontWeight: '800',
  },
  passwordSubtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pinInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
    textAlign: 'center',
    color: colors.cardForeground,
    fontSize: 20,
    fontWeight: '800',
  },
  pinInputFilled: {
    borderColor: colors.primary,
    backgroundColor: '#EEF6FF',
  },
  passwordPrimaryButton: {
    marginTop: 14,
    minHeight: 46,
  },
  passwordSecondaryButton: {
    marginTop: 8,
    minHeight: 44,
  },
});
