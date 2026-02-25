import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getFinanceTransactions } from '../services/modules/finance.service';

export default function TransactionsListScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getFinanceTransactions({ page: 1, limit: 20 });
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar transações');
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => { isActive = false; };
  }, []));

  const items = Array.isArray(data?.items) ? data.items : [];
  const sections = useMemo(() => {
    if (loading) return [{ title: 'Últimas movimentações', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Últimas movimentações', body: 'Não foi possível carregar as transações.' }];
    if (items.length === 0) return [{ title: 'Últimas movimentações', body: 'Nenhuma transação encontrada.' }];
    return [{ title: 'Últimas movimentações', items: items.map((t) => ({ label: `${t.date || '-'} - ${t.title || '-'}`, value: t.amount_label || '-' })) }];
  }, [error, items, loading]);

  return (
    <ModuleTemplate navigation={navigation} title="Lista de Transações" subtitle="Entradas e saídas recentes" sections={sections} actions={[
      { label: 'Ver detalhe da transação', route: 'TransactionHistory', params: { transactionId: items[0]?.id }, icon: 'file-text', disabled: !items[0]?.id },
      { label: 'Abrir Detalhe de Pagamento', route: 'PaymentDetail', params: { paymentId: items[0]?.id }, icon: 'credit-card', disabled: !items[0]?.id },
    ]} />
  );
}
