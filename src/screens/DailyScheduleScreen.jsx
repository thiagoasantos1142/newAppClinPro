import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getDailySchedule } from '../services/modules/schedule.service';

moment.locale('pt-br');

function getTodayIsoDate() {
  return moment().format('YYYY-MM-DD');
}

function formatPtBrDate(value, pattern = 'DD/MM/YYYY') {
  if (!value) return '-';
  const m = moment(value);
  if (!m.isValid()) return value;
  return m.format(pattern);
}

export default function DailyScheduleScreen({ navigation, route }) {
  const requestedDate = route?.params?.date || getTodayIsoDate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDailySchedule = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getDailySchedule({ date: requestedDate });
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar agenda do dia');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadDailySchedule();

      return () => {
        isActive = false;
      };
    }, [requestedDate])
  );

  const sections = useMemo(() => {
    if (loading) {
      return [{ title: 'Compromissos', items: [{ label: 'Carregando...', value: '...' }] }];
    }

    if (error) {
      return [{ title: 'Compromissos', body: 'Não foi possível carregar os compromissos do dia.' }];
    }

    const appointments = Array.isArray(data?.appointments) ? data.appointments : [];

    if (appointments.length === 0) {
      return [{ title: 'Compromissos', body: 'Nenhum compromisso para este dia.' }];
    }

    return [
      {
        title: 'Compromissos',
        items: appointments.map((item) => ({
          label: item.time_label || '-',
          value: item.title || item.type || '-',
        })),
      },
    ];
  }, [data, error, loading]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Agenda do Dia"
      subtitle={`Data: ${formatPtBrDate(data?.date || requestedDate)}`}
      sections={sections}
      actions={[
        { label: 'Ver Carga de Trabalho', route: 'WorkloadOverview', icon: 'bar-chart-2' },
      ]}
    />
  );
}
