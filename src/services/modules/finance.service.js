import api from '../api';

export const getFinanceDashboard = async (params = {}) => {
  const { data } = await api.get('/clinpro/finance/dashboard', { params });
  return data;
};

export const getFinanceTransactions = async (params = {}) => {
  const { data } = await api.get('/clinpro/finance/transactions', { params });
  return data;
};

export const getFinanceTransactionById = async (id) => {
  const { data } = await api.get(`/clinpro/finance/transactions/${id}`);
  return data;
};

export const getFinancePaymentById = async (id) => {
  const { data } = await api.get(`/clinpro/finance/payments/${id}`);
  return data;
};

export const getMeiSummary = async (params = {}) => {
  const { data } = await api.get('/clinpro/finance/mei/summary', { params });
  return data;
};

export const getAccountOverview = async () => {
  const { data } = await api.get('/clinpro/account/overview');
  return data;
};

export const getAccountStatus = async () => {
  const { data } = await api.get('/clinpro/account/status');
  return data;
};

export const getAccountProviderBalance = async () => {
  const { data } = await api.get('/clinpro/account/provider/balance');
  return data;
};

export const getAccountProviderFinancialTransactions = async (params = {}) => {
  const { data } = await api.get('/clinpro/account/provider/transactions/financialTransactions', { params });
  return data;
};

export const getAccountProviderPixKeys = async () => {
  const { data } = await api.get('/clinpro/account/provider/pix/addressKeys');
  return data;
};

export const createAccountProviderPixKey = async () => {
  const { data } = await api.post('/clinpro/account/provider/pix/addressKeys');
  return data;
};

export const deleteAccountProviderPixKey = async (id) => {
  const { data } = await api.delete(`/clinpro/account/provider/pix/addressKeys/${id}`);
  return data;
};

export const createAccount = async () => {
  const { data } = await api.post('/clinpro/account/create');
  return data;
};

export const updateAccountData = async (payload) => {
  const { data } = await api.post('/clinpro/account/update', payload);
  return data;
};

export const createAccountTransfer = async (payload) => {
  const { data } = await api.post('/clinpro/account/transfers', payload);
  return data;
};

export const identifyPixKeyType = (pixKey = '') => {
  const value = String(pixKey).trim();
  const digits = value.replace(/\D/g, '');

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'EMAIL';
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return 'EVP';
  }

  if (digits.length === 14) {
    return 'CNPJ';
  }

  if (digits.length === 11 && !value.startsWith('+')) {
    return 'CPF';
  }

  if (value.startsWith('+') || digits.length === 10 || (digits.length === 13 && digits.startsWith('55'))) {
    return 'PHONE';
  }

  return 'EVP';
};

export const verifyAccountTransferPixKey = async (pixKey) => {
  const normalizedPixKey = String(pixKey || '').trim();
  const { data } = await api.post('/clinpro/account/provider/transactions/pix-key/consult', {
    pix_key: normalizedPixKey,
    pix_key_type: identifyPixKeyType(normalizedPixKey),
  });
  return data;
};

export const sendAccountProviderPixTransfer = async (payload) => {
  const { data } = await api.post('/clinpro/account/provider/transactions/pix/send', payload);
  return data;
};

export const getAccountDetails = async () => {
  const { data } = await api.get('/clinpro/account/details');
  return data;
};

export const activateAccount = async (payload = { confirm: true }) => {
  const { data } = await api.post('/clinpro/account/activate', payload);
  return data;
};

export const savePagClinPassword = async (payload) => {
  const { data } = await api.post('/clinpro/account/pagClin/password', payload);
  return data;
};

export const validatePagClinPassword = async (payload) => {
  const { data } = await api.post('/clinpro/account/pagClin/password/validate', payload);
  return data;
};
