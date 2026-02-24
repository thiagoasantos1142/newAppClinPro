import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { getVerificationStatus } from '../services/modules/reputation.service';

export default function VerificationStatusScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const response = await getVerificationStatus();
        if (!isActive) return;
        setData(response);
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || 'Erro ao carregar verificação');
      } finally { if (isActive) setLoading(false); }
    })();
    return () => { isActive = false; };
  }, []));

  const items = Array.isArray(data?.items) ? data.items : [];
  const sections = useMemo(() => {
    if (loading) return [{ title: 'Itens de verificação', items: [{ label: 'Carregando...', value: '...' }] }];
    if (error) return [{ title: 'Itens de verificação', body: 'Não foi possível carregar os itens de verificação.' }];
    if (items.length === 0) return [{ title: 'Itens de verificação', body: 'Nenhum item encontrado.' }];
    return [{ title: 'Itens de verificação', items: items.map((i) => ({ label: i.label || i.key || '-', value: i.status_label || i.status || '-' })) }];
  }, [error, items, loading]);

  return <ModuleTemplate navigation={navigation} title="Status de Verificação" subtitle="Confiabilidade do perfil" sections={sections} actions={[
    { label: 'Score Profissional', route: 'ProfessionalScore', icon: 'award' },
  ]} />;
}
