import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getWeeklySchedule } from '../services/modules/schedule.service';

moment.locale('pt-br');

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekStartMonday(baseDate = new Date()) {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toIsoDate(d);
}

function formatPtBrDate(value, pattern = 'DD/MM/YYYY') {
  if (!value) return '-';
  const m = moment(value);
  if (!m.isValid()) return value;
  return m.format(pattern);
}

export default function WeeklyScheduleScreen({ navigation, route }) {
  const requestedWeekStart = route?.params?.week_start || getWeekStartMonday(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadWeeklySchedule = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getWeeklySchedule({ week_start: requestedWeekStart });
          if (!isActive) return;
          setData(response);
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar agenda semanal');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadWeeklySchedule();

      return () => {
        isActive = false;
      };
    }, [requestedWeekStart])
  );

  const hero = useMemo(() => {
    if (loading) {
      return { title: 'Carga semanal', value: '...', note: 'Carregando agenda semanal...' };
    }
    if (error) {
      return { title: 'Carga semanal', value: '--', note: error };
    }

    return {
      title: 'Carga semanal',
      value: data?.workload?.total_hours_label || '0h',
      progress: Number(data?.workload?.occupancy_percent || 0),
      note: data?.workload?.note || '',
    };
  }, [data, error, loading]);

  const sections = useMemo(() => {
    if (loading) {
      return [{ title: 'Semana atual', items: [{ label: 'Carregando...', value: '...' }] }];
    }

    if (error) {
      return [{ title: 'Semana atual', body: 'Não foi possível carregar os dias da semana.' }];
    }

    const days = Array.isArray(data?.days) ? data.days : [];

    return [
      {
        title: `Semana ${formatPtBrDate(data?.week_start || requestedWeekStart)}${
          data?.week_end ? ` até ${formatPtBrDate(data.week_end)}` : ''
        }`,
        items: days.map((day) => ({
          label: `${day.weekday_label || 'Dia'} (${formatPtBrDate(day.date)})`,
          value: day.services_count_label || `${day.services_count ?? 0} serviços`,
        })),
      },
    ];
  }, [data, error, loading, requestedWeekStart]);

  return (
    <ModuleTemplate
      navigation={navigation}
      backRoute="MainTabs"
      title="Agenda Semanal"
      subtitle={`Semana iniciando em ${formatPtBrDate(requestedWeekStart)}`}
      hero={hero}
      sections={sections}
      actions={[
        { label: 'Ver Agenda do Dia', route: 'DailySchedule', params: { date: requestedWeekStart }, icon: 'calendar' },
        { label: 'Bloquear Horário', route: 'BlockTime', variant: 'secondary', icon: 'slash' },
      ]}
    />
  );
}
