import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getReviews } from '../services/modules/reputation.service';

export default function ReviewsListScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getReviews({ page: 1, limit: 20 });
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar avaliações');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const items = Array.isArray(data?.items) ? data.items : [];
  const sections = useMemo(() => {
    if (loading) return [{ title: 'Comentários recentes', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Comentários recentes', body: 'Não foi possível carregar as avaliações.' }];
    if (items.length === 0) return [{ title: 'Comentários recentes', body: 'Nenhuma avaliação encontrada.' }];
    return [{ title: 'Comentários recentes', items: items.map((r) => ({ label: r.client_name || '-', value: r.comment || `${r.rating || 0} estrelas` })) }];
  }, [error, items, loading]);

  return <ModuleTemplate navigation={navigation} title="Avaliações" subtitle="Feedbacks dos clientes" sections={sections} />;
}
