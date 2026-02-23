import React from 'react';
import ModuleTemplate from './shared/ModuleTemplate.jsx';

export default function WeeklyScheduleScreen({ navigation }) {
  return (
    <ModuleTemplate
      navigation={navigation}
      backRoute="MainTabs"
      title="Agenda Semanal"
      subtitle="Visão geral da sua semana"
      hero={{ title: 'Carga semanal', value: '32h', progress: 72, note: '5 dias com serviços agendados' }}
      sections={[
        {
          title: 'Semana atual',
          items: [
            { label: 'Segunda', value: '3 serviços' },
            { label: 'Terça', value: '2 serviços' },
            { label: 'Quarta', value: '4 serviços' },
            { label: 'Quinta', value: '2 serviços' },
            { label: 'Sexta', value: '1 serviço' },
          ],
        },
      ]}
      actions={[
        { label: 'Ver Agenda do Dia', route: 'DailySchedule', params: { date: '2026-02-19' }, icon: 'calendar' },
        { label: 'Bloquear Horário', route: 'BlockTime', variant: 'secondary', icon: 'slash' },
      ]}
    />
  );
}
