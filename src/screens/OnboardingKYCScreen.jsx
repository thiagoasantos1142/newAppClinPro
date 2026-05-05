import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ModuleTemplate from './shared/ModuleTemplate.jsx';
import { AppCard } from '../components/ui.jsx';
import { useOnboarding } from '../hooks/useOnboarding';
import {
  saveOnboardingDocuments,
  uploadOnboardingDocument,
} from '../services/modules/onboarding.service';
import { colors, radius } from '../theme/tokens';

const uploadCards = [
  {
    key: 'document_front',
    title: 'Documento com foto - frente',
    description: 'Envie uma foto nítida da frente do RG ou CNH.',
    icon: 'credit-card',
  },
  {
    key: 'document_back',
    title: 'Documento com foto - verso',
    description: 'Envie uma foto nítida do verso do RG ou CNH.',
    icon: 'credit-card',
  },
  {
    key: 'selfie',
    title: 'Selfie',
    description: 'Envie uma selfie para validar sua identidade.',
    icon: 'user-check',
  },
];

const documentPayloadFieldByType = {
  document_front: 'front_of_document',
  document_back: 'back_of_document',
  selfie: 'selfie',
};

export default function OnboardingKYCScreen({ navigation }) {
  const { status, completeStep, saving } = useOnboarding();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [localImages, setLocalImages] = useState({});
  const [uploads, setUploads] = useState({});
  const [uploadingKey, setUploadingKey] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [activeCameraKey, setActiveCameraKey] = useState(null);
  const cameraRef = useRef(null);

  const documentUploadIds = useMemo(
    () => [
      uploads.document_front?.path || uploads.document_front?.url,
      uploads.document_back?.path || uploads.document_back?.url,
      uploads.selfie?.path || uploads.selfie?.url,
    ].filter(Boolean),
    [uploads]
  );

  const canContinue = Boolean(status) && !saving && !uploadingKey && documentUploadIds.length === 3;

  const handleOpenCamera = useCallback(async (uploadKey) => {
    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();

    if (!permission.granted) {
      Alert.alert(
        'Permissao necessaria',
        'Autorize o acesso a camera para tirar a foto.'
      );
      return;
    }

    setActiveCameraKey(uploadKey);
  }, [cameraPermission, requestCameraPermission]);

  const handleTakePicture = useCallback(async () => {
    if (!cameraRef.current || !activeCameraKey || uploadingKey) {
      return;
    }

    const uploadKey = activeCameraKey;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        return;
      }

      setLocalImages((prev) => ({ ...prev, [uploadKey]: photo.uri }));
      setUploads((prev) => ({ ...prev, [uploadKey]: null }));
      setUploadErrors((prev) => ({ ...prev, [uploadKey]: null }));
      setUploadingKey(uploadKey);
      setActiveCameraKey(null);

      const uploadResult = await uploadOnboardingDocument({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        fileName: `${uploadKey}.jpg`,
        mimeType: 'image/jpeg',
      }, uploadKey);

      const documentUrl = uploadResult?.url || uploadResult?.thumb_url;
      const payloadField = documentPayloadFieldByType[uploadKey];
      if (documentUrl && payloadField) {
        await saveOnboardingDocuments({ [payloadField]: documentUrl });
      }

      setUploads((prev) => ({ ...prev, [uploadKey]: uploadResult }));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Nao foi possivel enviar a imagem. Tente selecionar novamente.';
      setUploadErrors((prev) => ({ ...prev, [uploadKey]: message }));
      setLocalImages((prev) => ({ ...prev, [uploadKey]: null }));
    } finally {
      setUploadingKey(null);
    }
  }, [activeCameraKey, uploadingKey]);

  const handleContinue = useCallback(async () => {
    try {
      if (!canContinue) {
        return;
      }
      await completeStep('kyc', {
        document_upload_ids: documentUploadIds,
      });
      navigation.navigate('OnboardingTutorial');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Nao foi possivel concluir esta etapa.';
      Alert.alert('Erro', message);
    }
  }, [canContinue, completeStep, navigation, documentUploadIds]);

  return (
    <>
      <ModuleTemplate
        navigation={navigation}
        title="Validação de Identidade"
        subtitle="Etapa KYC"
        backRoute="OnboardingSelectDayOfWeek"
        sections={[{
          title: 'Documentos',
          items: [
            { label: 'Frente do RG/CNH', value: 'Obrigatório' },
            { label: 'Verso do RG/CNH', value: 'Obrigatório' },
            { label: 'Selfie', value: 'Obrigatório' },
          ],
        }]}
        children={
        <View style={styles.uploadList}>
          {uploadCards.map((item) => {
            const isUploading = uploadingKey === item.key;
            const hasUpload = Boolean(uploads[item.key]?.path || uploads[item.key]?.url);
            const localUri = localImages[item.key];

            return (
              <AppCard key={item.key} style={styles.uploadCard}>
                <Pressable
                  onPress={() => handleOpenCamera(item.key)}
                  disabled={isUploading}
                  style={styles.uploadPressable}
                >
                  <View style={styles.preview}>
                    {localUri ? (
                      <Image source={{ uri: localUri }} style={styles.previewImage} />
                    ) : (
                      <Feather name={item.icon} size={34} color={colors.mutedForeground} />
                    )}
                  </View>

                  <View style={styles.uploadContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.helper}>{item.description}</Text>
                    <View style={styles.statusRow}>
                      {isUploading ? (
                        <>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Text style={styles.statusText}>Enviando imagem...</Text>
                        </>
                      ) : hasUpload ? (
                        <>
                          <Feather name="check-circle" size={16} color="#16A34A" />
                          <Text style={[styles.statusText, styles.statusSuccess]}>Imagem enviada</Text>
                        </>
                      ) : (
                        <>
                          <Feather name="camera" size={16} color={colors.primary} />
                          <Text style={styles.statusText}>Tirar foto</Text>
                        </>
                      )}
                    </View>
                    {uploadErrors[item.key] ? (
                      <Text style={styles.errorText}>{uploadErrors[item.key]}</Text>
                    ) : null}
                  </View>
                </Pressable>
              </AppCard>
            );
          })}
        </View>
        }
        actions={[{ label: 'Proximo', onPress: handleContinue, icon: 'arrow-right', disabled: !canContinue }]}
      />

      {activeCameraKey ? (
        <View style={styles.cameraOverlay}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={activeCameraKey === 'selfie' ? 'front' : 'back'}
          >
            <View style={styles.cameraTopBar}>
              <Pressable onPress={() => setActiveCameraKey(null)} style={styles.cameraIconButton}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.cameraTitle}>
                {uploadCards.find((item) => item.key === activeCameraKey)?.title || 'Tirar foto'}
              </Text>
              <View style={styles.cameraIconButtonPlaceholder} />
            </View>

            <View style={styles.cameraFrame}>
              <View style={styles.frameCornerTopLeft} />
              <View style={styles.frameCornerTopRight} />
              <View style={styles.frameCornerBottomLeft} />
              <View style={styles.frameCornerBottomRight} />
            </View>

            <View style={styles.cameraBottomBar}>
              <Text style={styles.cameraHelper}>Posicione a imagem dentro da moldura</Text>
              <Pressable onPress={handleTakePicture} style={styles.captureButton}>
                <View style={styles.captureButtonInner} />
              </Pressable>
            </View>
          </CameraView>
        </View>
      ) : null}
    </>
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
  },
  uploadList: {
    gap: 12,
  },
  uploadCard: {
    padding: 12,
  },
  uploadPressable: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  preview: {
    width: 86,
    height: 86,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(26, 62, 112, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadContent: {
    flex: 1,
  },
  statusRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  statusSuccess: {
    color: '#16A34A',
  },
  errorText: {
    marginTop: 8,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 16,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 20,
  },
  camera: {
    flex: 1,
  },
  cameraTopBar: {
    paddingTop: 48,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cameraFrame: {
    flex: 1,
    marginHorizontal: 28,
    marginVertical: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 18,
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 18,
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 42,
    height: 42,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 18,
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 42,
    height: 42,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 18,
  },
  cameraBottomBar: {
    paddingHorizontal: 18,
    paddingBottom: 34,
    alignItems: 'center',
  },
  cameraHelper: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
});
