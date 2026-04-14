import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { AppCard } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { colors } from '../theme/tokens';

export default function OnboardingKYCScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();
  const [rgUploadId, setRgUploadId] = useState('');
  const [selfieUploadId, setSelfieUploadId] = useState('');

  const documentUploadIds = useMemo(
    () => [rgUploadId.trim(), selfieUploadId.trim()].filter(Boolean),
    [rgUploadId, selfieUploadId]
  );

  const handleContinue = useCallback(async () => {
    try {
      if (saving || !status) {
        return;
      }
      await completeStep('kyc', {
        document_upload_ids: documentUploadIds,
      });
      navigation.navigate('OnboardingFirstGoal');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [completeStep, navigation, status, saving, documentUploadIds]);

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
      actions={[{ label: 'Proximo', onPress: handleContinue, icon: 'arrow-right', disabled: saving || !status }]}
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
