export function buildOnboardingQuestionsPayload(raw = {}) {
  const clients = raw?.clients;
  const experience = raw?.experience;
  const goal = raw?.goal;
  const mei = raw?.mei;

  const workAreas = ['Residencial'];
  if (clients === 'varios' || clients === 'alguns') {
    workAreas.push('Comercial');
  }

  const availabilityByExperience = {
    iniciante: {
      availability_label: 'Disponibilidade variável',
      availability_days: [],
    },
    'menos-1-ano': {
      availability_label: '3 a 4 dias',
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday'],
    },
    '1-3-anos': {
      availability_label: '5 dias por semana',
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    'mais-3-anos': {
      availability_label: '5 dias por semana',
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
  };

  const baseAvailability = availabilityByExperience[experience] || {
    availability_label: 'Disponibilidade variável',
    availability_days: [],
  };

  const extras = [];
  if (goal) extras.push(`meta:${goal}`);
  if (mei) extras.push(`mei:${mei}`);

  return {
    work_areas: [...new Set([...workAreas, ...extras])],
    availability_label: baseAvailability.availability_label,
    availability_days: baseAvailability.availability_days,
  };
}
