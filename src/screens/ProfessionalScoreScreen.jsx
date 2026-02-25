import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getProfessionalScore } from '../services/modules/reputation.service';

export default function ProfessionalScoreScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getProfessionalScore();
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar score profissional');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const hero = useMemo(() => {
    if (loading) return { title: 'Score atual', value: '...' };
    if (error) return { title: 'Score atual', value: '--', note: error };
    return { title: 'Score atual', value: String(data?.score ?? '-'), progress: Number(data?.progress_percent || 0), note: data?.level_label || '' };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Próximos critérios', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Próximos critérios', body: 'Não foi possível carregar os critérios.' }];
    const criteria = Array.isArray(data?.next_criteria) ? data.next_criteria : [];
    if (criteria.length === 0) return [{ title: 'Próximos critérios', body: 'Nenhum critério disponível.' }];
    return [{ title: 'Próximos critérios', items: criteria.map((c) => ({ label: c.label || '-', value: c.reward_points != null ? `+${c.reward_points} pts` : '-' })) }];
  }, [data, error, loading]);

  return <ModuleTemplate navigation={navigation} title="Score Profissional" subtitle="Como evoluir seu nível" hero={hero} sections={sections} />;
}
