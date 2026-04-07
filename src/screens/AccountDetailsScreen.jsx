import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppCard } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';

const mockAccount = {
  bankName: 'Clin Pay',
  bankCode: '403',
  agency: '0001',
  account: '123456-7',
  accountType: 'Conta Corrente',
  cpf: '123.456.789-00',
  pixKey: '123.456.789-00',
};

function buildAccountView(data) {
  return {
    bankName: data?.bank_name || data?.bankName || mockAccount.bankName,
    bankCode: data?.bank_code || data?.bankCode || mockAccount.bankCode,
    agency: data?.branch || data?.agency || mockAccount.agency,
    account: data?.account_number || data?.account || mockAccount.account,
    accountType: data?.account_type || data?.accountType || mockAccount.accountType,
    cpf: data?.document || data?.cpf || mockAccount.cpf,
    pixKey: data?.pix_key || data?.pixKey || data?.document || data?.cpf || mockAccount.pixKey,
  };
}

function CopyRow({ label, primary, secondary, onCopy, highlight = false }) {
  return (
    <AppCard style={[styles.infoCard, highlight && styles.infoCardHighlight]}>
      <View style={styles.infoRow}>
        <View style={styles.infoTextWrap}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoPrimary}>{primary}</Text>
          {!!secondary && <Text style={styles.infoSecondary}>{secondary}</Text>}
        </View>
        <Pressable onPress={onCopy} style={[styles.copyButton, highlight && styles.copyButtonHighlight]}>
          <Feather name="copy" size={18} color={highlight ? colors.primary : colors.cardForeground} />
        </Pressable>
      </View>
    </AppCard>
  );
}

export default function AccountDetailsScreen({ navigation }) {
  const account = useMemo(() => buildAccountView(mockAccount), []);

  const handleCopy = (label, value) => {
    Alert.alert('Copiar dado', `${label}: ${value}`);
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Dados da conta"
        subtitle="Informações bancárias"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Text style={styles.heroEmoji}>🏦</Text>
          </View>
          <Text style={styles.heroTitle}>{account.bankName}</Text>
          <Text style={styles.heroSubtitle}>Banco {account.bankCode}</Text>
        </View>

        <View style={styles.listBlock}>
          <CopyRow
            label="Banco"
            primary={account.bankName}
            secondary={`Código: ${account.bankCode}`}
            onCopy={() => handleCopy('Banco', `${account.bankName} - ${account.bankCode}`)}
          />
          <CopyRow
            label="Agência"
            primary={account.agency}
            onCopy={() => handleCopy('Agência', account.agency)}
          />
          <CopyRow
            label="Conta"
            primary={account.account}
            secondary={account.accountType}
            onCopy={() => handleCopy('Conta', account.account)}
          />
          <CopyRow
            label="CPF do titular"
            primary={account.cpf}
            onCopy={() => handleCopy('CPF do titular', account.cpf)}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrap}>
            <Text style={styles.sectionIcon}>⚡</Text>
          </View>
          <Text style={styles.sectionTitle}>Chave Pix</Text>
        </View>

        <CopyRow
          label="Chave CPF"
          primary={account.pixKey}
          onCopy={() => handleCopy('Chave Pix', account.pixKey)}
          highlight
        />

        <Pressable style={({ pressed }) => [styles.qrButton, pressed && styles.qrButtonPressed]}>
          <Feather name="grid" size={18} color={colors.primary} />
          <Text style={styles.qrButtonText}>Ver QR Code Pix</Text>
        </Pressable>

        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>Como usar estes dados</Text>
            <Text style={styles.tipBullet}>• Use os dados da conta para receber TED ou DOC.</Text>
            <Text style={styles.tipBullet}>• Use a chave Pix para receber pagamentos instantâneos.</Text>
            <Text style={styles.tipBullet}>• Toque no ícone de copiar para facilitar o compartilhamento.</Text>
          </View>
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityEmoji}>🔒</Text>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>Segurança</Text>
            <Text style={styles.securityText}>
              Nunca compartilhe sua senha ou código de acesso. O {account.bankName} não pede esses dados por ligação,
              mensagem ou e-mail.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 28 },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroEmoji: { fontSize: 34 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 4 },
  listBlock: { gap: 10, marginBottom: spacing.lg },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardHighlight: {
    borderWidth: 2,
    borderColor: 'rgba(31,128,234,0.25)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { color: colors.mutedForeground, fontSize: 12, marginBottom: 4 },
  infoPrimary: { color: colors.cardForeground, fontSize: 22, fontWeight: '800' },
  infoSecondary: { color: colors.mutedForeground, fontSize: 13, marginTop: 4 },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonHighlight: {
    backgroundColor: 'rgba(31,128,234,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { color: colors.cardForeground, fontSize: 16, fontWeight: '800' },
  qrButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: spacing.lg,
  },
  qrButtonPressed: { opacity: 0.92 },
  qrButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  tipCard: {
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#CFE2FF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  securityCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  tipEmoji: { fontSize: 24 },
  securityEmoji: { fontSize: 22 },
  tipTextWrap: { flex: 1 },
  tipTitle: { color: colors.cardForeground, fontSize: typography.fontSize.sm, fontWeight: '700', marginBottom: 6 },
  tipBullet: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18, marginBottom: 2 },
  securityText: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
});
