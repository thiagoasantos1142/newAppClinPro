import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getWorkloadOverview } from '../services/modules/schedule.service';

moment.locale('pt-br');

function getTodayIsoDate() {
  return moment().format('YYYY-MM-DD');
}

export default function WorkloadOverviewScreen({ navigation, route }) {
  const period = route?.params?.period || 'week';
  const referenceDate = route?.params?.reference_date || getTodayIsoDate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadOverview = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getWorkloadOverview({ period, reference_date: referenceDate });
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar carga de trabalho');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadOverview();

      return () => {
        isActive = false;
      };
    }, [period, referenceDate])
  );

  const subtitle = useMemo(() => {
    const periodLabel = period === 'month' ? 'mensal' : 'semanal';
    return `Produtividade ${periodLabel} • ref. ${moment(referenceDate).format('DD/MM/YYYY')}`;
  }, [period, referenceDate]);

  const hero = useMemo(() => {
    if (loading) {
      return { title: 'Taxa de ocupação', value: '...', note: 'Carregando indicadores...' };
    }

    if (error) {
      return { title: 'Taxa de ocupação', value: '--', note: error };
    }

    return {
      title: 'Taxa de ocupação',
      value: `${Number(data?.occupancy_percent || 0)}%`,
      progress: Number(data?.occupancy_percent || 0),
    };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) {
      return [{ title: 'Indicadores', items: [{ label: 'Carregando...', value: '...' }] }];
    }

    if (error) {
      return [{ title: 'Indicadores', body: 'Não foi possível carregar os indicadores.' }];
    }

    return [
      {
        title: 'Indicadores',
        items: [
          { label: 'Horas trabalhadas', value: data?.indicators?.hours_worked_label || '-' },
          { label: 'Serviços concluídos', value: String(data?.indicators?.completed_services ?? '-') },
          { label: 'Tempo médio por serviço', value: data?.indicators?.avg_service_duration_label || '-' },
        ],
      },
    ];
  }, [data, error, loading]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Carga de Trabalho"
      subtitle={subtitle}
      hero={hero}
      sections={sections}
    />
  );
}
