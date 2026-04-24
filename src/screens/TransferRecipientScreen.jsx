import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton } from '../components/ui.jsx';
import { colors, radius, shadow } from '../theme/tokens';

const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');

const getRecipientPayload = (recipient) => (
  recipient?.data?.pix ||
  recipient?.data?.recipient ||
  recipient?.data?.beneficiary ||
  recipient?.data?.owner ||
  recipient?.pix ||
  recipient?.data ||
  recipient?.recipient ||
  recipient?.beneficiary ||
  recipient?.owner ||
  recipient ||
  {}
);

const getRecipientData = (recipient) => {
  const payload = getRecipientPayload(recipient);

  return {
    name: pickValue(payload.ownerName, payload.name, payload.full_name, payload.owner_name, payload.recipient_name, payload.account_owner_name),
    document: pickValue(payload.cpfCnpj, payload.document, payload.cpf_cnpj, payload.tax_id, payload.cpf, payload.cnpj),
    bank: pickValue(payload.bank?.name, payload.bank_name, payload.bank, payload.institution_name, payload.institution, payload.ispb_name),
    bankCode: pickValue(payload.bank?.code, payload.bank_code),
    ispb: pickValue(payload.bank?.ispb, payload.ispb),
    pixAddressKey: pickValue(payload.pixAddressKey, payload.pix_key, payload.key),
    pixAddressKeyType: pickValue(payload.pixAddressKeyType, payload.pix_key_type, payload.key_type),
    operationType: pickValue(payload.operationType, payload.operation_type),
    agency: pickValue(payload.agency, payload.branch, payload.agencia),
    account: pickValue(payload.account, payload.account_number, payload.conta),
  };
};

function DetailRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const joinCompact = (...values) => values.filter(Boolean).join(' - ');

export default function TransferRecipientScreen({ navigation, route }) {
  const { pixKey, pixKeyType, recipient } = route?.params || {};
  const recipientData = getRecipientData(recipient);
  const pixKeyDetails = joinCompact(recipientData.pixAddressKey || pixKey, recipientData.pixAddressKeyType || pixKeyType);

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Transferir Pix" subtitle="Confira o destinatário" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotDone]}>
            <Feather name="check" size={11} color="#FFFFFF" />
          </View>
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
        </View>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Feather name="user" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>{recipientData.name || 'Destinatário encontrado'}</Text>
          {recipientData.bank ? <Text style={styles.subtitle}>{recipientData.bank}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados do Pix</Text>
          <DetailRow label="Chave" value={pixKeyDetails} />
          <DetailRow label="Documento" value={recipientData.document} />
          <DetailRow label="Banco" value={recipientData.bank} />
          <DetailRow label="Operação" value={recipientData.operationType} />
          <DetailRow label="Conta" value={joinCompact(recipientData.agency, recipientData.account)} />
        </View>

        <AppButton
          title="Continuar"
          onPress={() => navigation.navigate('TransferAmount', {
            pixKey,
            pixKeyType,
            recipient,
          })}
          style={styles.continueButton}
          left={<Feather name="arrow-right" size={16} color="#FFF" />}
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
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F2FD',
    marginBottom: 14,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
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
  detailRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  detailLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: colors.cardForeground,
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    marginTop: 16,
  },
});
