import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { AppCard } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';
import { colors } from '../theme/tokens';

export default function OnboardingKYCScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const [rgUploadId, setRgUploadId] = useState('');
  const [selfieUploadId, setSelfieUploadId] = useState('');

  useEffect(() => {
    if (!status) return;
    if (status.completed) {
      navigation.navigate('MainTabs');
      return;
    }
    if (!canAccessStep(status, 'kyc')) {
      navigation.navigate(getRouteForStep(status.current_step));
    }
  }, [status, navigation]);

  const documentUploadIds = useMemo(
    () => [rgUploadId.trim(), selfieUploadId.trim()].filter(Boolean),
    [rgUploadId, selfieUploadId]
  );

  const handleContinue = useCallback(async () => {
    try {
      if (loading || !status) {
        return;
      }
      if (status.current_step !== 'kyc') {
        navigation.navigate(getRouteForStep(status.current_step));
        return;
      }
      if (status?.steps?.kyc) {
        navigation.navigate('MainTabs');
        return;
      }
      const result = await completeStep('kyc', {
        document_upload_ids: documentUploadIds,
      });
      if (result.completed) {
        navigation.navigate('MainTabs');
        return;
      }
      navigation.navigate(getRouteForStep(result.current_step));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, loading, documentUploadIds]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Validação de Identidade"
      subtitle="Etapa KYC"
      sections={[{
        title: 'Documentos',
        items: [
          { label: 'RG/CNH', value: 'Obrigatório' },
          { label: 'Selfie', value: 'Obrigatório' },
        ],
      }]}
      children={
        <AppCard>
          <Text style={styles.title}>Uploads enviados</Text>
          <Text style={styles.helper}>
            Informe os IDs retornados pela rota de upload de documentos para concluir o KYC.
          </Text>

          <TextInput
            value={rgUploadId}
            onChangeText={setRgUploadId}
            placeholder="upload_id do documento (RG/CNH)"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            value={selfieUploadId}
            onChangeText={setSelfieUploadId}
            placeholder="upload_id da selfie"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />
        </AppCard>
      }
      actions={[{ label: 'Proximo', onPress: handleContinue, icon: 'arrow-right', disabled: loading || !status }]}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  helper: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.cardForeground,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
});
