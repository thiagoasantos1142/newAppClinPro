import api from '../api';

interface PingResponse {
  status: string;
}

export interface AccessSummaryResponse {
  [key: string]: unknown;
}

export const ping = async (): Promise<PingResponse> => {
  const { data } = await api.get<PingResponse>('/ping');
  return data;
};

export const getAccessSummary = async (): Promise<AccessSummaryResponse> => {
  const { data } = await api.get<AccessSummaryResponse>('/clinpro/access-summary');
  return data;
};
