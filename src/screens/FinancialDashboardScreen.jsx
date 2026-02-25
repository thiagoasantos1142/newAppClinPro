import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getFinanceDashboard } from '../services/modules/finance.service';

moment.locale('pt-br');

export default function FinancialDashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
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
    return () => { isActive = false; };
  }, []));

  const hero = useMemo(() => {
    if (loading) return { title: 'Saldo do mês', value: '...' };
    if (error) return { title: 'Saldo do mês', value: '--', note: error };
    return {
      title: 'Saldo do mês',
      value: data?.month_balance?.amount_label || '-',
      progress: Number(data?.month_balance?.progress_percent || 0),
      note: data?.month_balance?.goal_label ? `Meta mensal: ${data.month_balance.goal_label}` : undefined,
    };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Resumo', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Resumo', body: 'Não foi possível carregar o resumo.' }];
    return [{ title: 'Resumo', items: [
      { label: 'Receitas', value: data?.summary?.revenue_amount != null ? `R$ ${Number(data.summary.revenue_amount).toFixed(2).replace('.', ',')}` : '-' },
      { label: 'Despesas', value: data?.summary?.expense_amount != null ? `R$ ${Number(data.summary.expense_amount).toFixed(2).replace('.', ',')}` : '-' },
      { label: 'Lucro líquido', value: data?.summary?.net_amount != null ? `R$ ${Number(data.summary.net_amount).toFixed(2).replace('.', ',')}` : '-' },
    ] }];
  }, [data, error, loading]);

  return (
    <ModuleTemplate navigation={navigation} title="Painel Financeiro" subtitle="Controle de ganhos e despesas" hero={hero} sections={sections} actions={[
      { label: 'Ver Transações', route: 'Transactions', icon: 'list' },
      { label: 'Controle MEI', route: 'MEIControl', variant: 'secondary', icon: 'file-text' },
    ]} />
  );
}
