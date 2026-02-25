import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getReputationOverview } from '../services/modules/reputation.service';

export default function ReputationOverviewScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getReputationOverview();
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar reputação');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const hero = useMemo(() => {
    if (loading) return { title: 'Nota geral', value: '...' };
    if (error) return { title: 'Nota geral', value: '--', note: error };
    return {
      title: 'Nota geral',
      value: data?.overall_rating_label || (data?.overall_rating != null ? `${data.overall_rating} / 5` : '-'),
      progress: Number(data?.progress_percent || 0),
    };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Indicadores', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Indicadores', body: 'Não foi possível carregar os indicadores.' }];
    return [{ title: 'Indicadores', items: [
      { label: 'Pontualidade', value: `${data?.indicators?.punctuality_percent ?? 0}%` },
      { label: 'Qualidade', value: `${data?.indicators?.quality_percent ?? 0}%` },
      { label: 'Recorrência', value: `${data?.indicators?.recurrence_percent ?? 0}%` },
    ] }];
  }, [data, error, loading]);

  return <ModuleTemplate navigation={navigation} title="Reputação" subtitle="Sua performance profissional" hero={hero} sections={sections} actions={[
    { label: 'Ver Avaliações', route: 'ReviewsList', icon: 'message-circle' },
    { label: 'Status de Verificação', route: 'VerificationStatus', variant: 'secondary', icon: 'shield' },
  ]} />;
}
