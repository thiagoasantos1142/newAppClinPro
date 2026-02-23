export const IS_DEV = __DEV__;

export const API_BASE_URL = IS_DEV
  ? 'http://192.168.0.252:8000/api'
  : 'https://api.clinpro.com/api';
