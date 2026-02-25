import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getMyServices } from '../services/modules/services.service';

export default function MyServicesScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getMyServices();
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar meus serviços');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      void load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const hero = useMemo(() => {
    if (loading) return { title: 'Serviços em andamento', value: '...' };
    if (error) return { title: 'Serviços em andamento', value: '--', note: error };
    return { title: 'Serviços em andamento', value: String(data?.in_progress_count ?? 0) };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Hoje', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Hoje', body: 'Não foi possível carregar os serviços.' }];

    const today = Array.isArray(data?.today) ? data.today : [];
    const upcoming = Array.isArray(data?.upcoming) ? data.upcoming : [];

    return [
      {
        title: 'Hoje',
        items: today.length > 0 ? today.map((item) => ({ label: item.time_label || '-', value: item.client_name || '-' })) : [{ label: 'Sem serviços', value: '-' }],
      },
      {
        title: 'Próximos',
        items: upcoming.length > 0 ? upcoming.map((item) => ({ label: item.date_label || '-', value: item.client_name || '-' })) : [{ label: 'Sem próximos serviços', value: '-' }],
      },
    ];
  }, [data, error, loading]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Meus Serviços"
      subtitle="Acompanhe os serviços aceitos"
      hero={hero}
      sections={sections}
      actions={[
        { label: 'Ver Histórico', route: 'ServiceHistory', icon: 'clock' },
      ]}
    />
  );
}
