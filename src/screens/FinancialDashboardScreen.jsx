import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppCard, Badge, ProgressBar } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { getFinanceDashboard } from '../services/modules/finance.service';

moment.locale('pt-br');

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function formatTrendLabel(data) {
  if (data?.month_balance?.goal_label) {
    return `Meta mensal: ${data.month_balance.goal_label}`;
  }

  return 'Acompanhe seus ganhos e seu ritmo no mês';
}

function getRecentTransactions(data) {
  if (Array.isArray(data?.recent_transactions)) return data.recent_transactions;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.recent_payments)) return data.recent_payments;
  return [];
}

export default function FinancialDashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        setLoading(true);
        setError(null);

        try {
          const month = moment().format('YYYY-MM');
          const response = await getFinanceDashboard({ month });
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar painel financeiro');
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const monthBalanceLabel = data?.month_balance?.amount_label || formatCurrency(data?.month_balance?.amount);
  const progress = Number(data?.month_balance?.progress_percent || 0);
  const summary = data?.summary || {};
  const recentTransactions = getRecentTransactions(data);

  const statCards = useMemo(() => {
    if (loading) {
      return [
        { key: 'revenue', label: 'Receitas', value: '...', icon: 'trending-up', tone: '#E8F3FF', iconColor: colors.primary },
        { key: 'expenses', label: 'Despesas', value: '...', icon: 'arrow-down-right', tone: '#FFF3E8', iconColor: '#D97706' },
        { key: 'net', label: 'Lucro líquido', value: '...', icon: 'dollar-sign', tone: '#EAF8EF', iconColor: '#15803D' },
      ];
    }

    return [
      { key: 'revenue', label: 'Receitas', value: formatCurrency(summary.revenue_amount), icon: 'trending-up', tone: '#E8F3FF', iconColor: colors.primary },
      { key: 'expenses', label: 'Despesas', value: formatCurrency(summary.expense_amount), icon: 'arrow-down-right', tone: '#FFF3E8', iconColor: '#D97706' },
      { key: 'net', label: 'Lucro líquido', value: formatCurrency(summary.net_amount), icon: 'dollar-sign', tone: '#EAF8EF', iconColor: '#15803D' },
    ];
  }, [loading, summary]);

  const quickLinks = useMemo(
    () => [
      {
        key: 'transactions',
        title: 'Historico de ganhos',
        description: 'Veja entradas, saidas e detalhes recentes',
        icon: 'dollar-sign',
        route: 'Transactions',
      },
      {
        key: 'mei',
        title: 'Controle MEI',
        description: 'Acompanhe seu limite anual e projeções',
        icon: 'bar-chart-2',
        route: 'MEIControl',
      },
      {
        key: 'payment',
        title: 'Ultimo pagamento',
        description: recentTransactions[0]?.title || 'Abra o pagamento mais recente quando existir',
        icon: 'file-text',
        route: 'PaymentDetail',
        params: { paymentId: recentTransactions[0]?.id },
        disabled: !recentTransactions[0]?.id,
      },
    ],
    [recentTransactions]
  );

  const transactionCards = useMemo(() => {
    if (loading) {
      return [{ id: 'loading-1', title: 'Carregando transacoes...', date: 'aguarde', amount_label: '...' }];
    }

    if (error) {
      return [];
    }

    return recentTransactions.slice(0, 3);
  }, [error, loading, recentTransactions]);

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Financeiro"
        subtitle="Acompanhe seus ganhos e cuide da sua operacao"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Ganhos do mes</Text>
              <Text style={styles.heroValue}>{loading ? '...' : error ? '--' : monthBalanceLabel || '-'}</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Feather name="trending-up" size={22} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.heroTrend}>{error ? error : formatTrendLabel(data)}</Text>
          {!error ? <ProgressBar value={progress} color="rgba(255,255,255,0.9)" style={styles.heroProgress} /> : null}
          {!error ? <Text style={styles.heroFootnote}>Progresso da meta do mes: {Math.round(progress)}%</Text> : null}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Resumo do mes</Text>
          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
              <AppCard key={stat.key} style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: stat.tone }]}>
                  <Feather name={stat.icon} size={18} color={stat.iconColor} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </AppCard>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Acesso rapido</Text>
          <View style={styles.linkList}>
            {quickLinks.map((link) => (
              <Pressable
                key={link.key}
                disabled={link.disabled}
                onPress={() => navigation.navigate(link.route, link.params || {})}
                style={({ pressed }) => [
                  styles.linkCard,
                  link.disabled && styles.linkCardDisabled,
                  pressed && !link.disabled && styles.linkCardPressed,
                ]}
              >
                <View style={styles.linkIconWrap}>
                  <Feather name={link.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <Text style={styles.linkDescription}>{link.description}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Transacoes recentes</Text>
            <Pressable onPress={() => navigation.navigate('Transactions')} style={styles.inlineAction}>
              <Text style={styles.inlineActionText}>Ver todas</Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </Pressable>
          </View>

          {error ? (
            <AppCard>
              <Text style={styles.emptyTitle}>Nao foi possivel carregar o resumo financeiro</Text>
              <Text style={styles.emptyDescription}>Tente novamente mais tarde para ver seus recebimentos e movimentacoes.</Text>
            </AppCard>
          ) : transactionCards.length === 0 ? (
            <AppCard>
              <Text style={styles.emptyTitle}>Nenhuma transacao recente</Text>
              <Text style={styles.emptyDescription}>Assim que seus pagamentos entrarem, eles vao aparecer aqui.</Text>
            </AppCard>
          ) : (
            transactionCards.map((transaction, index) => {
              const statusLabel = transaction.status_label || transaction.status || (loading ? 'Processando' : 'Recebido');
              const amountLabel = transaction.amount_label || formatCurrency(transaction.amount);
              const title = transaction.title || transaction.client_name || transaction.client || `Transacao ${index + 1}`;
              const dateLabel = transaction.date_label || transaction.date || transaction.created_at_label || '-';
              const isPaid = /pago|recebido|conclu/i.test(statusLabel);

              return (
                <AppCard key={transaction.id || `${title}-${index}`} style={styles.transactionCard}>
                  <View style={styles.transactionTopRow}>
                    <View style={styles.transactionTextWrap}>
                      <Text style={styles.transactionTitle}>{title}</Text>
                      <Text style={styles.transactionDate}>{dateLabel}</Text>
                    </View>
                    <Badge text={statusLabel} tone={isPaid ? 'success' : 'default'} />
                  </View>
                  <Text style={styles.transactionAmount}>{amountLabel || '-'}</Text>
                </AppCard>
              );
            })
          )}
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
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 22,
    marginBottom: spacing.lg,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 6,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroTrend: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
  },
  heroProgress: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroFootnote: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
  },
  sectionBlock: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '31.5%',
    minWidth: 96,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: colors.cardForeground,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  linkList: {
    gap: 10,
  },
  linkCard: {
    backgroundColor: '#FCFEFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  linkCardPressed: {
    opacity: 0.92,
  },
  linkCardDisabled: {
    opacity: 0.55,
  },
  linkIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTextWrap: {
    flex: 1,
  },
  linkTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  linkDescription: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
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
    marginBottom: 10,
  },
  transactionTextWrap: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  transactionDate: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  emptyDescription: {
    marginTop: 6,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
