import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { getProfile } from '../services/modules/profile.service';
import { colors } from '../theme/tokens';

/**
 * Hook para validar se o usuário é ClinPro.
 * Retorna { isClinPro, loading, error }
 */
export function useRequireClinPro() {
  const [isClinPro, setIsClinPro] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getProfile();
        if (mounted) {
          setIsClinPro(true);
        }
      } catch (err) {
        const data = err?.response?.data;
        let msg = 'Erro ao validar perfil.';
        if (data?.error === 'Usuário não é um profissional ClinPro') {
          msg = 'Acesso restrito: apenas profissionais ClinPro podem acessar esta área.';
        } else if (data?.message === 'Seu acesso à Clin Pro expirou. Assine para continuar.') {
          msg = 'Seu acesso ao ClinPro expirou. Assine para continuar.';
        }
        setIsClinPro(false);
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { isClinPro, loading, error };
}

/**
 * Componente para proteger telas apenas para ClinPro
 * Uso: <RequireClinPro><SuaTela /></RequireClinPro>
 */
export function RequireClinPro({ children }) {
  const { isClinPro, loading, error } = useRequireClinPro();
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (error) {
    // Se for erro de acesso expirado, mostrar botão para assinar
    const isExpired = error.includes('expirou');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: colors.danger, fontSize: 16, textAlign: 'center', marginBottom: isExpired ? 24 : 0 }}>{error}</Text>
        {isExpired && (
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 }}
            onPress={() => Linking.openURL('https://clin.com.br/clin-pro')}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Assinar ClinPro</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  if (!isClinPro) return null;
  return children;
}
