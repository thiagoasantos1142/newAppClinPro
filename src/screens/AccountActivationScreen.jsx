import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { activateAccount } from '../services/modules/finance.service';

export default function AccountActivationScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []));

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activateAccount({ confirm: true });
      setData(response);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao ativar conta');
    } finally {
      setLoading(false);
    }
  };

  const sections = useMemo(() => {
    if (error) return [{ title: 'Checklist', body: error }];
    const checklist = Array.isArray(data?.checklist) ? data.checklist : [];
    if (checklist.length === 0) return [{ title: 'Checklist', body: 'Toque em "Ativar Conta" para iniciar.' }];
    return [{ title: 'Checklist', items: checklist.map((item) => ({ label: item.label || '-', value: item.status || '-' })) }];
  }, [data, error]);

  return <ModuleTemplate navigation={navigation} title="Ativação de Conta" subtitle="Finalize seu cadastro bancário" sections={sections} actions={[
    { label: loading ? 'Ativando...' : 'Ativar Conta', onPress: handleActivate, icon: 'check', disabled: loading },
    { label: 'Voltar para Conta Digital', route: 'DigitalAccountOverview', variant: 'secondary', icon: 'arrow-left' },
  ]} />;
}
