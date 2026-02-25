import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getFinancePaymentById } from '../services/modules/finance.service';

export default function PaymentDetailScreen({ navigation, route }) {
  const paymentId = route?.params?.paymentId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      if (!paymentId) {
        setError('Pagamento não informado');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getFinancePaymentById(paymentId);
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar pagamento');
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => { isActive = false; };
  }, [paymentId]));

  const payment = data?.payment;
  const sections = useMemo(() => {
    if (loading) return [{ title: 'Informações', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error || !payment) return [{ title: 'Informações', body: 'Não foi possível carregar o pagamento.' }];
    return [{ title: 'Informações', items: [
      { label: 'Cliente', value: payment.client_name || '-' },
      { label: 'Valor', value: payment.amount_label || '-' },
      { label: 'Status', value: payment.status_label || payment.status || '-' },
      { label: 'Método', value: payment.method || '-' },
    ] }];
  }, [error, loading, payment]);

  return <ModuleTemplate navigation={navigation} title="Detalhe de Pagamento" subtitle={paymentId ? `Pagamento #${paymentId}` : 'Pagamento'} sections={sections} />;
}
