import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppCard, Badge } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import {
  getAccountProviderFinancialTransactions,
  getFinanceTransactionById,
} from '../services/modules/finance.service';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

const PAGE_SIZE = 10;

function formatDateToApi(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultDateRange() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    startDate: formatDateToApi(monthStart),
    finishDate: formatDateToApi(today),
  };
}

function formatTransactionDateLabel(value) {
  if (!value) return '-';

  const normalized = String(value).trim().replace(' ', 'T');
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  return `R$ ${Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeTransactionStatus(value = '') {
  const normalized = String(value || '').trim().toUpperCase();

  if (['RECEIVED', 'CONFIRMED', 'DONE', 'SUCCESS', 'COMPLETED'].includes(normalized)) {
    return 'Recebido';
  }

  if (['PENDING', 'AWAITING', 'PROCESSING', 'IN_PROGRESS'].includes(normalized)) {
    return 'Processando';
  }

  if (['FAILED', 'ERROR', 'CANCELED', 'CANCELLED', 'REFUNDED'].includes(normalized)) {
    return 'Nao concluido';
  }

  return value || 'Processando';
}

function normalizeTransactionDirection(item) {
  const type = String(item?.type || item?.transactionType || item?.operationType || '').trim().toUpperCase();
  const status = String(item?.status || '').trim().toUpperCase();
  const amount = Number(item?.value ?? item?.amount ?? item?.netValue ?? item?.net_value ?? 0);

  if (['DEBIT', 'OUT', 'OUTFLOW', 'TRANSFER_OUT', 'PAYMENT', 'CASH_OUT'].includes(type)) {
    return 'out';
  }

  if (['CREDIT', 'IN', 'INFLOW', 'TRANSFER_IN', 'RECEIPT', 'CASH_IN'].includes(type)) {
    return 'in';
  }

  if (['RECEIVED', 'CONFIRMED', 'DONE', 'SUCCESS', 'COMPLETED'].includes(status)) {
    return 'in';
  }

  return amount < 0 ? 'out' : 'in';
}

function mapTransactionsResponse(response) {
  const source =
    response?.data?.data ||
    response?.data?.financialTransactions ||
    response?.data?.financial_transactions ||
    response?.financialTransactions ||
    response?.financial_transactions ||
    response?.data ||
    response;

  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item, index) => ({
    id: String(item?.id || item?.externalId || item?.transactionId || `financial-transaction-${index}`),
    title:
      item?.customerName ||
      item?.clientName ||
      item?.client_name ||
      item?.name ||
      item?.description ||
      'Transacao',
    subtitle:
      item?.description ||
      item?.title ||
      item?.transactionType ||
      item?.type ||
      'Movimentacao financeira',
    amount: Math.abs(
      Number(item?.value ?? item?.amount ?? item?.netValue ?? item?.net_value ?? 0) || 0
    ),
    status: normalizeTransactionStatus(item?.status),
    direction: normalizeTransactionDirection(item),
    date: formatTransactionDateLabel(item?.dateCreated || item?.createdAt || item?.date),
    raw: item,
  }));
}

function TransactionHistoryListScreen({ navigation }) {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedRange, setSelectedRange] = useState('month');
  const [filters, setFilters] = useState({
    startDate: defaultRange.startDate,
    finishDate: defaultRange.finishDate,
    order: 'desc',
  });

  const loadTransactions = useCallback(async (options = {}) => {
    const { append = false, nextOffset = 0, isRefresh = false } = options;

    if (append) {
      setLoadingMore(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      if (!append) {
        setError(null);
      }

      const response = await getAccountProviderFinancialTransactions({
        startDate: filters.startDate,
        finishDate: filters.finishDate,
        limit: PAGE_SIZE,
        offset: nextOffset,
        order: filters.order,
      });

      const mappedItems = mapTransactionsResponse(response);
      const nextHasMore =
        Boolean(response?.data?.hasMore ?? response?.hasMore) ||
        mappedItems.length === PAGE_SIZE;

      setItems((current) => (append ? [...current, ...mappedItems] : mappedItems));
      setOffset(nextOffset + mappedItems.length);
      setHasMore(nextHasMore && mappedItems.length > 0);
    } catch (err) {
      if (!append) {
        setItems([]);
      }
      setError(err?.response?.data?.message || err?.message || 'Nao foi possivel carregar o extrato.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [filters.finishDate, filters.order, filters.startDate]);

  useFocusEffect(
    useCallback(() => {
      void loadTransactions({ append: false, nextOffset: 0 });
    }, [loadTransactions])
  );

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore || error) {
      return;
    }

    void loadTransactions({ append: true, nextOffset: offset });
  }, [error, hasMore, loadTransactions, loading, loadingMore, offset, refreshing]);

  const renderItem = useCallback(({ item }) => {
    const isOutgoing = item.direction === 'out';
    const isReceived = item.status === 'Recebido';

    return (
      <AppCard style={styles.transactionCard}>
        <View style={styles.transactionTopRow}>
          <View style={styles.transactionInfo}>
            <View style={styles.transactionTitleRow}>
              <View style={[styles.transactionDirectionIcon, isOutgoing ? styles.transactionOutIcon : styles.transactionInIcon]}>
                <Feather
                  name={isOutgoing ? 'arrow-up-right' : 'arrow-down-left'}
                  size={14}
                  color={isOutgoing ? '#B42318' : '#027A48'}
                />
              </View>
              <Text style={styles.transactionTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.transactionSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>

          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, isOutgoing ? styles.transactionAmountOut : styles.transactionAmountIn]}>
              {isOutgoing ? '- ' : '+ '}
              {formatCurrency(item.amount)}
            </Text>
            <Badge text={item.status} tone={isReceived ? 'success' : 'default'} />
          </View>
        </View>
      </AppCard>
    );
  }, []);

  const footer = useMemo(() => {
    if (!loadingMore) {
      return <View style={{ height: 20 }} />;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Carregando mais transações...</Text>
      </View>
    );
  }, [loadingMore]);

  const applyQuickRange = useCallback((rangeKey) => {
    const today = new Date();
    let nextStart = new Date(today.getFullYear(), today.getMonth(), 1);

    if (rangeKey === '7d') {
      nextStart = new Date(today);
      nextStart.setDate(today.getDate() - 7);
    }

    if (rangeKey === '30d') {
      nextStart = new Date(today);
      nextStart.setDate(today.getDate() - 30);
    }

    setSelectedRange(rangeKey);
    setFilters((current) => ({
      ...current,
      startDate: formatDateToApi(nextStart),
      finishDate: formatDateToApi(today),
    }));
  }, []);

  const toggleOrder = useCallback(() => {
    setFilters((current) => ({
      ...current,
      order: current.order === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Ver extrato"
        subtitle="Entradas e saídas da conta digital"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stateText}>Carregando extrato...</Text>
        </View>
      ) : error ? (
        <View style={styles.content}>
          <View style={styles.filtersWrap}>
            <View style={styles.filterRow}>
              <Pressable onPress={() => applyQuickRange('month')} style={[styles.filterChip, selectedRange === 'month' && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, selectedRange === 'month' && styles.filterChipTextActive]}>Mes atual</Text>
              </Pressable>
              <Pressable onPress={() => applyQuickRange('7d')} style={[styles.filterChip, selectedRange === '7d' && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, selectedRange === '7d' && styles.filterChipTextActive]}>7 dias</Text>
              </Pressable>
              <Pressable onPress={() => applyQuickRange('30d')} style={[styles.filterChip, selectedRange === '30d' && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, selectedRange === '30d' && styles.filterChipTextActive]}>30 dias</Text>
              </Pressable>
            </View>
            <Pressable onPress={toggleOrder} style={styles.orderChip}>
              <Feather name={filters.order === 'desc' ? 'arrow-down' : 'arrow-up'} size={14} color={colors.primary} />
              <Text style={styles.orderChipText}>{filters.order === 'desc' ? 'Mais recentes' : 'Mais antigas'}</Text>
            </Pressable>
            <Text style={styles.filterSummary}>
              {filters.startDate} ate {filters.finishDate}
            </Text>
          </View>
          <AppCard>
            <Text style={styles.emptyTitle}>Nao foi possivel carregar o extrato</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
            <Pressable onPress={() => void loadTransactions({ append: false, nextOffset: 0 })} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </AppCard>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListHeaderComponent={
            <View style={styles.filtersWrap}>
              <View style={styles.filterRow}>
                <Pressable
                  onPress={() => applyQuickRange('month')}
                  style={[styles.filterChip, selectedRange === 'month' && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRange === 'month' && styles.filterChipTextActive,
                    ]}
                  >
                    Mes atual
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => applyQuickRange('7d')}
                  style={[styles.filterChip, selectedRange === '7d' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, selectedRange === '7d' && styles.filterChipTextActive]}>7 dias</Text>
                </Pressable>
                <Pressable
                  onPress={() => applyQuickRange('30d')}
                  style={[styles.filterChip, selectedRange === '30d' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, selectedRange === '30d' && styles.filterChipTextActive]}>30 dias</Text>
                </Pressable>
              </View>
              <View style={styles.filterMetaRow}>
                <Pressable onPress={toggleOrder} style={styles.orderChip}>
                  <Feather name={filters.order === 'desc' ? 'arrow-down' : 'arrow-up'} size={14} color={colors.primary} />
                  <Text style={styles.orderChipText}>{filters.order === 'desc' ? 'Mais recentes' : 'Mais antigas'}</Text>
                </Pressable>
                <Text style={styles.filterSummary}>
                  {filters.startDate} ate {filters.finishDate}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <AppCard>
              <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
              <Text style={styles.emptyDescription}>As movimentações da sua conta aparecerão aqui.</Text>
            </AppCard>
          }
          ListFooterComponent={footer}
          refreshing={refreshing}
          onRefresh={() => void loadTransactions({ append: false, nextOffset: 0, isRefresh: true })}
        />
      )}
    </View>
  );
}

function TransactionDetailScreen({ navigation, route }) {
  const transactionId = route?.params?.transactionId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadTransaction = async () => {
        if (!transactionId) {
          setError('Transação não informada');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const response = await getFinanceTransactionById(transactionId);
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar transação');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadTransaction();
      return () => {
        isActive = false;
      };
    }, [transactionId])
  );

  const transaction = data?.transaction || data || null;

  const sections = useMemo(() => {
    if (loading) {
      return [{ title: 'Detalhes', items: [{ label: 'Carregando...', value: '...' }] }];
    }
    if (error || !transaction) {
      return [{ title: 'Detalhes', body: 'Não foi possível carregar esta transação.' }];
    }

    return [
      {
        title: 'Detalhes',
        items: [
          { label: 'Título', value: transaction.title || '-' },
          { label: 'Valor', value: transaction.amount_label || String(transaction.amount ?? '-') },
          { label: 'Tipo', value: transaction.type || '-' },
          { label: 'Status', value: transaction.status || '-' },
          { label: 'Método', value: transaction.method || '-' },
          { label: 'Data', value: transaction.date || '-' },
          { label: 'ID', value: transaction.id || transactionId || '-' },
        ],
      },
    ];
  }, [error, loading, transaction, transactionId]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Detalhe da Transação"
      subtitle={loading ? 'Carregando...' : error || (transaction?.id ? `Transação ${transaction.id}` : 'Movimentação bancária')}
      sections={sections}
    />
  );
}

export default function TransactionHistoryScreen(props) {
  const transactionId = props?.route?.params?.transactionId;

  if (transactionId) {
    return <TransactionDetailScreen {...props} />;
  }

  return <TransactionHistoryListScreen {...props} />;
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  stateText: {
    color: colors.mutedForeground,
    fontSize: 14,
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
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  filtersWrap: {
    marginBottom: 12,
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterMetaRow: {
    gap: 8,
  },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipPassive: {
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: 'rgba(31,128,234,0.12)',
    borderColor: 'rgba(31,128,234,0.22)',
  },
  filterChipText: {
    color: colors.cardForeground,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  orderChip: {
    minHeight: 36,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterSummary: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
  transactionCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  transactionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDirectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInIcon: {
    backgroundColor: '#ECFDF3',
  },
  transactionOutIcon: {
    backgroundColor: '#FEF3F2',
  },
  transactionTitle: {
    flex: 1,
    flexShrink: 1,
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '800',
  },
  transactionSubtitle: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
  },
  transactionDate: {
    marginTop: 10,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 120,
    flexShrink: 0,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  transactionAmountIn: {
    color: '#15803D',
  },
  transactionAmountOut: {
    color: '#B42318',
  },
  footerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  footerText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
});
