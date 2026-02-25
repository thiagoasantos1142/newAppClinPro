import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getMeiSummary } from '../services/modules/finance.service';

moment.locale('pt-br');

export default function MEIControlScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getMeiSummary({ competence: moment().format('YYYY-MM') });
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar MEI');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Competência atual', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Competência atual', body: 'Não foi possível carregar os dados MEI.' }];
    return [{ title: `Competência ${data?.competence || '-'}`, items: [
      { label: 'DAS mensal', value: data?.das_amount_label || '-' },
      { label: 'Vencimento', value: data?.due_date_label || data?.due_date || '-' },
      { label: 'Situação', value: data?.status_label || data?.status || '-' },
    ] }];
  }, [data, error, loading]);

  return <ModuleTemplate navigation={navigation} title="Controle MEI" subtitle="Obrigações e emissão fiscal" sections={sections} />;
}
