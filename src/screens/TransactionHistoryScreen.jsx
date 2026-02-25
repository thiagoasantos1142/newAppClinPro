import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getFinanceTransactionById } from '../services/modules/finance.service';

export default function TransactionHistoryScreen({ navigation, route }) {
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
