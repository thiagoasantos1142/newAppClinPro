import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getAccountDetails } from '../services/modules/finance.service';

export default function AccountDetailsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getAccountDetails();
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dados da conta');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Conta principal', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Conta principal', body: 'Não foi possível carregar os dados da conta.' }];
    return [{ title: 'Conta principal', items: [
      { label: 'Banco', value: data?.bank_name || '-' },
      { label: 'Agência', value: data?.branch || '-' },
      { label: 'Conta', value: data?.account_number || '-' },
      { label: 'Status', value: data?.account_status || '-' },
    ] }];
  }, [data, error, loading]);

  return <ModuleTemplate navigation={navigation} title="Dados da Conta" subtitle="Informações bancárias" sections={sections} actions={[{ label: 'Ativar Conta', route: 'AccountActivation', icon: 'check-circle' }]} />;
}
