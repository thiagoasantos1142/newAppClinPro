import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getServiceHistory } from '../services/modules/services.service';

moment.locale('pt-br');

export default function ServiceHistoryScreen({ navigation }) {
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
          const month = moment().format('YYYY-MM');
          const response = await getServiceHistory({ month, page: 1, limit: 20 });
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar histórico');
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

  const sections = useMemo(() => {
    if (loading) return [{ title: 'Histórico', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Histórico', body: 'Não foi possível carregar o histórico.' }];

    const groups = Array.isArray(data?.groups) ? data.groups : [];
    if (groups.length === 0) {
      return [{ title: 'Histórico', body: 'Nenhum serviço finalizado encontrado.' }];
    }

    return groups.map((group) => ({
      title: group.title || 'Histórico',
      items: (Array.isArray(group.items) ? group.items : []).map((item) => ({
        label: item.label || '-',
        value: item.amount_label || '-',
      })),
    }));
  }, [data, error, loading]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Histórico de Serviços"
      subtitle="Últimos atendimentos finalizados"
      sections={sections}
    />
  );
}
