import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import { canAccessStep, getRouteForStep } from '../navigation/onboardingStepMap';
import { colors } from '../theme/tokens';
import { pickAndUploadImage } from '../utils/imagePickerUpload';

export default function OnboardingKYCScreen({ navigation }) {
  const { status, completeStep, loading } = useOnboarding();
  const [documentType, setDocumentType] = useState('rg');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingField, setUploadingField] = useState('');

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

  const isFormValid = useMemo(() => {
    if (!documentNumber.trim()) return false;
    if (!frontUrl.trim()) return false;
    if (!backUrl.trim()) return false;
    if (!selfieUrl.trim()) return false;
    return true;
  }, [backUrl, documentNumber, frontUrl, selfieUrl]);

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
      if (!isFormValid) {
        Alert.alert('Campos obrigatorios', 'Preencha numero do documento e as URLs de frente, verso e selfie.');
        return;
      }

      const result = await completeStep('kyc', {
        document_type: documentType.trim().toLowerCase(),
        document_number: documentNumber.trim(),
        document_front_url: frontUrl.trim(),
        document_back_url: backUrl.trim(),
        selfie_url: selfieUrl.trim(),
        selfie_uploaded: true,
        proof_of_residence_url: proofUrl.trim(),
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
  }, [backUrl, completeStep, documentNumber, documentType, frontUrl, isFormValid, loading, navigation, proofUrl, selfieUrl, status]);

  const handleUpload = useCallback(async (field, source) => {
    const folderByField = {
      frontUrl: 'clinpro/kyc/front',
      backUrl: 'clinpro/kyc/back',
      selfieUrl: 'clinpro/kyc/selfie',
      proofUrl: 'clinpro/kyc/proof-of-residence',
    };

    const setters = {
      frontUrl: setFrontUrl,
      backUrl: setBackUrl,
      selfieUrl: setSelfieUrl,
      proofUrl: setProofUrl,
    };

    try {
      setUploadingField(field);
      const upload = await pickAndUploadImage({
        source,
        folder: folderByField[field],
        allowsEditing: field === 'selfieUrl',
      });

      if (upload?.url) {
        setters[field](upload.url);
      }
    } catch (err) {
      const message = err?.message || 'Nao foi possivel enviar a imagem.';
      Alert.alert('Erro', message);
    } finally {
      setUploadingField('');
    }
  }, []);

  const renderUploadControls = useCallback((field) => (
    <View style={styles.uploadRow}>
      <AppButton
        title={uploadingField === field ? 'Enviando...' : 'Camera'}
        onPress={() => handleUpload(field, 'camera')}
        variant="secondary"
        disabled={uploadingField.length > 0}
        style={styles.inlineButton}
      />
      <AppButton
        title={uploadingField === field ? 'Enviando...' : 'Galeria'}
        onPress={() => handleUpload(field, 'library')}
        variant="ghost"
        disabled={uploadingField.length > 0}
        style={styles.inlineButton}
      />
    </View>
  ), [handleUpload, uploadingField]);

  return (
    <ModuleTemplate
      navigation={navigation}
      title="Validacao de Identidade"
      subtitle="Etapa KYC"
      sections={[{
        title: 'Documentos',
        items: [
          { label: 'Documento', value: 'Frente e verso obrigatorios' },
          { label: 'Selfie', value: 'Obrigatoria' },
        ],
      }]}
      children={
        <AppCard>
          <Text style={styles.title}>Dados para envio</Text>
          <Text style={styles.helper}>
            Use as URLs retornadas por `POST /upload/image` para concluir o KYC.
          </Text>

          <TextInput
            value={documentType}
            onChangeText={setDocumentType}
            placeholder="Tipo do documento: rg ou cnh"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            value={documentNumber}
            onChangeText={setDocumentNumber}
            placeholder="Numero do documento"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            value={frontUrl}
            onChangeText={setFrontUrl}
            placeholder="URL da frente do documento"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />
          {renderUploadControls('frontUrl')}

          <TextInput
            value={backUrl}
            onChangeText={setBackUrl}
            placeholder="URL do verso do documento"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />
          {renderUploadControls('backUrl')}

          <TextInput
            value={selfieUrl}
            onChangeText={setSelfieUrl}
            placeholder="URL da selfie"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />
          {renderUploadControls('selfieUrl')}

          <TextInput
            value={proofUrl}
            onChangeText={setProofUrl}
            placeholder="URL do comprovante de residencia (opcional)"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoCapitalize="none"
          />
          {renderUploadControls('proofUrl')}
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
  uploadRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  inlineButton: {
    flex: 1,
    minHeight: 42,
  },
});
