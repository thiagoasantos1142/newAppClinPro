import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getAccountOverview } from '../services/modules/finance.service';

export default function DigitalAccountOverviewScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getAccountOverview();
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar conta digital');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const hero = useMemo(() => {
    if (loading) return { title: 'Saldo disponível', value: '...' };
    if (error) return { title: 'Saldo disponível', value: '--', note: error };
    return { title: 'Saldo disponível', value: data?.available_balance?.amount_label || '-' };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Resumo', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Resumo', body: 'Não foi possível carregar a conta.' }];
    return [{ title: 'Resumo', items: [
      { label: 'Recebimentos pendentes', value: data?.pending_receivables?.amount_label || '-' },
      { label: 'Transferências do mês', value: String(data?.month_transfers_count ?? '-') },
    ] }];
  }, [data, error, loading]);

  return <ModuleTemplate navigation={navigation} title="Conta Digital" subtitle="Visão geral da conta" hero={hero} sections={sections} actions={[
    { label: 'Histórico da Conta', route: 'TransactionHistory', icon: 'clock' },
    { label: 'Transferir', route: 'TransferMoney', variant: 'secondary', icon: 'send' },
  ]} />;
}
