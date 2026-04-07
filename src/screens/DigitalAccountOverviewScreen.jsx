import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import HeaderActionButton from '../components/HeaderActionButton.jsx';
import { AppCard, Badge, ProgressBar } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';

function formatCurrency(value, hidden) {
  if (hidden) return 'R$ ••••••';
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DigitalAccountOverviewScreen({ navigation }) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const mockAccount = useMemo(
    () => ({
      availableBalance: 3250.8,
      pendingBalance: 450,
      lastUpdate: 'Atualizado ha 2 min',
      transactions: [
        {
          id: 'tx-1',
          client: 'Ana Silva',
          service: 'Limpeza completa',
          amount: 180,
          status: 'Recebido',
          date: 'Hoje, 14:30',
        },
        {
          id: 'tx-2',
          client: 'Carlos Mendes',
          service: 'Limpeza rapida',
          amount: 120,
          status: 'Pendente',
          date: 'Ontem, 10:15',
        },
        {
          id: 'tx-3',
          client: 'Mariana Costa',
          service: 'Limpeza pesada',
          amount: 250,
          status: 'Recebido',
          date: '19 fev, 16:45',
        },
      ],
    }),
    []
  );

  const quickActions = [
    {
      key: 'statement',
      title: 'Ver extrato',
      subtitle: 'Historico completo da conta',
      icon: <Feather name="file-text" size={22} color="#7C3AED" />,
      iconBg: '#F3E8FF',
      onPress: () => navigation.navigate('TransactionHistory'),
    },
    {
      key: 'details',
      title: 'Dados da conta',
      subtitle: 'Agencia, conta e status',
      icon: <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#15803D" />,
      iconBg: '#EAF8EF',
      onPress: () => navigation.navigate('AccountDetails'),
    },
  ];

  const featureCards = [
    {
      key: 'card',
      title: 'Cartao PagClin',
      subtitle: 'Use seu saldo para pagar',
      icon: <Feather name="credit-card" size={26} color="#FFFFFF" />,
      backgroundColor: '#7C3AED',
      onPress: () => navigation.navigate('AccountActivation'),
    },
    {
      key: 'bill',
      title: 'Pagar boleto',
      subtitle: 'Quite suas contas por aqui',
      icon: <Feather name="file-text" size={26} color="#FFFFFF" />,
      backgroundColor: '#EA6A1F',
      onPress: () => navigation.navigate('TransactionHistory'),
    },
  ];

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Conta Digital"
        subtitle="Movimente seu saldo e acompanhe seus recebimentos"
        onBack={() => navigation.goBack()}
        rightContent={
          <HeaderActionButton onPress={() => navigation.navigate('AccountDetails')} icon="settings" />
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceTitleWrap}>
              <View style={styles.balanceIconWrap}>
                <Feather name="credit-card" size={18} color={colors.primary} />
              </View>
              <Text style={styles.balanceTitle}>Saldo disponivel</Text>
            </View>

            <Pressable onPress={() => setBalanceVisible((value) => !value)} style={styles.eyeButton}>
              <Feather name={balanceVisible ? 'eye-off' : 'eye'} size={16} color={colors.cardForeground} />
            </Pressable>
          </View>

          <Text style={styles.balanceValue}>{formatCurrency(mockAccount.availableBalance, !balanceVisible)}</Text>

          <View style={styles.balanceMetaRow}>
            <Feather name="refresh-cw" size={12} color={colors.mutedForeground} />
            <Text style={styles.balanceMetaText}>{mockAccount.lastUpdate}</Text>
          </View>

          <View style={styles.pendingCard}>
            <View>
              <Text style={styles.pendingLabel}>Saldo pendente</Text>
              <Text style={styles.pendingValue}>{formatCurrency(mockAccount.pendingBalance, !balanceVisible)}</Text>
              <Text style={styles.pendingDescription}>Pagamentos aguardando confirmacao</Text>
            </View>
            <Text style={styles.pendingEmoji}>⏳</Text>
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]} onPress={() => navigation.navigate('TransferMoney')}>
          <Feather name="arrow-up-right" size={18} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Transferir</Text>
        </Pressable>

        <View style={styles.quickActionGrid}>
          {quickActions.map((item) => (
            <Pressable key={item.key} style={({ pressed }) => [styles.quickActionCard, pressed && styles.quickActionPressed]} onPress={item.onPress}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: item.iconBg }]}>{item.icon}</View>
              <Text style={styles.quickActionTitle}>{item.title}</Text>
              <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {featureCards.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.featureCard, { backgroundColor: item.backgroundColor }, pressed && styles.featureCardPressed]}
            onPress={item.onPress}
          >
            <View style={styles.featureContent}>
              <View style={styles.featureIconWrap}>{item.icon}</View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Feather name="arrow-up-right" size={18} color="rgba(255,255,255,0.82)" />
          </Pressable>
        ))}

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Transacoes recentes</Text>
          <Pressable onPress={() => navigation.navigate('TransactionHistory')} style={styles.inlineAction}>
            <Text style={styles.inlineActionText}>Ver todas</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </Pressable>
        </View>

        {mockAccount.transactions.map((transaction) => {
          const isReceived = transaction.status === 'Recebido';

          return (
            <AppCard key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionTopRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionClient}>{transaction.client}</Text>
                  <Text style={styles.transactionService}>{transaction.service}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount, false)}</Text>
                  <Badge text={transaction.status} tone={isReceived ? 'success' : 'default'} />
                </View>
              </View>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </AppCard>
          );
        })}

        <View style={styles.securityCard}>
          <Text style={styles.securityEmoji}>🔒</Text>
          <View style={styles.securityTextWrap}>
            <Text style={styles.securityTitle}>Seus dados estao seguros</Text>
            <Text style={styles.securityDescription}>
              Usamos protecao e criptografia para manter seu dinheiro e suas informacoes protegidos.
            </Text>
            <ProgressBar value={100} style={styles.securityProgress} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  balanceTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceTitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValue: {
    color: colors.cardForeground,
    fontSize: 38,
    fontWeight: '800',
  },
  balanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  balanceMetaText: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  pendingCard: {
    marginTop: 20,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#CFE2FF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pendingLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  pendingValue: {
    color: '#1D4ED8',
    fontSize: 22,
    fontWeight: '800',
  },
  pendingDescription: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  pendingEmoji: {
    fontSize: 26,
  },
  primaryAction: {
    marginBottom: 12,
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionPressed: {
    opacity: 0.92,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  quickActionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  quickActionPressed: {
    opacity: 0.92,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  featureCard: {
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureCardPressed: {
    opacity: 0.94,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  featureIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  featureSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  transactionCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionClient: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  transactionService: {
    marginTop: 3,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionAmount: {
    color: '#15803D',
    fontSize: 18,
    fontWeight: '800',
  },
  transactionDate: {
    marginTop: 10,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  securityCard: {
    marginTop: 8,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#CFE2FF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  securityEmoji: {
    fontSize: 24,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  securityDescription: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
  securityProgress: {
    marginTop: 10,
    height: 6,
  },
});
