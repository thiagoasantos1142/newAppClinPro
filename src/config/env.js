export const IS_DEV = __DEV__;

export const API_BASE_URL = IS_DEV
  ? 'https://sandbox.api.clin.com.br/api'
  : 'https://api.clinpro.com/api';
