import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL } from '../../config/env';
import api, { getAuthToken } from '../api';

export const getMyCertificates = async () => {
  const { data } = await api.get('/me/certificates');
  return data;
};

export const getCertificateById = async (id) => {
  const { data } = await api.get(`/certificates/${id}`);
  return data;
};

export const verifyCertificateByCode = async (verificationCode) => {
  const safeCode = encodeURIComponent(String(verificationCode || '').trim());
  const { data } = await api.get(`/certificates/verify/${safeCode}`);
  return data;
};

export const createCertificate = async (payload) => {
  const { data } = await api.post('/certificates', payload);
  return data;
};

export const downloadCertificateById = async (id) => {
  const certificateId = encodeURIComponent(String(id));
  const url = `${API_BASE_URL}/certificates/${certificateId}/download`;
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuário não autenticado para baixar certificado.');
  }

  const fileUri = `${FileSystem.cacheDirectory}certificate-${certificateId}-${Date.now()}.pdf`;

  const response = await FileSystem.downloadAsync(url, fileUri, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf',
    },
  });

  return {
    uri: response.uri,
    status: response.status,
  };
};

export const shareCertificateFile = async (fileUri) => {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return false;

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar certificado',
    UTI: 'com.adobe.pdf',
  });

  return true;
};
