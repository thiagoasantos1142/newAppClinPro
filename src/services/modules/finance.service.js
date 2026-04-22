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

export const getAccountDetails = async () => {
  const { data } = await api.get('/clinpro/account/details');
  return data;
};

export const activateAccount = async (payload = { confirm: true }) => {
  const { data } = await api.post('/clinpro/account/activate', payload);
  return data;
};
